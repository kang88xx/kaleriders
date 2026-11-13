import { fixedLayout } from './gallery-fixed/layouts.js?v=mobile-20261113';

const copy = {
  ko: { hint: '사진을 눌러 크게 보세요.', toggle: '눌러서 크게 보기', gallery: '행사 사진 갤러리' },
  en: { hint: 'Select a photo to take a closer look.', toggle: 'Select to enlarge', gallery: 'Event photo gallery' },
};

// Phones show only the first `compactCount` tiles; the rest of `photos` fills the wide wall.
export function initRefreshGallery(grid, photos, doc = document, { compactCount = photos.length } = {}) {
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
  let inView = false;
  let hovered = false;
  let focused = false;
  let manualPause = false;
  let holdTimer = null;
  // Whether focus came from the keyboard; browsers without :focus-visible throw on the selector.
  const keyboardFocus = element => { try { return element.matches?.(':focus-visible') ?? true; } catch { return true; } };
  // Tiles in use at the current width.
  const isCompact = () => view.innerWidth <= 600;
  const inUse = () => (isCompact() ? Math.min(compactCount, photos.length) : photos.length);

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
      // A pressed photo stays for four seconds (a touch has no pointer left over the wall to hold
      // it); with a mouse it also stays while the pointer is on the wall.
      manualPause = true;
      view.clearTimeout(holdTimer);
      holdTimer = view.setTimeout(() => {
        if (!manualPause) return; // the pointer left earlier and the wall is already playing
        manualPause = false;
        syncAutoplay();
      }, 4000);
      syncAutoplay();
      if (selected !== index) open(index);
    });
    return tile;
  });

  function layout(animate = true) {
    const width = grid.clientWidth;
    if (width <= 0) return;
    // A photo that phones do not show closes when the wall narrows.
    if (selected >= inUse()) { soften(selected); selected = -1; }
    const version = ++transitionVersion;
    const bounds = grid.getBoundingClientRect();
    const before = tiles.map(tile => {
      const rect = tile.getBoundingClientRect();
      return { x: rect.left - bounds.left, y: rect.top - bounds.top, width: rect.width, height: rect.height, opacity: Number(view.getComputedStyle(tile).opacity) };
    });
    animations.forEach(animation => animation.cancel());
    animations = [];
    const compact = isCompact();
    const used = inUse();
    const next = fixedLayout({ width, count: used, selected, compact, mode: 'push' });
    [...underlay.children].forEach((image, index) => { image.style.display = index >= used ? 'none' : ''; });
    grid.style.height = `${next.height}px`;
    grid.classList.toggle('rg-open', selected >= 0);
    underlay.style.gridTemplateColumns = `repeat(${next.columns},minmax(0,1fr))`;
    underlay.style.gridTemplateRows = `repeat(${next.rows},minmax(0,1fr))`;
    const moving = animate && !firstLayout && !reducedMotion.matches;
    underlay.hidden = !moving;
    tiles.forEach((tile, index) => {
      tile.style.display = index >= used ? 'none' : '';
      if (index >= used) {
        tile.classList.toggle('is-open', false);
        tile.setAttribute('aria-pressed', 'false');
        return;
      }
      const rect = next.rects[index];
      Object.assign(tile.style, { left: `${rect.x}px`, top: `${rect.y}px`, width: `${rect.width}px`, height: `${rect.height}px`, opacity: rect.visible ? '1' : '0' });
      tile.classList.toggle('is-open', index === selected);
      tile.dataset.visible = String(rect.visible);
      tile.setAttribute('aria-pressed', String(index === selected));
      tile.setAttribute('aria-label', tileLabel(index));
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
      const timing = { duration: 520, easing: 'cubic-bezier(.4,0,.2,1)' };
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
    const relabel = !firstLayout && compact !== lastCompact;
    // A hidden tile cannot report losing focus, so autoplay would stay paused.
    const lostFocus = tiles.indexOf(doc.activeElement) >= used;
    lastWidth = width;
    lastCompact = compact;
    firstLayout = false;
    if (relabel) updateLanguage(language);
    if (lostFocus) {
      focused = false;
      manualPause = false;
      syncAutoplay();
    }
  }

  function updateStatus() {
    const text = copy[language];
    status.textContent = selected < 0 ? text.hint : `${String(selected + 1).padStart(String(inUse()).length, '0')} / ${inUse()} · ${photos[selected].alt[language]}`;
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
    selected = (index + inUse()) % inUse();
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
  // The opened photo is already enlarged, so only the others say that a press enlarges them.
  const tileLabel = index => `${index + 1}/${inUse()} · ${photos[index].alt[language]}${index === selected ? '' : ` · ${copy[language].toggle}`}`;
  function updateLanguage(value) {
    language = value === 'en' ? 'en' : 'ko';
    grid.setAttribute('aria-label', copy[language].gallery);
    tiles.forEach((tile, index) => {
      const alt = photos[index].alt[language];
      tile.firstElementChild.alt = alt;
      tile.setAttribute('aria-label', tileLabel(index));
    });
    updateStatus();
  }

  function showRandomPhoto() {
    const currentSource = selected >= 0 ? photos[selected].src : null;
    const candidates = photos.slice(0, inUse()).flatMap((photo, index) => photo.src !== currentSource ? [index] : []);
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
    // Automatic changes should not interrupt a screen reader every second and a half.
    status.setAttribute('aria-live', state === 'running' ? 'off' : 'polite');
    if (state !== 'running' || !photos.length) return;
    // The wall never sits with every photo closed while it plays: on the first run, and after
    // Escape or a narrower layout closed the photo, one opens at once.
    if (selected < 0) showRandomPhoto();
    else sharpen(selected);
    view.clearTimeout(autoplayTimer); // opening a photo above can come back through here
    autoplayTimer = view.setTimeout(() => {
      autoplayTimer = null;
      if (!inView || doc.hidden || reducedMotion.matches || hovered || focused || manualPause) {
        syncAutoplay();
        return;
      }
      showRandomPhoto();
      syncAutoplay();
    }, 1540);
  }

  grid.addEventListener('pointerenter', event => {
    if (event.pointerType === 'touch') return;
    hovered = true;
    grid.classList.toggle('rg-pointer', true); // lets small photos turn lime under a mouse, never after a tap
    syncAutoplay();
  });
  grid.addEventListener('pointerleave', event => {
    if (event?.pointerType === 'touch') return;
    hovered = false;
    grid.classList.toggle('rg-pointer', false);
    manualPause = false;
    syncAutoplay();
  });
  grid.addEventListener('focusin', event => {
    // A tile pressed with the pointer keeps focus after the pointer has left, which used to leave
    // the wall paused until a click elsewhere. Only focus from the keyboard holds it.
    focused = keyboardFocus(event.target);
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

  doc.addEventListener('keydown', event => {
    // The keys act only for a visitor who is in the wall. A photo is now open nearly all the time,
    // so without this Escape anywhere on the page was swallowed here (the inquiry dialog did not
    // close on the first press) and focus was pulled into the wall.
    if (selected < 0 || event.defaultPrevented || !grid.contains(doc.activeElement)) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      manualPause = true;
      syncAutoplay();
      close(true);
    }
    else if (['ArrowLeft', 'ArrowRight'].includes(event.key)) {
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
  // One photo is open from the start (drawn from its small file until the wall is on screen), so
  // the wall is not seen with every photo bright and then dimming. Reduced motion keeps it closed.
  if (!reducedMotion.matches && photos.length) selected = Math.floor(Math.random() * inUse());
  updateLanguage(language);
  layout(false);
  syncAutoplay();
  grid.dataset.galleryReady = 'true';
  return { updateLanguage };
}
