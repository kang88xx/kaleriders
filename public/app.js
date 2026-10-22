import { initMemberArt } from './member-art.js';
import { initLanguage, translate, formatBrief } from './i18n.js';

initLanguage();

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const motionButtons = [...document.querySelectorAll('[data-motion-toggle]')];
let motionPaused = reducedMotion.matches;
let userPaused = false;
const applyMotion = () => {
  motionPaused = userPaused || reducedMotion.matches;
  document.documentElement.classList.toggle('motion-paused', motionPaused);
  motionButtons.forEach(button => {
    button.setAttribute('aria-pressed', String(motionPaused));
    const label = reducedMotion.matches ? '기기 설정으로 모션 줄임' : motionPaused ? '모션 재생' : '모션 일시정지';
    button.innerHTML = `<span aria-hidden="true">${motionPaused && !reducedMotion.matches ? '▷' : 'Ⅱ'}</span> ${translate(label)}`;
    button.disabled = reducedMotion.matches;
  });
  document.dispatchEvent(new CustomEvent('kaky:motion', { detail: { paused: motionPaused } }));
};
motionButtons.forEach(button => button.addEventListener('click', () => { userPaused = !userPaused; applyMotion(); }));
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
  '한국의 대화와 커뮤니티를 읽고, 프로젝트가 시작할 지점을 찾습니다.',
  '프로젝트를 이해하는 크리에이터와 채널을 연결하고, 함께 전할 이야기를 만듭니다.',
  '콘텐츠와 캠페인을 실행하고, 사람들의 반응을 다음 움직임으로 이어갑니다.',
];
const stageButtons = [...document.querySelectorAll('[data-stage]')];
const updateStageDescription = () => {
  const index = Number(stageButtons.find(button => button.getAttribute('aria-pressed') === 'true').dataset.stage);
  document.querySelector('#route-description').textContent = translate(stageDescriptions[index]);
};
stageButtons.forEach(button => button.addEventListener('click', () => {
  const index = Number(button.dataset.stage);
  stageButtons.forEach(item => {
    item.classList.toggle('active', item === button);
    item.setAttribute('aria-pressed', String(item === button));
  });
  document.querySelector('#route-count').textContent = `0${index + 1} — 03`;
  updateStageDescription();
}));
updateStageDescription();

document.addEventListener('languagechange', () => {
  applyMotion();
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
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const text = formatBrief({ name: data.get('name'), project: data.get('project'), service: form.elements.service.selectedOptions[0].textContent, message: data.get('message') });
  const url = URL.createObjectURL(new Blob(['\uFEFF', text], { type: 'text/plain;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'kale-riders-project-brief.txt';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  form.hidden = true;
  result.hidden = false;
  result.focus();
});
document.querySelector('#brief-again').addEventListener('click', () => {
  result.hidden = true;
  form.hidden = false;
  form.querySelector('input').focus();
});
