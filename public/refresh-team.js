const copy = (ko, en) => ({ ko, en });
// Each coin shows a monochrome portrait and flips to the member's own colored PFP.
// Image sources and edits are recorded in docs/team-image-sources.json.
export const members = [
  {
    id: 'kang', name: 'Kang', image: 'kang-illustration.png', pfp: 'kang-pfp.png',
    alt: copy('제공된 Kang 사진을 바탕으로 만든 흑백 반실사 일러스트', 'A monochrome illustration based on a photo of Kang'),
    role: copy('전략·파트너십', 'Strategy & partnerships'),
    description: copy('한국 시장 진입 전략과 프로젝트·파트너 협업을 연결합니다.', 'Plans Korean market entry and coordinates project partnerships.'),
  },
  {
    id: 'kalya', name: 'Kalya', image: 'kalya-portrait.jpg', pfp: 'kalya-pfp.jpg',
    alt: copy('Kalya의 흑백 인물 사진', 'A monochrome photo of Kalya'),
    role: copy('콘텐츠·KOL', 'Content & KOLs'),
    description: copy('프로젝트에 맞는 크리에이터를 연결하고 콘텐츠와 캠페인을 기획합니다.', 'Finds creators for each project and plans content and campaigns.'),
  },
  {
    id: 'mascot', name: 'Mascot', image: 'mascot-portrait.jpg', pfp: 'mascot-pfp.jpg',
    alt: copy('Mascot의 흑백 인물 사진', 'A monochrome photo of Mascot'),
    role: copy('커뮤니티·행사 운영', 'Community & events'),
    description: copy('커뮤니티의 참여를 만들고 밋업과 행사 현장을 운영합니다.', 'Runs community activities, meetups and events.'),
  },
];

// Which coins turn on an automatic beat: usually one, sometimes two together, now and then all
// three. A single coin is never the one that turned alone on the beat before.
export function pickFlips(count, previous = [], random = Math.random) {
  const roll = random();
  const size = Math.min(count, roll < .6 ? 1 : roll < .92 ? 2 : 3);
  const pool = Array.from({ length: count }, (_, index) => index);
  const candidates = size === 1 && previous.length === 1 && count > 1 ? pool.filter(index => index !== previous[0]) : pool;
  const turning = [];
  while (turning.length < size) turning.push(...candidates.splice(Math.floor(random() * candidates.length), 1));
  return turning.sort((first, second) => first - second);
}

export function initRefreshTeam(doc = document) {
  const root = doc.getElementById('refresh-team-root');
  if (!root || root.dataset.ready === 'true') return;
  root.replaceChildren();
  const view = doc.defaultView;
  const reducedMotion = view.matchMedia('(prefers-reduced-motion: reduce)');
  let language = doc.documentElement.lang === 'en' ? 'en' : 'ko';
  let visible = false;
  let lastTurned = [];
  let focused = false;
  let autoTimer;
  const flipped = new Set();      // coins showing their PFP
  const returnTimers = new Map(); // coin index -> timer that turns it back
  const bindings = [];
  const portraits = [];
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

  const heading = element('div', 'rt-heading', root);
  const headingCopy = element('div', '', heading);
  const title = element('h2', '', headingCopy);
  title.id = 'team-title';
  element('span', '', title, copy('함께 만드는 세 사람.', 'Three people.'));
  element('br', '', title);
  element('span', '', title, copy('한 방향을 보는 팀.', 'One team.'));
  element('p', 'rt-intro', heading, copy('서로 다른 시선과 역할로,\n프로젝트의 다음을 함께 만듭니다.', 'Strategy, content and community.\nDifferent roles, working together on your project.'));

  const grid = element('div', 'rt-grid', root);
  members.forEach(member => {
    const card = element('article', 'rt-card', grid);
    card.id = `member-${member.id}`;
    card.dataset.member = member.id;
    card.setAttribute('aria-labelledby', `rt-name-${member.id}`);
    const visual = element('button', 'rt-visual', card);
    visual.type = 'button';
    visual.setAttribute('aria-pressed', 'false');
    const coin = element('span', 'rt-coin', visual);
    coin.setAttribute('aria-hidden', 'true');
    const portrait = element('img', 'rt-portrait', coin);
    portrait.src = new URL(`assets/team/${member.image}`, import.meta.url).href;
    portrait.loading = 'lazy';
    portrait.decoding = 'async';
    bindings.push(language => { portrait.alt = member.alt[language]; });
    const pfp = element('img', 'rt-pfp', coin);
    pfp.src = new URL(`assets/team/${member.pfp}`, import.meta.url).href;
    pfp.alt = '';
    pfp.loading = 'lazy';
    pfp.decoding = 'async';
    const caption = element('div', 'rt-caption', card);
    const nameLine = element('div', 'rt-name-line', caption);
    const name = element('h3', '', nameLine, member.name);
    name.id = `rt-name-${member.id}`;
    // The role sits on the name's line and drops under it when the line is too narrow.
    element('p', 'rt-role', nameLine, member.role);
    element('p', 'rt-description', caption, member.description);
    portraits.push(visual);
    visual.addEventListener('click', () => {
      const index = portraits.indexOf(visual);
      if (flipped.has(index)) unflip(index);
      else flip(index);
      schedule();
    });
  });

  function updateButtons() {
    portraits.forEach((button, index) => {
      const turned = flipped.has(index);
      button.setAttribute('aria-pressed', String(turned));
      button.setAttribute('aria-label', language === 'en'
        ? `${members[index].name}: ${turned ? 'return to portrait' : 'preview PFP character'}`
        : `${members[index].name}: ${turned ? '인물 사진으로 돌아가기' : 'PFP 캐릭터 보기'}`);
    });
  }
  function updateState() {
    root.dataset.pfpState = flipped.size ? 'pfp' : 'portrait';
    if (flipped.size) root.dataset.pfpMember = [...flipped].map(index => members[index].id).join(' ');
    else delete root.dataset.pfpMember;
    updateButtons();
  }
  function unflip(index) {
    view.clearTimeout(returnTimers.get(index));
    returnTimers.delete(index);
    portraits[index].classList.remove('is-flipped');
    flipped.delete(index);
    updateState();
  }
  // Each coin turns to its PFP, holds it for a second and turns back, independently of the others.
  function flip(index) {
    view.clearTimeout(returnTimers.get(index));
    portraits[index].classList.add('is-flipped');
    flipped.add(index);
    updateState();
    returnTimers.set(index, view.setTimeout(() => unflip(index), (reducedMotion.matches ? 0 : 350) + 1000));
  }
  function resetPreview() {
    [...flipped].forEach(unflip);
    updateState();
  }
  function schedule() {
    view.clearTimeout(autoTimer);
    const running = visible && !doc.hidden && !reducedMotion.matches && !focused;
    root.dataset.pfpAutoplay = reducedMotion.matches ? 'reduced-motion' : running ? 'running' : 'paused';
    if (!running) return;
    // About every two seconds (it was three), a little uneven so the turns do not tick like a clock.
    autoTimer = view.setTimeout(() => {
      const turning = pickFlips(portraits.length, lastTurned);
      lastTurned = turning;
      turning.forEach(flip);
      schedule();
    }, 1700 + Math.random() * 600);
  }
  function pause() {
    view.clearTimeout(autoTimer);
    resetPreview();
    schedule();
  }
  new view.IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (!visible) pause();
    else schedule();
  }, { threshold: .2 }).observe(grid);
  doc.addEventListener('visibilitychange', pause);
  reducedMotion.addEventListener('change', pause);
  // A coin pressed with a pointer keeps focus, which used to stop the coins until a click elsewhere.
  // Only focus from the keyboard holds them (browsers without :focus-visible count as keyboard).
  root.addEventListener('focusin', event => {
    try { focused = event.target.matches?.(':focus-visible') ?? true; } catch { focused = true; }
    schedule();
  });
  root.addEventListener('focusout', event => {
    if (!root.contains(event.relatedTarget)) focused = false;
    view.queueMicrotask(schedule);
  });
  root.addEventListener('keydown', event => {
    if (event.key === 'Escape' && flipped.size) {
      event.preventDefault();
      resetPreview();
      schedule();
    }
  });
  const localize = value => {
    language = value === 'en' ? 'en' : 'ko';
    bindings.forEach(bind => bind(language));
    updateButtons();
  };
  localize(doc.documentElement.lang);
  doc.addEventListener('languagechange', event => localize(event.detail.language));
  root.closest('#team')?.setAttribute('aria-labelledby', 'team-title');
  root.dataset.pfpState = 'portrait';
  schedule();
  root.dataset.ready = 'true';
}
