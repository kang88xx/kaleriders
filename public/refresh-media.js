import { caseStudies } from './case-studies-data.js';
import { initRefreshGallery } from './refresh-gallery.js?v=wall-180-20261112';
import { addedWallPhotos } from './wall-photos.js?v=wall-180-20261112';

const assetURL = path => new URL(path, import.meta.url).href;
const copy = (ko, en) => ({ ko, en });

// Event photos shown on the photo wall only, so they are not attached to a case story. The first
// sixteen were supplied by the owner (other KGEN and Axis Robotics events, Momentum × Buidlpad's
// Keep The Mo'mentum, the Aria meetup and FOGO). The rest, added on 2026-11-12, are listed in
// wall-photos.js. Faces close to the camera are pixelated.
// `position` is an optional CSS object-position for a subject that sits off-center.
const suppliedWallPhotos = [
  { src: 'assets/cases/kgen/after-hours-talk.jpg', alt: copy('KGEN VeriFi Seoul After Hours에서 발표를 듣는 참석자들', 'Attendees watching a presentation at KGEN VeriFi Seoul After Hours') },
  { src: 'assets/cases/kgen/after-hours-banner.jpg', alt: copy('행사명과 날짜가 표시된 KGEN VeriFi Seoul After Hours 거리 배너', 'KGEN VeriFi Seoul After Hours street banner showing the event name and date') },
  { src: 'assets/cases/kgen/booth.jpg', position: '50% 88%', alt: copy('KGEN 부스와 텔레그램 채널 안내 배너', 'KGEN booth with a banner for its Telegram channel') },
  { src: 'assets/cases/axis-robotics/booth.jpg', alt: copy('Axis Robotics 부스와 소개 배너, 로봇 팔 영상이 나오는 모니터', 'Axis Robotics booth with an introduction banner and a monitor showing a robot arm') },
  { src: 'assets/cases/momentum/stage.jpg', alt: copy('Momentum × Buidlpad “Keep The Mo’mentum” 무대에서 발표하는 모습', 'A talk on the Keep The Mo’mentum stage, hosted by Momentum with Buidlpad') },
  { src: 'assets/cases/momentum/audience-1.jpg', alt: copy('Keep The Mo’mentum 행사장을 채운 참석자들', 'Attendees filling the Keep The Mo’mentum venue') },
  { src: 'assets/cases/momentum/audience-2.jpg', alt: copy('Keep The Mo’mentum 객석과 뒤편에 선 참석자들', 'Seated and standing attendees at Keep The Mo’mentum') },
  { src: 'assets/cases/momentum/audience-3.jpg', alt: copy('Keep The Mo’mentum 발표를 기다리는 객석', 'The audience waiting for the next Keep The Mo’mentum talk') },
  { src: 'assets/cases/aria/audience-panel.jpg', alt: copy('Aria 밋업 패널 토크를 듣는 참석자들', 'Attendees listening to a panel at the Aria meetup') },
  { src: 'assets/cases/aria/stage.jpg', alt: copy('Aria 밋업에서 $ARIAIP를 소개하는 발표', 'A presentation introducing $ARIAIP at the Aria meetup') },
  { src: 'assets/cases/aria/entrance.jpg', alt: copy('Aria 밋업 입구에 모인 참석자들', 'Attendees gathered at the Aria meetup entrance') },
  { src: 'assets/cases/aria/queue.jpg', alt: copy('Aria 밋업 입장을 기다리는 거리의 대기 줄', 'A queue on the street waiting to enter the Aria meetup') },
  { src: 'assets/cases/fogo/mainnet-photo-zone.jpg', alt: copy('FOGO Mainnet Party 포토존: 환영 배너와 굿즈 티셔츠·모자를 걸어 둔 의자', 'FOGO Mainnet Party photo zone: a welcome banner with merch T-shirts and a cap on two chairs') },
  { src: 'assets/cases/fogo/mainnet-networking.jpg', alt: copy('FOGO Mainnet Party 행사장에서 이야기를 나누는 참석자들', 'Attendees talking at the FOGO Mainnet Party venue') },
  { src: 'assets/cases/fogo/meetup-venue.jpg', alt: copy('Korea FOGO Meet Up 행사장: 벽에 비춘 FOGO 로고와 굿즈 테이블', 'Korea FOGO Meet Up venue: the FOGO logo projected on the wall beside the merch table') },
  { src: 'assets/cases/fogo/meetup-goods.jpg', alt: copy('Korea FOGO Meet Up 굿즈 테이블에 놓인 선글라스와 참가자 이름표', 'Sunglasses and attendee name badges on the Korea FOGO Meet Up merch table') },
];
export const wallPhotos = [...suppliedWallPhotos, ...addedWallPhotos];

// The wall draws a small copy of each photo (short side 200px) kept beside the full file under
// assets/cases/thumbs/; an opened photo loads the full file.
export const thumbOf = src => src.replace('assets/cases/', 'assets/cases/thumbs/').replace(/\.[a-z]+$/i, '.jpg');

// Every case photo plus the wall-only additions, each listed once.
export const wallPool = [
  ...caseStudies.flatMap(item => [
    ...(item.media.type === 'image' ? [item.media] : []),
    ...item.gallery.map(media => ({ type: 'image', ...media })),
  ]),
  ...wallPhotos,
].map(photo => ({ ...photo, thumb: thumbOf(photo.src) }));

// The film row under the wall, by case. A case whose own media is a photo supplies its film here:
// the KGEN after-movie the owner sent on 2026-11-12, re-encoded for the web from the 4K original.
export const eventFilms = [
  { id: 'fogo-mainnet' },
  { id: 'fogo-meetup' },
  { id: 'kgen', media: { type: 'video', src: 'assets/cases/kgen/after-movie.mp4', poster: 'assets/cases/kgen/after-movie.jpg', alt: copy('KGEN · VeriFi Korea 현장 애프터무비', 'KGEN · VeriFi Korea event after-movie') } },
];

// Put the pool on the wall in a fixed mixed order. By default every photo appears once, so the
// pool size must fill whole rows at 20 and 10 columns. With a larger count each further pass
// uses every photo once more, avoiding the photo on the previous tile and on the tiles 10 and
// 20 places back (the tile above at 10 and 20 columns). A fixed seed keeps the composition
// stable between visits and languages.
export function arrangeWall(photos = wallPool, count = photos.length) {
  let seed = 20261106;
  const gallery = [];
  while (gallery.length < count && photos.length) {
    const remaining = [...photos];
    while (remaining.length && gallery.length < count) {
      const neighbors = [1, 10, 20].map(offset => gallery[gallery.length - offset]?.src);
      const candidates = remaining.map((photo, index) => ({ photo, index })).filter(({ photo }) => !neighbors.includes(photo.src));
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const pool = candidates.length ? candidates : remaining.map((photo, index) => ({ photo, index }));
      const chosen = pool[seed % pool.length];
      gallery.push(chosen.photo);
      remaining.splice(chosen.index, 1);
    }
  }
  return gallery;
}

export function initRefreshMedia(doc = document) {
  const galleryRoot = doc.getElementById('refresh-gallery-root');
  const friendsRoot = doc.getElementById('refresh-friends-root');
  if (!galleryRoot || !friendsRoot || galleryRoot.dataset.ready === 'true') return;
  galleryRoot.replaceChildren();
  friendsRoot.replaceChildren();

  const bindings = [];
  const element = (tag, className, parent, text) => {
    const node = doc.createElement(tag);
    if (className) node.className = className;
    if (text) {
      if (typeof text === 'string') node.textContent = text;
      else bindings.push(language => { node.textContent = text[language]; });
    }
    parent.append(node);
    return node;
  };
  const attribute = (node, name, text) => bindings.push(language => node.setAttribute(name, text[language]));
  const mediaElement = (media, parent, label = media.alt) => {
    if (media.type === 'video') {
      const video = element('video', 'rm-video', parent);
      video.controls = true;
      video.playsInline = true;
      video.preload = 'none';
      video.poster = assetURL(media.poster);
      video.src = assetURL(media.src);
      // All current source films are 1280 × 720; adapt if a replacement differs.
      video.addEventListener('loadedmetadata', () => {
        if (video.videoWidth && video.videoHeight) {
          parent.style.aspectRatio = `${video.videoWidth} / ${video.videoHeight}`;
        }
      });
      attribute(video, 'aria-label', label);
      const fallback = element('a', '', video, copy('영상 파일 열기', 'Open video file'));
      fallback.href = assetURL(media.src);
      const playButton = element('button', 'rm-video-launch', parent);
      playButton.type = 'button';
      attribute(playButton, 'aria-label', copy(`영상 재생: ${label.ko}`, `Play video: ${label.en}`));
      const poster = element('img', 'rm-play-poster', playButton);
      poster.src = assetURL(media.poster);
      poster.alt = '';
      poster.loading = 'lazy';
      poster.decoding = 'async';
      const playIcon = element('span', 'rm-play-icon', playButton);
      playIcon.setAttribute('aria-hidden', 'true');
      element('span', '', playIcon);
      const playError = element('div', 'rm-play-error', parent);
      playError.hidden = true;
      playError.setAttribute('role', 'status');
      element('span', '', playError, copy('재생하지 못했어요. 다시 시도하거나 파일을 열어주세요.', 'Playback failed. Try again or open the video file.'));
      const errorLink = element('a', '', playError, copy('영상 파일 열기 ↗', 'Open video file ↗'));
      errorLink.href = assetURL(media.src);
      errorLink.target = '_blank';
      errorLink.rel = 'noopener noreferrer';
      const showPlayError = () => {
        playButton.hidden = false;
        playError.hidden = false;
        if (doc.activeElement === video) playButton.focus({ preventScroll: true });
      };
      playButton.addEventListener('click', async () => {
        playButton.hidden = true;
        playError.hidden = true;
        video.focus({ preventScroll: true });
        try { await video.play(); } catch { showPlayError(); }
      });
      video.addEventListener('error', showPlayError);
      video.addEventListener('play', () => {
        playButton.hidden = true;
        playError.hidden = true;
        [galleryRoot, friendsRoot].forEach(root => root.querySelectorAll('video').forEach(other => {
          if (other !== video && !other.paused) other.pause();
        }));
      });
      return video;
    }
  };

  const byId = Object.fromEntries(caseStudies.map(item => [item.id, item]));
  const gallery = arrangeWall();

  const heading = element('div', 'rm-heading', galleryRoot);
  const headingCopy = element('div', '', heading);
  const galleryTitle = element('h2', '', headingCopy, copy('함께 만든 순간들.', 'People we brought together.'));
  galleryTitle.id = 'work-title';
  const grid = element('div', 'rm-gallery', galleryRoot);
  const photoGallery = initRefreshGallery(grid, gallery, doc);
  bindings.push(language => photoGallery.updateLanguage(language));

  const films = element('section', 'rm-films', galleryRoot);
  films.setAttribute('aria-labelledby', 'rm-films-title');
  const filmsHeading = element('div', 'rm-heading rm-films-heading', films);
  const filmsHeadingCopy = element('div', '', filmsHeading);
  const filmsTitle = element('h3', '', filmsHeadingCopy, copy('현장의 온도, 그대로.', 'A look inside the events.'));
  filmsTitle.id = 'rm-films-title';
  const filmsGrid = element('div', 'rm-event-videos', films);
  eventFilms.forEach(({ id, media }) => {
    const item = byId[id];
    const article = element('article', 'rm-event-film', filmsGrid);
    article.setAttribute('aria-labelledby', `rm-film-title-${id}`);
    const frame = element('div', 'rm-event-frame rm-video-frame', article);
    mediaElement(media || item.media, frame);
    const caption = element('div', 'rm-film-caption', article);
    const title = element('h4', '', caption, item.title);
    title.id = `rm-film-title-${id}`;
    element('p', '', caption, copy('행사 리캡 영상', 'Event recap'));
  });

  const friendsShell = element('div', 'rm-friends-shell', friendsRoot);
  const friendsHeading = element('div', 'rm-heading', friendsShell);
  const friendsHeadingCopy = element('div', '', friendsHeading);
  const friendsTitle = element('h2', '', friendsHeadingCopy, copy('함께 달려온 친구들.', 'People we’ve worked with.'));
  friendsTitle.id = 'friends-title';
  element('p', 'rm-intro', friendsHeading, copy('같은 목표로 만나, 함께 만든 이야기.\n응원 영상과 후기 예시를 담았습니다.', 'Example video messages and testimonials\nfrom project partners and participants.'));

  const attribution = (parent, initial, title, note) => {
    const author = element('div', 'rm-testimonial-author', parent);
    const avatar = element('span', 'rm-testimonial-avatar', author, initial);
    avatar.setAttribute('aria-hidden', 'true');
    const details = element('div', '', author);
    const name = element('p', 'rm-testimonial-name', details, title);
    element('p', 'rm-testimonial-role', details, note);
    return name;
  };
  const featured = element('article', 'rm-testimonial-feature', friendsShell);
  featured.setAttribute('aria-labelledby', 'rm-testimonial-title');
  const featuredMedia = element('div', 'rm-testimonial-media', featured);
  const frame = element('div', 'rm-testimonial-frame rm-video-frame', featuredMedia);
  mediaElement(byId['fogo-mainnet'].media, frame, copy('응원 영상 자리 — FOGO 행사 영상 샘플', 'Video message placeholder: sample FOGO event footage'));
  element('span', 'rm-sample-badge', frame, copy('행사 영상 샘플', 'SAMPLE EVENT FOOTAGE'));
  const videoCaption = element('div', 'rm-testimonial-video-caption', featuredMedia);
  element('span', '', videoCaption, 'FOGO Mainnet Party');
  element('span', '', videoCaption, copy('응원 영상으로 교체 예정', 'Video message to come'));
  const featuredCopy = element('div', 'rm-testimonial-copy', featured);
  element('p', 'rm-testimonial-sample', featuredCopy, copy('SAMPLE / 예시 문구', 'SAMPLE / EXAMPLE COPY'));
  const featuredTitle = element('h3', '', featuredCopy, copy('같은 방향으로,\n함께 달리는 팀.', 'Working toward the same goal.\nAs one team.'));
  featuredTitle.id = 'rm-testimonial-title';
  element('blockquote', 'rm-testimonial-quote', featuredCopy, copy('“처음의 아이디어부터 현장의 마지막 순간까지, 함께 고민하고 움직이는 과정이 좋았습니다.”', '“We appreciated working through the details together, from the first idea to the end of the event.”'));
  attribution(featuredCopy, 'P', copy('프로젝트 파트너', 'Project partner'), copy('파트너 응원 메시지 예시', 'Example partner message'));

  const friendsGrid = element('div', 'rm-friends-grid rm-testimonial-grid', friendsShell);
  const friends = [
    { initial: 'P', title: copy('프로젝트 파트너', 'Project partner'), quote: copy('“한국 시장에서 무엇부터 시작할지, 함께 이야기하며 방향을 찾을 수 있었습니다.”', '“Talking it through together helped us decide where to start in Korea.”'), role: copy('파트너 협업 후기 예시', 'Example partner testimonial') },
    { initial: 'C', title: copy('크리에이터', 'Creator'), quote: copy('“프로젝트의 이야기를 우리만의 콘텐츠로 풀어가는 과정이 즐거웠습니다.”', '“We enjoyed finding our own way to tell the project’s story.”'), role: copy('크리에이터 협업 후기 예시', 'Example creator testimonial') },
    { initial: 'K', title: copy('커뮤니티 친구들', 'Community friends'), quote: copy('“온라인에서 나누던 이야기가 현장에서 새로운 만남으로 이어졌습니다.”', '“We got to meet people we’d been talking to online.”'), role: copy('커뮤니티 참여 후기 예시', 'Example community testimonial') },
  ];
  friends.forEach((friend, index) => {
    const article = element('article', 'rm-friend rm-testimonial-card', friendsGrid);
    article.setAttribute('aria-labelledby', `rm-friend-title-${index}`);
    element('p', 'rm-testimonial-sample', article, copy('SAMPLE / 예시 문구', 'SAMPLE / EXAMPLE COPY'));
    element('blockquote', 'rm-testimonial-quote', article, friend.quote);
    attribution(article, friend.initial, friend.title, friend.role).id = `rm-friend-title-${index}`;
  });

  const updateLanguage = language => bindings.forEach(bind => bind(language === 'en' ? 'en' : 'ko'));
  updateLanguage(doc.documentElement.lang);
  doc.addEventListener('languagechange', event => updateLanguage(event.detail.language));
  galleryRoot.dataset.ready = 'true';
  friendsRoot.dataset.ready = 'true';
}
