import { services, sectionCopy, copy, lines, icon, escape, localize, serviceCycle, logoGroup } from './services-content.js?v=symbols-20261112';

// The services infographic: the six services side by side, each line running into one team.
// Lines and checks draw once when the section appears. Then the highlight moves to the next
// service every 1.56 seconds, round and round, and the team label shows that service's steps
// beside the partner projects' symbols.
// Pointing at, pressing or focusing a service holds it for 3 seconds. The cycle pauses while the
// section is off screen and does not run with reduced motion. Each button is described by its
// steps, so a screen reader hears them with the button rather than on every change.
export const teamCopy = {
  name: ['KALE Riders', 'KALE Riders'],
  text: ['한 팀이 모두 직접 진행합니다', 'One team runs them all'],
};
const stepsCopy = steps => [steps.map(step => step[0]).join(' · '), steps.map(step => step[1]).join(' · ')];
// Each line starts at its column centre on the 1000-wide drawing and ends at the team label.
const fanPath = index => {
  const x = Number(((index + 0.5) * 1000 / services.length).toFixed(1));
  return `<path data-index="${index}" d="M${x} 0 C${x} 52 500 44 500 96"/>`;
};

// The sign in a service's circle: lettering, a logo used as a mask so it takes the text colour
// (white, or ink on the highlighted lime circle), or a line icon.
export const signMarkup = service => {
  if (service.word) return `<span class="sf-word" aria-hidden="true">${escape(service.word)}</span>`;
  if (service.mark) return `<span class="sf-mark" aria-hidden="true" style="-webkit-mask-image:url('${service.mark}');mask-image:url('${service.mark}')"></span>`;
  return icon(service.icon);
};

export const serviceMarkup = (service, index) => `<li class="sf-item"><button type="button" class="sf-service" data-index="${index}" aria-controls="sf-team" aria-describedby="sf-steps-${index}">`
  + `<span class="sf-icon">${signMarkup(service)}<i class="sf-check" aria-hidden="true"></i></span>`
  + `<span class="sf-text"><span class="sf-name">${copy(service.label)}</span><span class="sf-line">${copy(service.line)}</span></span>`
  + '</button></li>';

// Every state stays in the label; only the active one shows. On narrow screens the states share
// one cell, so the label keeps the height of the longest and the changes never move the page.
export const teamMarkup = () => '<p class="sf-team" id="sf-team">'
  + `<span class="sf-team-state is-active" data-state="-1"><strong>${copy(teamCopy.name)}</strong>${copy(teamCopy.text)}</span>`
  + services.map((service, index) => `<span class="sf-team-state" data-state="${index}">${logoGroup(service)}<strong>${copy(service.label)}</strong><span id="sf-steps-${index}">${copy(stepsCopy(service.steps))}</span></span>`).join('')
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
  const cycle = serviceCycle([...root.querySelectorAll('.sf-service')], shown => {
    paths.forEach((path, index) => path.classList.toggle('is-shown', index === shown));
    states.forEach(state => state.classList.toggle('is-active', Number(state.dataset.state) === shown));
  }, { timers: view });

  // Draw once the first time the graphic is on screen; cycle only while it is on screen.
  const still = view.matchMedia('(prefers-reduced-motion: reduce)');
  let drawn = false;
  let visible = false;
  const update = () => { if (drawn && visible && !still.matches) cycle.start(); else cycle.stop(); };
  if ('IntersectionObserver' in view) {
    new view.IntersectionObserver(entries => {
      visible = entries[entries.length - 1].isIntersecting;
      if (visible && !drawn) {
        graphic.classList.add('is-drawn');
        // Start after the lines and checks have drawn in.
        view.setTimeout(() => { drawn = true; update(); }, still.matches ? 0 : 1400);
      }
      update();
    }, { threshold: 0.3 }).observe(graphic);
  } else {
    graphic.classList.add('is-drawn');
    drawn = visible = true;
    update();
  }
  still.addEventListener('change', update);

  const localizeRoot = () => localize(root, doc.documentElement.lang);
  doc.addEventListener('languagechange', localizeRoot);
  localizeRoot();
  root.dataset.ready = 'true';
}
