import { createClosingSpray } from './closing-spray.js';
import { BOTANICAL_VARIANTS } from './botanical-art.js';
import { MIXED_BOTANICAL_VARIANTS } from './mixed-botanical-art.js';

const variants = [...BOTANICAL_VARIANTS, ...MIXED_BOTANICAL_VARIANTS];

const complete = document.querySelector('#complete');
const animate = document.querySelector('#animate');
const pause = document.querySelector('#pause');
const controls = document.querySelector('#motion-controls');
const timeline = document.querySelector('#timeline');
const time = document.querySelector('#time');
const status = document.querySelector('#status');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let elapsed = 4, playing = false, completed = true, ready = false, previous = null, frame = 0;

const scenes = [...document.querySelectorAll('[data-artwork]')].map(section => {
  const container = section.querySelector('.stage');
  const pattern = section.querySelector('.pattern');
  const actors = [0, 1].map(index => {
    const element = document.createElement('span'); element.className = 'actor'; container.appendChild(element);
    return { element, index, manual:null };
  });
  const scene = { container, pattern, actors, elapsed, width:0, height:0, scale:1, svgX:0, svgY:0, visible:true, loaded:false };
  const artwork = variants.find(variant => variant.id === section.dataset.artwork);
  scene.spray = createClosingSpray(scene, () => { scene.loaded = true; }, { artwork });
  return scene;
});

function paintScene(scene) {
  if (!scene.loaded) return;
  scene.elapsed = elapsed;
  scene.actors.forEach(actor => scene.spray.renderActor(actor, completed));
  scene.spray.render(completed);
}
function render(all = false) {
  scenes.forEach(scene => { if (all || scene.visible) paintScene(scene); });
  timeline.value = String(elapsed % 15); time.textContent = `${(elapsed % 15).toFixed(1)}초`;
}
function measure() {
  scenes.forEach(scene => {
    scene.width = scene.container.clientWidth; scene.height = scene.container.clientHeight;
    scene.scale = Math.min(scene.width / 1400, scene.height / 450);
    scene.svgX = (scene.width - 1400 * scene.scale) / 2; scene.svgY = (scene.height - 450 * scene.scale) / 2;
    scene.spray.measure();
  });
  if (ready) render(true);
}
function tick(now) {
  frame = 0;
  if (!playing || completed || !ready || document.hidden) return;
  if (previous !== null) elapsed += Math.min(now - previous, 64) / 1000;
  previous = now; render(); frame = requestAnimationFrame(tick);
}
function sync() {
  cancelAnimationFrame(frame); frame = 0; previous = null;
  complete.setAttribute('aria-pressed', String(completed)); animate.setAttribute('aria-pressed', String(!completed));
  controls.hidden = completed; pause.textContent = playing ? '일시정지' : '재생';
  if (playing && !completed && ready && !document.hidden && scenes.some(scene => scene.visible)) frame = requestAnimationFrame(tick);
}
complete.addEventListener('click', () => { completed = true; playing = false; render(true); sync(); });
animate.addEventListener('click', () => { completed = false; playing = true; elapsed = 4; render(true); sync(); });
pause.addEventListener('click', () => { playing = !playing; sync(); });
timeline.addEventListener('input', () => { elapsed = Number(timeline.value); playing = false; render(true); sync(); });
document.addEventListener('visibilitychange', sync);
reduced.addEventListener('change', () => { if (reduced.matches) { playing = false; sync(); } });
const intersection = new IntersectionObserver(entries => {
  for (const entry of entries) {
    const scene = scenes.find(item => item.container === entry.target);
    if (scene) { scene.visible = entry.isIntersecting; if (scene.visible && ready) paintScene(scene); }
  }
  sync();
});
const resize = new ResizeObserver(measure);
scenes.forEach(scene => { intersection.observe(scene.container); resize.observe(scene.container); });
measure();
await Promise.all(scenes.map(scene => scene.spray.ready));
ready = true;
animate.disabled = !scenes.every(scene => scene.loaded);
status.textContent = animate.disabled ? '완성 패턴으로 비교할 수 있습니다.' : '모든 시안에 같은 라임 스프레이를 사용합니다.';
render(true); sync();
