// Section copy and the six services shown by the services infographic.
// Each service has a name, one short line, its three steps and a sign in its circle: a line icon
// (`icon`; three people, a page with a bar chart and a parachute carrying a token are drawn for
// this page), lettering (`word`, for KOL) or another organisation's logo drawn in the text colour
// (`mark`, the Korea Blockchain Week wordmark for KBW events). Community uses the plane of
// Telegram's logo, with the outline from the Simple Icons set (CC0), enlarged to fill the circle.
// The team label also shows the symbols of the projects in the partner-logo strip, the same five
// for every service, followed by "+N" (`more`). The owner asked on 2026-11-12 for a figure between
// 5 and 10 per service; the figures are not a tally from records, so replace them with the
// owner's counts when supplied.

export const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
// Korean is rendered first; localize() swaps every marked node when the page language changes.
export const copy = ([ko, en]) => `<span data-rs-ko="${escape(ko)}" data-rs-en="${escape(en)}">${escape(ko)}</span>`;
export const lines = pairs => pairs.map(copy).join('<br>');
export const icon = (paths, className = 'service-icon') => `<svg class="${className}" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

export function localize(root, language) {
  const en = language === 'en';
  root.querySelectorAll('[data-rs-ko]').forEach(node => {
    const value = en ? node.dataset.rsEn : node.dataset.rsKo;
    if (node.firstChild) node.firstChild.nodeValue = value;
    else node.textContent = value;
  });
}

export const sectionCopy = {
  title: [['직접 해온 일.', 'Work we’ve already delivered.'], ['그래서 맡길 수 있는 일.', 'Ready for your project.']],
  intro: [['KOL 연결부터 KBW 행사까지,', 'From KOL campaigns to KBW events,'], ['모두 저희가 직접 진행해 온 일입니다.', 'all work we have delivered ourselves.']],
};

export const services = [
  {
    id: 'kol', label: ['KOL 연결', 'KOL campaigns'], line: ['결이 맞는 한국 KOL과 연결', 'Matched with Korean KOLs'],
    steps: [['KOL 매칭', 'KOL matching'], ['콘텐츠 기획', 'Content planning'], ['캠페인 운영', 'Campaign management']],
    word: 'KOL', more: 10,
  },
  {
    id: 'community', label: ['커뮤니티 구축·운영', 'Community management'], line: ['텔레그램·디스코드 개설과 운영', 'Telegram and Discord, set up and run'],
    steps: [['채널 개설·설계', 'Channel setup'], ['공지·이벤트 운영', 'Announcements & events'], ['모더레이션·응대', 'Moderation & support']],
    icon: '<path fill="currentColor" stroke="none" transform="translate(12 12.4) scale(1.5) translate(-11.2 -12.4)" d="M16.906 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>', more: 10,
  },
  {
    id: 'meetup', label: ['밋업', 'Meetups'], line: ['커뮤니티와 직접 만나는 자리', 'Meeting your community in person'],
    steps: [['장소 섭외', 'Venue sourcing'], ['참가자 모집', 'Guest invitations'], ['현장 진행', 'On-site hosting']],
    icon: '<circle cx="12" cy="7.5" r="3"/><path d="M6.5 20v-1.5a5.5 5.5 0 0 1 11 0V20"/><circle cx="4.6" cy="10.2" r="2.1"/><path d="M1.5 19.2v-1a3.3 3.3 0 0 1 3.3-3.3"/><circle cx="19.4" cy="10.2" r="2.1"/><path d="M22.5 19.2v-1a3.3 3.3 0 0 0-3.3-3.3"/>', more: 7,
  },
  {
    id: 'press', label: ['언론보도', 'Press outreach'], line: ['보도자료와 미디어 피칭', 'Press materials and media pitching'],
    steps: [['보도자료 작성', 'Press materials'], ['미디어 피칭', 'Media pitching'], ['게재 모니터링', 'Coverage tracking']],
    icon: '<rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M6.5 8h11"/><path d="M7.5 16.5V14M10.5 16.5v-4M13.5 16.5v-2.7M16.5 16.5v-5.2"/>', more: 6,
  },
  {
    id: 'airdrop', label: ['에어드랍', 'Airdrops'], line: ['참여 미션부터 결과 확인까지', 'From missions to participation review'],
    steps: [['참여 미션 설계', 'Mission design'], ['커뮤니티 안내', 'Community guides'], ['참여 결과 확인', 'Participation review']],
    icon: '<path d="M3.5 10a8.5 6.5 0 0 1 17 0Z"/><path d="M3.5 10l5.9 6M20.5 10l-5.9 6M12 10v4.2"/><circle cx="12" cy="18" r="3.7"/><path d="M12 16.3l1.4 1.7-1.4 1.7-1.4-1.7Z"/>', more: 10,
  },
  {
    id: 'events', label: ['KBW 및 행사 대행 운영', 'KBW & event production'], line: ['KBW 사이드 이벤트와 브랜드 행사', 'KBW side events and brand events'],
    steps: [['행사 기획', 'Event planning'], ['파트너 조율', 'Partner coordination'], ['현장 운영', 'Event production']],
    mark: 'assets/references/symbols/kbw.png', more: 10,
  },
];

// Highlights the services one after another, every `interval` ms from the first to the last and
// round again. Pointing at, pressing or keyboard-focusing a service shows it and holds it for
// `hold` ms before the cycle continues from there. `apply(index)` receives the service to show
// (-1 before the cycle starts). start() and stop() control the cycle; holds work either way.
export function serviceCycle(buttons, apply, { interval = 1560, hold = 3000, timers = globalThis } = {}) {
  let current = -1;
  let running = false;
  let timer = 0;
  const show = index => {
    current = index;
    buttons.forEach((button, i) => button.classList.toggle('is-shown', i === index));
    apply(index);
  };
  const schedule = delay => {
    timers.clearTimeout(timer);
    if (running) timer = timers.setTimeout(step, delay);
  };
  const step = () => { show((current + 1) % buttons.length); schedule(interval); };
  const holdOn = index => { show(index); schedule(hold); };
  buttons.forEach((button, index) => {
    button.addEventListener('click', () => holdOn(index));
    button.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') holdOn(index); });
    button.addEventListener('focus', () => { if (button.matches(':focus-visible')) holdOn(index); });
  });
  show(-1);
  return {
    start() {
      if (running) return;
      running = true;
      if (current < 0) step();
      else schedule(interval);
    },
    stop() { running = false; timers.clearTimeout(timer); },
  };
}

// The projects from the partner-logo strip above the section, as a row of overlapping round
// symbols beside the shown service. The row is decoration: the strip already names and links each
// project. `fit: 'mark'` keeps a mark on a clear ground inside the circle; for a wordmark file it
// shows the symbol at its left edge.
export const partners = [
  { name: 'KGeN', src: 'assets/references/kgen.svg' },
  { name: 'Axis Robotics', src: 'assets/references/symbols/axis-robotics.png', fit: 'mark' },
  { name: 'Buidlpad', src: 'assets/references/buidlpad-wordmark.svg', fit: 'mark' },
  { name: 'Fogo', src: 'assets/references/symbols/fogo.png' },
  { name: 'Superwalk', src: 'assets/references/symbols/superwalk.png' },
];
export const logoGroup = ({ more } = {}) => '<span class="sf-logos" aria-hidden="true">'
  + partners.map(partner => `<span class="sf-logo"${partner.fit ? ` data-fit="${partner.fit}"` : ''} title="${escape(partner.name)}"><img src="${partner.src}" alt="" width="26" height="26" decoding="async"></span>`).join('')
  + (more ? `<span class="sf-logo sf-logo-more">+${more}</span>` : '')
  + '</span>';
