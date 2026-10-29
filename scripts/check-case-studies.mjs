// Run against the local HTTP server and a disposable headless Chrome CDP port.
// CASES_BASE_URL defaults to http://127.0.0.1:4173; CHROME_DEBUG_PORT to 9227.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const base = process.env.CASES_BASE_URL || 'http://127.0.0.1:4173';
const chrome = `http://127.0.0.1:${process.env.CHROME_DEBUG_PORT || 9227}`;
const output = process.env.CASES_QA_DIR || join(tmpdir(), 'kale-cases-qa');
await mkdir(output, { recursive: true });
const target = await (await fetch(`${chrome}/json/new?about:blank`, { method: 'PUT' })).json();
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
let sequence = 0;
const pending = new Map();
const errors = [];
socket.onmessage = event => {
  const message = JSON.parse(event.data);
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject, timer } = pending.get(message.id);
    clearTimeout(timer); pending.delete(message.id);
    if (message.error) reject(new Error(JSON.stringify(message.error)));
    else resolve(message.result);
  }
};
function send(method, params = {}) {
  const id = ++sequence;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Timed out: ${method}`)); }, 20000);
    pending.set(id, { resolve, reject, timer });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
const results = [];
try {
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  for (const width of [1440, 768, 390, 360]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: width < 600 });
    for (const language of ['ko', 'en']) {
      const pageURL = new URL(base);
      pageURL.searchParams.set('lang', language);
      pageURL.hash = 'work';
      await send('Page.navigate', { url: pageURL.href });
      await evaluate(`new Promise((resolve, reject) => { const start = Date.now(); const check = () => { if (document.querySelectorAll('.case-card').length === 5 && document.documentElement.classList.contains('js-ready') && document.documentElement.lang === '${language}') resolve(true); else if(Date.now()-start > 10000) reject(Error('Cases did not load')); else setTimeout(check, 50); }; check(); })`);
      const layout = await evaluate(`(() => {
        const ids = [...document.querySelectorAll('[id]')].map(el => el.id);
        return { width: innerWidth, scroll: document.documentElement.scrollWidth, duplicates: ids.filter((id,i) => ids.indexOf(id) !== i), videos: document.querySelectorAll('.case-media video').length, metrics: document.querySelectorAll('.case-metrics dd').length, title: document.querySelector('#work-title').textContent, safeVideo: [...document.querySelectorAll('.case-media video')].every(v => v.controls && v.playsInline && !v.autoplay && v.preload === 'none') };
      })()`);
      assert(layout.scroll <= layout.width, `Overflow at ${width} ${language}`);
      assert.deepEqual(layout.duplicates, []); assert.equal(layout.videos, 3); assert.equal(layout.metrics, 15); assert(layout.safeVideo);
      const localeCheck = await evaluate(`(() => { const s = document.querySelector('#case-studies-root').textContent; return ${language === 'en' ? '!/[가-힣]/.test(s)' : "s.includes('예시 성과') && s.includes('검토용 초안')"}; })()`);
      assert(localeCheck, `Incomplete locale ${language}`);
      await evaluate(`document.querySelectorAll('.case-details').forEach(d => d.open = true)`);
      assert(await evaluate('document.documentElement.scrollWidth <= innerWidth'), `Expanded overflow at ${width}`);
      const imagesLoaded = await evaluate(`Promise.all([...document.querySelectorAll('.case-card img')].map(img => { img.loading='eager'; return img.decode().then(() => img.naturalWidth > 0).catch(() => false); }))`);
      assert.equal(imagesLoaded.length, 14); assert(imagesLoaded.every(Boolean), 'Broken case image');
      await evaluate(`(() => { window.qaVideo=document.querySelector('.case-media video'); window.qaDetails=document.querySelector('.case-details'); document.querySelector('[data-language="${language === 'ko' ? 'en' : 'ko'}"]').click(); })()`);
      assert(await evaluate('qaVideo === document.querySelector(".case-media video") && qaDetails.open'), 'Language switch resets media or details');
      await evaluate(`document.querySelector('[data-language="${language}"]').click(); document.querySelectorAll('.case-details').forEach(d => d.open = false); document.querySelector('.case-details summary').focus()`);
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
      assert(await evaluate('document.querySelector(".case-details").open'), 'Keyboard expansion failed');
      await evaluate(`document.querySelector('.case-details').open = false; document.activeElement.blur(); document.querySelector('#work').scrollIntoView({behavior:'instant'})`);
      const screenshot = await send('Page.captureScreenshot', { format: 'png' });
      await writeFile(join(output, `cases-${width}-${language}.png`), Buffer.from(screenshot.data, 'base64'));
      results.push({ width, language, images: imagesLoaded.length, ...layout });
    }
  }
  const playback = await evaluate(`(async () => { const results=[]; for (const video of document.querySelectorAll('.case-media video')) { video.muted=true; await video.play(); await new Promise((resolve,reject) => { const start=Date.now(); const check=()=>{ if(video.currentTime>0.1) resolve(); else if(video.error || Date.now()-start>10000) reject(Error('Video playback failed')); else setTimeout(check,50); }; check(); }); video.pause(); results.push({src:video.getAttribute('src'),duration:video.duration,width:video.videoWidth,time:video.currentTime}); } return results; })()`);
  assert(playback.every(item => item.duration > 30 && item.width === 1280));
  assert.deepEqual(errors, [], 'Browser runtime errors');
  await writeFile(join(output, 'results.json'), JSON.stringify({ results, playback, errors }, null, 2));
  console.log(JSON.stringify({ layouts: results.length, playback, errors, output }, null, 2));
} finally {
  socket.close();
  await fetch(`${chrome}/json/close/${target.id}`).catch(() => {});
}
