import { createClosingSpray } from './closing-spray.js';

const play = document.querySelector('#play');
const restart = document.querySelector('#restart');
const timeline = document.querySelector('#timeline');
const output = document.querySelector('#time');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let elapsed = 4, running = !reduced.matches, previous = null, frame = 0, ready = false;

const scenes = [...document.querySelectorAll('[data-color]')].map(card => {
  const container = card.querySelector('.stage');
  const pattern = card.querySelector('.pattern');
  const actors = [0, 1].map(index => {
    const element = document.createElement('span');
    element.className = 'actor';
    container.appendChild(element);
    return { element, index, manual: null };
  });
  const scene = { container, pattern, actors, elapsed, width:0, height:0, scale:1, svgX:0, svgY:0 };
  scene.spray = createClosingSpray(scene, () => {}, { beamColor:card.dataset.color });
  return scene;
});

function measure() {
  for (const scene of scenes) {
    scene.width = scene.container.clientWidth; scene.height = scene.container.clientHeight;
    scene.scale = Math.min(scene.width / 1400, scene.height / 450);
    scene.svgX = (scene.width - 1400 * scene.scale) / 2;
    scene.svgY = (scene.height - 450 * scene.scale) / 2;
    scene.spray.measure();
  }
  if (ready) render();
}
function render() {
  for (const scene of scenes) {
    scene.elapsed = elapsed;
    scene.actors.forEach(actor => scene.spray.renderActor(actor, false));
    scene.spray.render(false);
  }
  timeline.value = String(elapsed % 15);
  output.textContent = `${(elapsed % 15).toFixed(1)}초`;
}
function tick(now) {
  frame = 0;
  if (!running || document.hidden || !ready) return;
  if (previous !== null) elapsed += Math.min(now - previous, 64) / 1000;
  previous = now;
  render();
  frame = requestAnimationFrame(tick);
}
function sync() {
  cancelAnimationFrame(frame); frame = 0; previous = null;
  play.textContent = running ? '일시정지' : '재생';
  play.setAttribute('aria-pressed', String(running));
  if (running && ready && !document.hidden) frame = requestAnimationFrame(tick);
}
play.addEventListener('click', () => { running = !running; sync(); });
restart.addEventListener('click', () => { elapsed = 0; render(); sync(); });
timeline.addEventListener('input', () => { running = false; elapsed = Number(timeline.value); render(); sync(); });
document.addEventListener('visibilitychange', sync);
reduced.addEventListener('change', () => { if (reduced.matches) { running = false; sync(); } });
const resize = new ResizeObserver(measure);
scenes.forEach(scene => resize.observe(scene.container));
measure();
await Promise.all(scenes.map(scene => scene.spray.ready));
ready = true;
play.disabled = restart.disabled = timeline.disabled = false;
render(); sync();
