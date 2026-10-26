import { initMemberArt } from './member-art.js?v=garden-bloom-20261026';
import { initLanguage, translate } from './i18n.js';
import { initInquiryForm } from './contact.js';
import { initFaq } from './faq.js';

initLanguage();
initFaq();

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const applyMotion = () => {
  const motionPaused = reducedMotion.matches;
  document.documentElement.classList.toggle('motion-paused', motionPaused);
  document.dispatchEvent(new CustomEvent('kaky:motion', { detail: { paused: motionPaused } }));
};
reducedMotion.addEventListener('change', applyMotion);
initMemberArt();
applyMotion();

if ('IntersectionObserver' in window) {
  document.documentElement.classList.add('js-motion');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.07, rootMargin: '0px 0px -20px 0px' });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
}

const menu = document.querySelector('#mobile-nav');
const menuButton = document.querySelector('.menu-toggle');
const closeMenu = () => {
  menu.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', translate('메뉴 열기'));
};
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menu.hidden = !open;
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', translate(open ? '메뉴 닫기' : '메뉴 열기'));
});
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !menu.hidden) { closeMenu(); menuButton.focus(); }
});
matchMedia('(min-width: 901px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

const tabs = [...document.querySelectorAll('[role="tab"]')];
const activateTab = tab => {
  tabs.forEach(item => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
  });
};
activateTab(tabs[0]);
document.documentElement.classList.add('js-ready');
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    activateTab(tabs[next]);
    tabs[next].focus({ preventScroll: true });
    tabs[next].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
  });
});

const stageDescriptions = [
  '한국의 이용자와 커뮤니티를 살펴 프로젝트의 포지셔닝과 시장 진입 계획을 세웁니다.',
  '프로젝트에 맞는 크리에이터, KOL, 채널을 연결해 현지에서 공감할 이야기를 만듭니다.',
  '콘텐츠, 캠페인, 커뮤니티 프로그램으로 첫 관심을 오래가는 팬 관계로 발전시킵니다.',
];
const stageButtons = [...document.querySelectorAll('[data-stage]')];
const updateStageDescription = () => {
  const index = Number(stageButtons.find(button => button.getAttribute('aria-pressed') === 'true').dataset.stage);
  document.querySelector('#route-description').textContent = translate(stageDescriptions[index]);
};
stageButtons.forEach(button => button.addEventListener('click', () => {
  stageButtons.forEach(item => {
    item.classList.toggle('active', item === button);
    item.setAttribute('aria-pressed', String(item === button));
  });
  updateStageDescription();
}));
updateStageDescription();

document.addEventListener('languagechange', () => {
  updateStageDescription();
  menuButton.setAttribute('aria-label', translate(menu.hidden ? '메뉴 열기' : '메뉴 닫기'));
});

const dialog = document.querySelector('#brief-dialog');
const form = document.querySelector('#brief-form');
const result = document.querySelector('#brief-result');
let dialogTrigger;
document.querySelectorAll('[data-open-brief]').forEach(button => button.addEventListener('click', () => {
  dialogTrigger = button;
  closeMenu();
  form.hidden = false;
  result.hidden = true;
  document.querySelector('#brief-error').hidden = true;
  dialog.showModal();
  document.body.classList.add('modal-open');
}));
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const box = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  if (dialogTrigger && dialogTrigger.getClientRects().length) dialogTrigger.focus({ preventScroll: true });
  else menuButton.focus({ preventScroll: true });
});
initInquiryForm({ form, result, dialog });
document.querySelector('#brief-again').addEventListener('click', () => {
  result.hidden = true;
  form.hidden = false;
  form.elements.name.focus();
});
