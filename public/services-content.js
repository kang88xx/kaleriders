// Section copy and the five services, shared by the infographic drafts.
// Each service has a name, one short line, its three steps and its line icon (the icons already
// used on the live service tabs). No client names, results or numbers beyond the five services.

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
  intro: [['KOL 연결부터 KBW 행사까지,', 'From KOL campaigns to KBW events,'], ['다섯 가지 모두 직접 진행해 온 일입니다.', 'all five are work we have delivered ourselves.']],
};

export const services = [
  {
    id: 'kol', label: ['KOL 연결', 'KOL campaigns'], line: ['결이 맞는 한국 KOL과 연결', 'Matched with Korean KOLs'],
    steps: [['KOL 매칭', 'KOL matching'], ['콘텐츠 기획', 'Content planning'], ['캠페인 운영', 'Campaign management']],
    icon: '<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 5a3 3 0 0 1 0 6m1 4a5 5 0 0 1 3 5"/>',
  },
  {
    id: 'meetup', label: ['밋업', 'Meetups'], line: ['커뮤니티와 직접 만나는 자리', 'Meeting your community in person'],
    steps: [['장소 섭외', 'Venue sourcing'], ['참가자 모집', 'Guest invitations'], ['현장 진행', 'On-site hosting']],
    icon: '<path d="M21 11a8 8 0 0 1-8 8H5l-4 3V11a8 8 0 0 1 8-8h4a8 8 0 0 1 8 8Z"/><path d="M7 10h8M7 14h5"/>',
  },
  {
    id: 'press', label: ['언론보도', 'Press outreach'], line: ['보도자료와 미디어 피칭', 'Press materials and media pitching'],
    steps: [['보도자료 작성', 'Press materials'], ['미디어 피칭', 'Media pitching'], ['게재 모니터링', 'Coverage tracking']],
    icon: '<path d="M4 4h13v15a2 2 0 0 0 2 2H6a2 2 0 0 1-2-2Z"/><path d="M17 8h3v11a2 2 0 0 1-4 0M8 8h5M8 12h5M8 16h3"/>',
  },
  {
    id: 'airdrop', label: ['에어드랍', 'Airdrops'], line: ['참여 미션부터 결과 확인까지', 'From missions to participation review'],
    steps: [['참여 미션 설계', 'Mission design'], ['커뮤니티 안내', 'Community guides'], ['참여 결과 확인', 'Participation review']],
    icon: '<path d="M3 11a9 7 0 0 1 18 0Z"/><path d="M3 11l7 7m11-7-7 7m-2-7v7"/><rect x="9" y="17" width="6" height="5" rx="1"/>',
  },
  {
    id: 'events', label: ['KBW 및 행사 대행 운영', 'KBW & event production'], line: ['KBW 사이드 이벤트와 브랜드 행사', 'KBW side events and brand events'],
    steps: [['행사 기획', 'Event planning'], ['파트너 조율', 'Partner coordination'], ['현장 운영', 'Event production']],
    icon: '<path d="M3 21V6h18v15M3 10h18M8 3v6M16 3v6M7 15h3M14 15h3M7 18h3M14 18h3"/>',
  },
];

// Shows one service at a time from pointer, focus or a press: pointing previews, a press pins.
// `apply(index)` receives the service to show, or -1 for the default state.
export function serviceSelection(buttons, apply, { canHover }) {
  let pinned = -1;
  let preview = -1;
  const render = () => {
    const shown = preview > -1 ? preview : pinned;
    buttons.forEach((button, index) => {
      button.setAttribute('aria-pressed', String(index === pinned));
      button.classList.toggle('is-shown', index === shown);
    });
    apply(shown);
  };
  buttons.forEach((button, index) => {
    button.addEventListener('click', () => { pinned = pinned === index ? -1 : index; preview = -1; render(); });
    button.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse' && canHover()) { preview = index; render(); } });
    button.addEventListener('pointerleave', event => { if (event.pointerType === 'mouse' && preview === index) { preview = -1; render(); } });
    button.addEventListener('focus', () => { if (button.matches(':focus-visible')) { preview = index; render(); } });
    button.addEventListener('blur', () => { if (preview === index) { preview = -1; render(); } });
  });
  render();
  return { render };
}
