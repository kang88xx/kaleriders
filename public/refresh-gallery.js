import { fixedLayout } from './gallery-fixed/layouts.js';

const copy = {
  ko: { hint: '사진을 눌러 크게 보세요.', toggle: '눌러서 펼치거나 접기', gallery: '행사 사진 갤러리' },
  en: { hint: 'Select a photo to take a closer look.', toggle: 'Select to expand or collapse', gallery: 'Event photo gallery' },
};

export function initRefreshGallery(grid, photos, doc = document) {
  const view = doc.defaultView;
  const reducedMotion = view.matchMedia('(prefers-reduced-motion: reduce)');
  let language = doc.documentElement.lang.startsWith('en') ? 'en' : 'ko';
  let selected = -1;
  let animations = [];
  let transitionVersion = 0;
  let firstLayout = true;
  let lastWidth = 0;
  let lastCompact = false;
  let autoplayTimer = null;
  let autoplayStarted = false;
  let inView = false;
  let hovered = false;
  let focused = false;
  let manualPause = false;

  grid.classList.add('rg-gallery');
  grid.setAttribute('role', 'group');
  const status = doc.createElement('p');
  status.className = 'rg-status visually-hidden';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  grid.before(status);

  // The wall draws small files (photo.thumb); only an opened photo loads its full file.
  const small = photo => new URL(photo.thumb || photo.src, import.meta.url).href;
  // Original tiles fill the spaces exposed while the larger frame moves into place.
  const underlay = doc.createElement('div');
  underlay.className = 'rg-underlay';
  underlay.setAttribute('aria-hidden', 'true');
  underlay.inert = true;
  underlay.hidden = true;
  photos.forEach(photo => {
    const image = doc.createElement('img');
    image.src = small(photo);
    image.alt = '';
    image.decoding = 'async';
    if (photo.position) image.style.objectPosition = photo.position;
    underlay.append(image);
  });
  grid.replaceChildren(underlay);
  const tiles = photos.map((photo, index) => {
    const tile = doc.createElement('button');
    tile.type = 'button';
    tile.className = 'rm-tile';
    tile.dataset.photoIndex = String(index);
    const image = doc.createElement('img');
    image.src = small(photo);
    image.loading = 'lazy';
    image.decoding = 'async';
    if (photo.position) image.style.objectPosition = photo.position;
    tile.append(image);
    grid.append(tile);
    tile.addEventListener('click', () => {
      manualPause = true;
      syncAutoplay();
      selected === index ? close() : open(index);
    });
    return tile;
  });

  function layout(animate = true) {
    const width = grid.clientWidth;
    if (width <= 0) return;
    const version = ++transitionVersion;
    const bounds = grid.getBoundingClientRect();
    const before = tiles.map(tile => {
      const rect = tile.getBoundingClientRect();
      return { x: rect.left - bounds.left, y: rect.top - bounds.top, width: rect.width, height: rect.height, opacity: Number(view.getComputedStyle(tile).opacity) };
    });
    animations.forEach(animation => animation.cancel());
    animations = [];
    const compact = view.innerWidth <= 600;
    const next = fixedLayout({ width, count: tiles.length, selected, compact, mode: 'push' });
    grid.style.height = `${next.height}px`;
    grid.classList.toggle('rg-open', selected >= 0);
    underlay.style.gridTemplateColumns = `repeat(${next.columns},minmax(0,1fr))`;
    underlay.style.gridTemplateRows = `repeat(${next.rows},minmax(0,1fr))`;
    const moving = animate && !firstLayout && !reducedMotion.matches;
    underlay.hidden = !moving;
    tiles.forEach((tile, index) => {
      const rect = next.rects[index];
      Object.assign(tile.style, { left: `${rect.x}px`, top: `${rect.y}px`, width: `${rect.width}px`, height: `${rect.height}px`, opacity: rect.visible ? '1' : '0' });
      tile.classList.toggle('is-open', index === selected);
      tile.dataset.visible = String(rect.visible);
      tile.setAttribute('aria-pressed', String(index === selected));
      tile.setAttribute('aria-hidden', String(!rect.visible));
      tile.tabIndex = rect.visible ? 0 : -1;
      tile.inert = !rect.visible;
      if (!moving) return;
      const old = before[index];
      if (old.width <= 0) return;
      if (!rect.visible) {
        if (old.opacity > .001) animations.push(tile.animate([
          { left: `${old.x}px`, top: `${old.y}px`, width: `${old.width}px`, height: `${old.height}px`, opacity: old.opacity },
          { left: `${old.x}px`, top: `${old.y}px`, width: `${old.width}px`, height: `${old.height}px`, opacity: 0 },
        ], { duration: 160, easing: 'ease-out' }));
        return;
      }
      const timing = { duration: 680, easing: 'cubic-bezier(.4,0,.2,1)' };
      if (Math.abs(old.width - rect.width) > .1 || Math.abs(old.height - rect.height) > .1) {
        animations.push(tile.animate([
          { left: `${old.x}px`, top: `${old.y}px`, width: `${old.width}px`, height: `${old.height}px`, opacity: old.opacity },
          { left: `${rect.x}px`, top: `${rect.y}px`, width: `${rect.width}px`, height: `${rect.height}px`, opacity: 1 },
        ], timing));
      } else {
        const dx = old.x - rect.x, dy = old.y - rect.y;
        if (Math.abs(dx) + Math.abs(dy) < .1 && old.opacity > .999) return;
        animations.push(tile.animate([
          { transform: `translate(${dx}px,${dy}px)`, opacity: old.opacity },
          { transform: 'none', opacity: 1 },
        ], timing));
      }
    });
    if (!animations.length) underlay.hidden = true;
    else Promise.all(animations.map(animation => animation.finished.catch(() => {}))).then(() => {
      if (version === transitionVersion) underlay.hidden = true;
    });
    lastWidth = width;
    lastCompact = compact;
    firstLayout = false;
  }

  function updateStatus() {
    const text = copy[language];
    status.textContent = selected < 0 ? text.hint : `${String(selected + 1).padStart(String(photos.length).length, '0')} / ${photos.length} · ${photos[selected].alt[language]}`;
  }
  // Swap the opened tile to its full file once that file has loaded, so the small one stays
  // on screen until then. A closed tile goes back to its small file after it has shrunk, so a
  // long autoplay session never holds more than a couple of full files.
  function sharpen(index) {
    const photo = photos[index];
    const image = tiles[index].firstElementChild;
    if (!photo.thumb || image.dataset.full) return;
    const url = new URL(photo.src, import.meta.url).href;
    image.dataset.full = 'loading';
    if (!view.Image) { image.src = url; image.dataset.full = 'true'; return; }
    const full = new view.Image();
    full.decoding = 'async';
    full.onload = () => {
      if (selected !== index) { delete image.dataset.full; return; }
      image.src = url;
      image.dataset.full = 'true';
    };
    full.onerror = () => { delete image.dataset.full; };
    full.src = url;
  }
  function soften(index) {
    if (index < 0 || !photos[index].thumb) return;
    view.setTimeout(() => {
      if (selected === index) return;
      const image = tiles[index].firstElementChild;
      if (image.dataset.full === 'true') image.src = small(photos[index]);
      delete image.dataset.full;
    }, 800);
  }
  function open(index, focus = false) {
    if (!tiles.length) return;
    const previous = selected;
    selected = (index + tiles.length) % tiles.length;
    if (previous !== selected) soften(previous);
    sharpen(selected);
    layout();
    updateStatus();
    if (focus) tiles[selected].focus({ preventScroll: true });
  }
  function close(restoreFocus = false) {
    if (selected < 0) return;
    const tile = tiles[selected];
    soften(selected);
    selected = -1;
    layout();
    updateStatus();
    if (restoreFocus) tile.focus({ preventScroll: true });
  }
  function updateLanguage(value) {
    language = value === 'en' ? 'en' : 'ko';
    grid.setAttribute('aria-label', copy[language].gallery);
    tiles.forEach((tile, index) => {
      const alt = photos[index].alt[language];
      tile.firstElementChild.alt = alt;
      tile.setAttribute('aria-label', `${index + 1}/${photos.length} · ${alt} · ${copy[language].toggle}`);
    });
    updateStatus();
  }

  function showRandomPhoto() {
    const currentSource = selected >= 0 ? photos[selected].src : null;
    const candidates = photos.flatMap((photo, index) => photo.src !== currentSource ? [index] : []);
    if (candidates.length) open(candidates[Math.floor(Math.random() * candidates.length)]);
  }
  function syncAutoplay() {
    view.clearTimeout(autoplayTimer);
    autoplayTimer = null;
    const state = reducedMotion.matches ? 'reduced-motion'
      : doc.hidden ? 'hidden'
      : !inView ? 'offscreen'
      : hovered || focused || manualPause ? 'paused'
      : 'running';
    grid.dataset.autoplay = state;
    // Automatic changes should not interrupt a screen reader every two seconds.
    status.setAttribute('aria-live', state === 'running' ? 'off' : 'polite');
    if (state !== 'running' || !photos.length) return;
    if (!autoplayStarted) {
      autoplayStarted = true;
      if (selected < 0) showRandomPhoto();
    }
    autoplayTimer = view.setTimeout(() => {
      autoplayTimer = null;
      if (!inView || doc.hidden || reducedMotion.matches || hovered || focused || manualPause) {
        syncAutoplay();
        return;
      }
      showRandomPhoto();
      syncAutoplay();
    }, 2000);
  }

  grid.addEventListener('pointerenter', event => {
    if (event.pointerType === 'touch') return;
    hovered = true;
    syncAutoplay();
  });
  grid.addEventListener('pointerleave', () => {
    hovered = false;
    manualPause = false;
    syncAutoplay();
  });
  grid.addEventListener('focusin', () => {
    focused = true;
    syncAutoplay();
  });
  grid.addEventListener('focusout', event => {
    if (grid.contains(event.relatedTarget)) return;
    focused = false;
    manualPause = false;
    syncAutoplay();
  });
  new view.IntersectionObserver(entries => {
    const entry = entries[entries.length - 1];
    inView = entry.isIntersecting && entry.intersectionRatio >= .2;
    if (!inView) manualPause = false;
    syncAutoplay();
  }, { threshold: [0, .2] }).observe(grid);
  doc.addEventListener('visibilitychange', syncAutoplay);

  doc.addEventListener('click', event => {
    if (!grid.contains(event.target) && !event.target.closest('[data-language]')) {
      manualPause = false;
      close();
      syncAutoplay();
    }
  });
  doc.addEventListener('keydown', event => {
    if (selected < 0) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      manualPause = true;
      syncAutoplay();
      close(true);
    }
    else if (grid.contains(doc.activeElement) && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
      manualPause = true;
      syncAutoplay();
      open(selected + (event.key === 'ArrowRight' ? 1 : -1), true);
    }
  });
  new view.ResizeObserver(() => {
    if (grid.clientWidth !== lastWidth || (view.innerWidth <= 600) !== lastCompact) layout(false);
  }).observe(grid);
  view.addEventListener('resize', () => {
    if (grid.clientWidth !== lastWidth || (view.innerWidth <= 600) !== lastCompact) layout(false);
  });
  reducedMotion.addEventListener('change', () => {
    layout(false);
    syncAutoplay();
  });
  updateLanguage(language);
  layout(false);
  syncAutoplay();
  grid.dataset.galleryReady = 'true';
  return { updateLanguage };
}
