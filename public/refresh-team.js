const copy = (ko, en) => ({ ko, en });
const members = [
  {
    id: 'kang', name: 'Kang', image: 'kang-illustration.png',
    alt: copy('제공된 Kang 사진을 바탕으로 만든 흑백 반실사 일러스트', 'A monochrome illustration based on a photo of Kang'),
    role: copy('전략·파트너십', 'Strategy & partnerships'),
    description: copy('한국 시장 진입 전략과 프로젝트·파트너 협업을 연결합니다.', 'Plans Korean market entry and coordinates project partnerships.'),
  },
  {
    id: 'kalya', name: 'Kalya',
    role: copy('콘텐츠·KOL', 'Content & KOLs'),
    description: copy('프로젝트에 맞는 크리에이터를 연결하고 콘텐츠와 캠페인을 기획합니다.', 'Finds creators for each project and plans content and campaigns.'),
  },
  {
    id: 'mascot', name: 'Mascot',
    role: copy('커뮤니티·행사 운영', 'Community & events'),
    description: copy('커뮤니티의 참여를 만들고 밋업과 행사 현장을 운영합니다.', 'Runs community activities, meetups and events.'),
  },
];

export function initRefreshTeam(doc = document) {
  const root = doc.getElementById('refresh-team-root');
  if (!root || root.dataset.ready === 'true') return;
  root.replaceChildren();
  const view = doc.defaultView;
  const reducedMotion = view.matchMedia('(prefers-reduced-motion: reduce)');
  let language = doc.documentElement.lang === 'en' ? 'en' : 'ko';
  let visible = false;
  let active = -1;
  let last = -1;
  let autoTimer;
  let phaseTimer;
  let returnTimer;
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
  element('p', 'eyebrow', headingCopy, 'MEET THE TEAM');
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
    if (member.image) {
      const portrait = element('img', 'rt-portrait', coin);
      portrait.src = new URL(`assets/team/${member.image}`, import.meta.url).href;
      portrait.loading = 'lazy';
      portrait.decoding = 'async';
      bindings.push(language => { portrait.alt = member.alt[language]; });
    } else {
      // Use each member's own character until their approved portrait is available.
      const portrait = element('span', 'rt-portrait rt-character-front', coin);
      portrait.dataset.memberAvatar = member.id;
    }
    const pfp = element('span', `rt-pfp rt-pfp-${member.id}`, coin);
    pfp.dataset.memberAvatar = member.id;
    pfp.setAttribute('aria-hidden', 'true');
    const caption = element('div', 'rt-caption', card);
    const nameLine = element('div', 'rt-name-line', caption);
    const name = element('h3', '', nameLine, member.name);
    name.id = `rt-name-${member.id}`;
    element('p', 'rt-role', caption, member.role);
    element('p', 'rt-description', caption, member.description);
    portraits.push(visual);
    visual.addEventListener('click', () => {
      const index = portraits.indexOf(visual);
      if (active === index) resetPreview();
      else preview(index);
      schedule();
    });
  });

  function updateButtons() {
    portraits.forEach((button, index) => {
      const flipped = index === active && button.classList.contains('is-flipped');
      const hasPortrait = Boolean(members[index].image);
      button.setAttribute('aria-pressed', String(flipped));
      button.setAttribute('aria-label', language === 'en'
        ? `${members[index].name}: ${flipped ? (hasPortrait ? 'return to portrait' : 'return to monochrome character') : 'preview PFP character'}`
        : `${members[index].name}: ${flipped ? (hasPortrait ? '인물 사진으로 돌아가기' : '흑백 캐릭터로 돌아가기') : 'PFP 캐릭터 보기'}`);
    });
  }
  function resetPreview() {
    view.clearTimeout(phaseTimer);
    view.clearTimeout(returnTimer);
    portraits.forEach(button => button.classList.remove('is-flipped'));
    active = -1;
    root.dataset.pfpState = 'portrait';
    delete root.dataset.pfpMember;
    updateButtons();
  }
  function preview(index) {
    resetPreview();
    active = index;
    last = index;
    const button = portraits[index];
    const duration = reducedMotion.matches ? 0 : 350;
    button.classList.add('is-flipped');
    root.dataset.pfpMember = members[index].id;
    root.dataset.pfpState = duration ? 'flipping' : 'pfp';
    updateButtons();
    phaseTimer = view.setTimeout(() => {
      root.dataset.pfpState = 'pfp';
      returnTimer = view.setTimeout(() => {
        button.classList.remove('is-flipped');
        root.dataset.pfpState = duration ? 'returning' : 'portrait';
        updateButtons();
        phaseTimer = view.setTimeout(resetPreview, duration);
      }, 1000);
    }, duration);
  }
  function schedule() {
    view.clearTimeout(autoTimer);
    const running = visible && !doc.hidden && !reducedMotion.matches && !root.contains(doc.activeElement);
    root.dataset.pfpAutoplay = reducedMotion.matches ? 'reduced-motion' : running ? 'running' : 'paused';
    if (!running) return;
    autoTimer = view.setTimeout(() => {
      const candidates = portraits.map((_, index) => index).filter(index => index !== last);
      preview(candidates[Math.floor(Math.random() * candidates.length)]);
      schedule();
    }, 3000);
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
  root.addEventListener('focusin', schedule);
  root.addEventListener('focusout', () => view.queueMicrotask(schedule));
  root.addEventListener('keydown', event => {
    if (event.key === 'Escape' && active >= 0) {
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
