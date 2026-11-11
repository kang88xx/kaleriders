import { services, sectionCopy, copy, lines, icon, localize, serviceSelection } from './services-content.js';

// Infographic draft 1: the five services side by side, each line running into one team.
// Lines and checks draw in once when the section appears; pointing at a service (or focusing or
// pressing it) highlights its line and shows its three steps in the team label. Each button is
// described by its steps, so a screen reader hears them with the button instead of on every change.
export const teamCopy = {
  name: ['KALE Riders', 'KALE Riders'],
  text: ['한 팀이 다섯 가지를 모두 진행합니다', 'One team runs all five'],
};
const number = index => String(index + 1).padStart(2, '0');
const stepsCopy = steps => [steps.map(step => step[0]).join(' · '), steps.map(step => step[1]).join(' · ')];
// Each column centre sits at 10%, 30%, 50%, 70% or 90% of the width, matching the 1000-wide drawing.
const fanPath = index => {
  const x = 100 + index * 200;
  return `<path data-index="${index}" d="M${x} 0 C${x} 52 500 44 500 96"/>`;
};

export const serviceMarkup = (service, index) => `<li class="sf-item"><button type="button" class="sf-service" data-index="${index}" aria-pressed="false" aria-controls="sf-team" aria-describedby="sf-steps-${index}">`
  + `<span class="sf-icon">${icon(service.icon)}<i class="sf-check" aria-hidden="true"></i></span>`
  + `<span class="sf-text"><span class="sf-no" aria-hidden="true">${number(index)}</span><span class="sf-name">${copy(service.label)}</span><span class="sf-line">${copy(service.line)}</span></span>`
  + '</button></li>';

// Every state stays in the label; only the active one shows. On narrow screens the states share
// one cell, so the label keeps the height of the longest and choosing a service moves nothing.
export const teamMarkup = () => '<p class="sf-team" id="sf-team">'
  + `<span class="sf-team-state is-active" data-state="-1"><strong>${copy(teamCopy.name)}</strong>${copy(teamCopy.text)}</span>`
  + services.map((service, index) => `<span class="sf-team-state" data-state="${index}"><strong>${copy(service.label)}</strong><span id="sf-steps-${index}">${copy(stepsCopy(service.steps))}</span></span>`).join('')
  + '</p>';

export const sectionMarkup = () => `<div class="services-heading"><div><h2 id="services-title">${lines(sectionCopy.title)}</h2></div><p>${lines(sectionCopy.intro)}</p></div>`
  + `<div class="sf"><ol class="sf-list" role="list">${services.map(serviceMarkup).join('')}</ol>`
  + `<svg class="sf-fan" viewBox="0 0 1000 96" preserveAspectRatio="none" aria-hidden="true" focusable="false">${services.map((_, index) => fanPath(index)).join('')}</svg>`
  + `${teamMarkup()}</div>`;

export function initRefreshServices(doc = document, view = window) {
  const root = doc.querySelector('#refresh-services-root');
  if (!root || root.dataset.ready === 'true') return;
  root.innerHTML = sectionMarkup();

  const graphic = root.querySelector('.sf');
  const paths = [...root.querySelectorAll('.sf-fan path')];
  const states = [...root.querySelectorAll('.sf-team-state')];
  // Pointing previews only with a real hover and the side-by-side layout, where the lines show.
  const hover = view.matchMedia('(hover: hover) and (min-width: 901px)');
  serviceSelection([...root.querySelectorAll('.sf-service')], shown => {
    paths.forEach((path, index) => path.classList.toggle('is-shown', index === shown));
    states.forEach(state => state.classList.toggle('is-active', Number(state.dataset.state) === shown));
  }, { canHover: () => hover.matches });

  // Draw the lines and checks once, the first time the graphic is on screen.
  if ('IntersectionObserver' in view) {
    const observer = new view.IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      graphic.classList.add('is-drawn');
      observer.disconnect();
    }, { threshold: 0.3 });
    observer.observe(graphic);
  } else graphic.classList.add('is-drawn');

  const update = () => localize(root, doc.documentElement.lang);
  doc.addEventListener('languagechange', update);
  update();
  root.dataset.ready = 'true';
}
