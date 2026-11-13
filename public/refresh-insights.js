import { performanceData, getPerformanceSummary } from './service-performance-data.js?v=mosaic-20261113';

const copy = {
  '시장을 읽고,': 'Understand the market.',
  '다음 움직임을 만듭니다.': 'Decide what comes next.',
  '한국 시장에 대한 이해부터 실행 이후의 변화까지. 리서치와 성과 데이터를 다음 결정의 근거로 연결합니다.': 'We research the Korean market and review campaign results to help you decide what to do next.',
  '한국 시장 리서치': 'Korean market research',
  '어디에서, 누구와, 어떤 이야기로 시작할까요?': 'Where should you start, who should you reach and what should you say?',
  '시장과 트렌드': 'Market & trends',
  '국내 관심 주제와 시장 흐름을 살펴 진입 기회를 찾습니다.': 'We look at local interests and market trends to identify opportunities.',
  '커뮤니티와 채널': 'Communities & channels',
  '타깃이 모이는 곳과 실제 대화를 분석해 접점을 정합니다.': 'We find where your audience gathers and what they talk about.',
  '경쟁 환경과 포지셔닝': 'Competition & positioning',
  '유사 프로젝트의 메시지를 비교하고 우리만의 출발점을 정리합니다.': 'We compare similar projects and identify how yours can stand out.',
  '리서치 브리프 → 실행 우선순위 → 성과 리포트': 'Research brief → priorities → performance report',
  '성과 분석 및 데이터': 'Performance & data',
  '캠페인 리포트 구성 예시': 'A campaign report example',
  '리포트 예시': 'Example report',
  '분석 방식과 리포트 구성을 보여주는 가상 데이터입니다. 실제 고객 성과가 아닙니다.': 'Fictional data used to show our report format and analysis. These are not client results.',
  '보고 기간별 변화': 'Compare reporting periods',
  '시장 분석과 채널·콘텐츠별 반응을 정리해 다음 실행의 우선순위를 제안합니다.': 'We review the market, channel performance and content response, then recommend where to focus next.',
  '예시 데이터': 'Illustrative data',
  '누적 보고 기간': 'Cumulative reporting period',
  '2주': '2 weeks',
  '4주': '4 weeks',
  '8주': '8 weeks',
  '누적 노출': 'Total impressions',
  '추적 방문': 'Tracked visits',
  '완료 행동': 'Completed actions',
  '주간 완료 행동': 'Completed actions by week',
  '단위: 건': 'Unit: actions',
  '그래프 데이터 보기': 'View chart data',
  '주차': 'Week',
  '노출': 'Impressions',
  '방문': 'Visits',
  '완료 행동 수': 'Actions',
  '숫자 다음의 액션까지.': 'What the results tell us.',
  '채널별 반응, 유입과 참여 흐름을 함께 읽고 다음 캠페인의 개선점을 제안합니다.': 'We review channel response, traffic and participation to recommend changes for the next campaign.',
  '표시된 수치와 추이는 가상 캠페인 예시이며 실제 실적이 아닙니다. 완료율은 완료 행동 ÷ 추적 방문으로 계산합니다.': 'Figures and trends illustrate a fictional campaign, not actual results. Action rate is completed actions divided by tracked visits.',
};

export function initRefreshInsights() {
  const root = document.querySelector('#refresh-insights-root');
  if (!root || root.dataset.ready === 'true') return;
  let period = performanceData.defaultPeriod;
  let language = 'ko';
  const t = value => language === 'en' ? (copy[value] || value) : value;
  const number = value => new Intl.NumberFormat(language === 'en' ? 'en-US' : 'ko-KR').format(value);

  root.innerHTML = `
    <div class="ri-heading">
      <div><h2 id="growth-title"><span>시장을 읽고,</span><br><span>다음 움직임을 만듭니다.</span></h2></div>
      <p class="ri-intro">시장 분석과 채널·콘텐츠별 반응을 정리해 다음 실행의 우선순위를 제안합니다.</p>
    </div>
    <div class="ri-layout">
      <article class="ri-research" aria-labelledby="ri-research-title">
        <h3 id="ri-research-title">한국 시장 리서치</h3>
        <p class="ri-research-intro">어디에서, 누구와, 어떤 이야기로 시작할까요?</p>
        <ol class="ri-research-list">
          <li><span class="ri-list-number" aria-hidden="true">01</span><div><h4>시장과 트렌드</h4><p>국내 관심 주제와 시장 흐름을 살펴 진입 기회를 찾습니다.</p></div></li>
          <li><span class="ri-list-number" aria-hidden="true">02</span><div><h4>커뮤니티와 채널</h4><p>타깃이 모이는 곳과 실제 대화를 분석해 접점을 정합니다.</p></div></li>
          <li><span class="ri-list-number" aria-hidden="true">03</span><div><h4>경쟁 환경과 포지셔닝</h4><p>유사 프로젝트의 메시지를 비교하고 우리만의 출발점을 정리합니다.</p></div></li>
        </ol>
        <p class="ri-handoff">리서치 브리프 → 실행 우선순위 → 성과 리포트</p>
      </article>
      <article class="ri-report" aria-labelledby="ri-report-title">
        <div class="ri-report-top"><span class="ri-sample">리포트 예시</span></div>
        <h3 id="ri-report-title">캠페인 리포트 구성 예시</h3>
        <p class="ri-example-note">분석 방식과 리포트 구성을 보여주는 가상 데이터입니다. 실제 고객 성과가 아닙니다.</p>
        <div class="ri-report-toolbar"><p>보고 기간별 변화</p><div class="ri-periods" role="group" aria-label="누적 보고 기간">${performanceData.periods.map(value => `<button type="button" data-ri-period="${value}" aria-pressed="${value === period}">${value}주</button>`).join('')}</div></div>
        <dl class="ri-metrics" aria-live="polite" aria-atomic="true">
          <div><dt>누적 노출</dt><dd data-ri-metric="impressions"></dd></div>
          <div><dt>추적 방문</dt><dd data-ri-metric="visits"></dd></div>
          <div><dt>완료 행동</dt><dd data-ri-metric="actions"></dd></div>
        </dl>
        <figure class="ri-chart">
          <figcaption><span>주간 완료 행동</span><span>단위: 건</span></figcaption>
          <svg id="ri-chart-svg" viewBox="0 0 560 210" role="img" aria-labelledby="ri-chart-title ri-chart-description"></svg>
        </figure>
        <div class="ri-report-foot"><span data-ri-period-label></span><strong data-ri-rate></strong></div>
        <details class="ri-table-details"><summary>그래프 데이터 보기</summary><div class="ri-table-scroll" tabindex="0" role="region" aria-label="그래프 데이터 보기"><table><thead><tr><th scope="col">주차</th><th scope="col">노출</th><th scope="col">방문</th><th scope="col">완료 행동 수</th></tr></thead><tbody data-ri-table></tbody></table></div></details>
      </article>
    </div>`;

  // The periods play by themselves, 2 → 4 → 8 weeks and round again (owner, 2026-11-13). The
  // chart is drawn once for all eight weeks and revealed up to `shown` weeks, so the line carries
  // on from where it was; a thumb slides between the period buttons.
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const chart = root.querySelector('#ri-chart-svg');
  const thumb = document.createElement('span');
  thumb.className = 'ri-thumb';
  thumb.setAttribute('aria-hidden', 'true');
  root.querySelector('.ri-periods').prepend(thumb);
  const span = performanceData.weeks.length;
  let geometry = null; // set by drawChart
  let shown = period;  // weeks revealed; fractional while the line moves
  let frame = 0;
  let requests = 0;   // counts animateTo calls, so an unfinished fade cannot finish over a newer one
  const fades = [];   // the fade-outs running before the line is drawn again
  if (!reducedMotion.matches) period = shown = performanceData.periods[0];

  // A mosaic standing for a figure: four rows of blocks, as wide as the figure, shaded from a hash
  // of its text so each figure looks different and the same figure always looks the same.
  function mosaicBlocks(text) {
    const columns = Math.max(6, Math.round(text.length * 2.1)), rows = 4;
    let seed = [...text].reduce((hash, character) => (Math.imul(hash, 31) + character.charCodeAt(0)) >>> 0, 7);
    let cells = '';
    for (let row = 0; row < rows; row++) for (let column = 0; column < columns; column++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const shade = (.1 + (seed >>> 8) % 1000 / 1000 * .55) * (row === 0 || row === rows - 1 ? .6 : 1);
      cells += `<rect x="${column}" y="${row}" width="1.03" height="1.03" opacity="${shade.toFixed(2)}"/>`;
    }
    return { columns, rows, cells };
  }
  // In running text: sized by the font, one em tall.
  function mosaic(text) {
    const { columns, rows, cells } = mosaicBlocks(text);
    return `<svg class="ri-mosaic" viewBox="0 0 ${columns} ${rows}" width="${columns * .25}em" height="${rows * .25}em" fill="currentColor" aria-hidden="true" focusable="false">${cells}</svg>`;
  }
  // Inside the chart: `height` pixels tall and placed with x and y, in chart pixels.
  function chartMosaic(text, height) {
    const { columns, rows, cells } = mosaicBlocks(text);
    return { viewBox: `0 0 ${columns} ${rows}`, width: columns * height / rows, cells };
  }
  const axisHeight = 12, valueHeight = 14; // the sizes the axis figures and the end figure had as text

  // The point on the line after `weeks` weeks (fractional between two weekly figures).
  function pointAt(weeks) {
    const rows = performanceData.weeks;
    const position = Math.min(span, Math.max(1, weeks));
    const index = Math.min(span - 1, Math.floor(position));
    const from = rows[index - 1], to = rows[index], part = position - index;
    const actions = from.actions + (to.actions - from.actions) * part;
    return { x: geometry.x(position), y: geometry.y(actions), actions };
  }
  function setProgress(weeks) {
    shown = weeks;
    if (!geometry) return;
    const point = pointAt(weeks);
    chart.querySelector('[data-ri-clip]').setAttribute('width', Math.max(0, point.x + .5));
    const end = chart.querySelector('[data-ri-end]');
    end.setAttribute('cx', point.x);
    end.setAttribute('cy', point.y);
    // The figure by the end point is a mosaic too (owner, 2026-11-13). It stands for the period
    // being shown, so its blocks keep still while the point travels.
    const value = chart.querySelector('[data-ri-value]');
    const figure = number(performanceData.weeks[period - 1].actions);
    if (value.dataset.riFigure !== figure) {
      const blocks = chartMosaic(figure, valueHeight);
      value.dataset.riFigure = figure;
      value.setAttribute('viewBox', blocks.viewBox);
      value.setAttribute('width', blocks.width);
      value.innerHTML = blocks.cells;
    }
    const width = Number(value.getAttribute('width'));
    value.setAttribute('x', weeks > span - .5 ? point.x - width : point.x - width / 2);
    value.setAttribute('y', point.y - 13 - valueHeight);
  }
  function drawChart() {
    // An unfinished fade belongs to the nodes this replaces: drop it and show its period at once.
    if (fades.length) {
      requests += 1;
      fades.splice(0).forEach(fade => fade.cancel());
      shown = period;
    }
    const step = 500;
    const max = Math.ceil(Math.max(...performanceData.weeks.map(row => row.actions)) / step) * step;
    const { width, height } = chart.getBoundingClientRect();
    const chartWidth = Math.max(180, width);
    const chartHeight = Math.max(180, height);
    const baseline = chartHeight - 36;
    const right = chartWidth - 18;
    chart.setAttribute('viewBox', `0 0 ${chartWidth} ${chartHeight}`);
    // Draw in the rendered CSS-pixel size so mobile labels do not shrink with a desktop viewBox.
    const x = week => 48 + (week - 1) / (span - 1) * (right - 48);
    const y = actions => baseline - actions / max * (baseline - 32);
    geometry = { x, y };
    const points = performanceData.weeks.map(row => `${x(row.week)},${y(row.actions)}`).join(' ');
    // The scale's figures are blocks as well, right-aligned where the numbers stood.
    const axisMosaic = tick => {
      const blocks = chartMosaic(number(tick), axisHeight);
      return `<svg class="ri-axis-mosaic" x="${38 - blocks.width}" y="${y(tick) - axisHeight / 2}" width="${blocks.width}" height="${axisHeight}" viewBox="${blocks.viewBox}" fill="currentColor" aria-hidden="true" focusable="false">${blocks.cells}</svg>`;
    };
    chart.innerHTML = `
      <title id="ri-chart-title">${t('주간 완료 행동')}</title><desc id="ri-chart-description"></desc>
      <defs><clipPath id="ri-reveal"><rect data-ri-clip x="0" y="0" width="0" height="${chartHeight}"/></clipPath></defs>
      ${Array.from({ length: max / step + 1 }, (_, index) => index * step).map(tick => `<line class="ri-gridline" x1="48" y1="${y(tick)}" x2="${right}" y2="${y(tick)}"/>${axisMosaic(tick)}`).join('')}
      <g data-ri-series clip-path="url(#ri-reveal)">
        <polygon class="ri-chart-fill" points="48,${baseline} ${points} ${x(span)},${baseline}"/>
        <polyline class="ri-chart-line" points="${points}"/>
        ${performanceData.weeks.map(row => `<circle class="ri-chart-dot" cx="${x(row.week)}" cy="${y(row.actions)}" r="3.5"/>`).join('')}
      </g>
      <circle class="ri-chart-end" data-ri-end r="6"/>
      <svg class="ri-chart-value" data-ri-value height="${valueHeight}" fill="currentColor" aria-hidden="true" focusable="false"></svg>
      ${[1, ...performanceData.periods].map(week => `<text class="ri-axis" x="${x(week)}" y="${chartHeight - 10}" text-anchor="middle">${language === 'en' ? `W${week}` : `${week}주`}</text>`).join('')}`;
    describeChart();
    setProgress(shown);
  }
  function describeChart() {
    const description = chart.querySelector('#ri-chart-description');
    if (description) description.textContent = language === 'en'
      ? `Illustrative weekly actions for the first ${period} weeks. Full figures are available in the data table below.`
      : `론칭 후 ${period}주간의 주별 완료 행동 예시입니다. 전체 수치는 아래 데이터 표에서 확인할 수 있습니다.`;
  }
  // Move the line from where it is to `target` weeks. Going back (8 to 2), it fades out and is
  // drawn again from the first week.
  function animateTo(target) {
    cancelAnimationFrame(frame);
    const request = ++requests;
    fades.splice(0).forEach(fade => fade.cancel());
    if (reducedMotion.matches || !geometry) { setProgress(target); return; }
    const glide = (from, to) => {
      const started = performance.now();
      const duration = Math.min(850, 250 + 130 * Math.abs(to - from));
      const run = now => {
        const time = Math.min(1, (now - started) / duration);
        setProgress(from + (to - from) * (1 - Math.pow(1 - time, 3)));
        if (time < 1) frame = requestAnimationFrame(run);
      };
      frame = requestAnimationFrame(run);
    };
    if (target < shown) {
      const parts = [chart.querySelector('[data-ri-series]'), chart.querySelector('[data-ri-end]'), chart.querySelector('[data-ri-value]')];
      fades.push(...parts.map(part => part.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 170, fill: 'forwards' })));
      fades[0].finished.then(() => {
        // A newer request (another period, or a redraw) owns the chart now.
        if (request !== requests) return;
        setProgress(1);
        fades.splice(0).forEach(fade => fade.cancel());
        parts.forEach(part => part.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 170 }));
        glide(1, target);
      }).catch(() => {});
      return;
    }
    glide(shown, target);
  }
  function moveThumb(animate = true) {
    const button = root.querySelector(`[data-ri-period="${period}"]`);
    thumb.style.width = `${button.offsetWidth}px`;
    thumb.style.transform = `translateX(${button.offsetLeft}px)`;
    // The thumb lengthens very slightly while it travels, with no bounce.
    if (animate && !reducedMotion.matches) thumb.animate([{ scale: '1 1' }, { scale: '1.06 .97', offset: .5 }, { scale: '1 1' }], { duration: 400, easing: 'ease-in-out' });
  }
  function showPeriod(next, animate = true) {
    period = next;
    const summary = getPerformanceSummary(period);
    // The totals read as withheld: blocks are drawn in place of each figure, which stays in the
    // markup for screen readers (the weekly figures are in the data table anyway).
    for (const key of ['impressions', 'visits', 'actions']) root.querySelector(`[data-ri-metric="${key}"]`).innerHTML = `<span class="visually-hidden">${number(summary[key])}</span>${mosaic(number(summary[key]))}`;
    root.querySelector('[data-ri-period-label]').textContent = language === 'en' ? `First ${period} weeks since launch` : `론칭 후 ${period}주 누적`;
    root.querySelector('[data-ri-rate]').textContent = language === 'en' ? `Visit-to-action rate ${summary.conversion.toFixed(1)}%` : `방문 대비 완료율 ${summary.conversion.toFixed(1)}%`;
    root.querySelectorAll('[data-ri-period]').forEach(button => {
      button.setAttribute('aria-pressed', String(Number(button.dataset.riPeriod) === period));
      button.textContent = t(`${button.dataset.riPeriod}주`);
    });
    root.querySelector('[data-ri-table]').innerHTML = summary.weeks.map(row => `<tr><th scope="row">${language === 'en' ? `Week ${row.week}` : `${row.week}주`}</th><td>${number(row.impressions)}</td><td>${number(row.visits)}</td><td>${number(row.actions)}</td></tr>`).join('');
    describeChart();
    moveThumb(animate);
    if (animate) animateTo(period);
    else setProgress(period);
  }

  // The periods advance by themselves while the report is on screen and nobody is using it.
  const interval = 2150;
  root.style.setProperty('--ri-interval', `${interval}ms`);
  const report = root.querySelector('.ri-report');
  let timer = 0, holdTimer = 0, inView = false, hovered = false, focused = false, held = false;
  function sync() {
    clearTimeout(timer);
    const state = reducedMotion.matches ? 'reduced-motion' : document.hidden ? 'hidden' : !inView ? 'offscreen' : hovered || focused || held ? 'paused' : 'running';
    root.dataset.riAutoplay = state;
    // Automatic changes should not interrupt a screen reader every few seconds.
    root.querySelector('.ri-metrics').setAttribute('aria-live', state === 'running' ? 'off' : 'polite');
    if (state !== 'running') return;
    timer = setTimeout(() => {
      const order = performanceData.periods;
      showPeriod(order[(order.indexOf(period) + 1) % order.length]);
      sync();
    }, interval);
  }
  report.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') { hovered = true; sync(); } });
  report.addEventListener('pointerleave', event => { if (event.pointerType !== 'touch') { hovered = false; sync(); } });
  report.addEventListener('focusin', event => {
    try { focused = event.target.matches(':focus-visible'); } catch { focused = true; }
    sync();
  });
  report.addEventListener('focusout', event => { if (!report.contains(event.relatedTarget)) { focused = false; sync(); } });
  new IntersectionObserver(entries => { inView = entries[entries.length - 1].isIntersecting; sync(); }, { threshold: .35 }).observe(report);
  document.addEventListener('visibilitychange', sync);
  reducedMotion.addEventListener('change', sync);

  // Keep static nodes in place; the shared site's translation dictionary is frozen.
  const localizedNodes = [];
  const walker = document.createTreeWalker(root, 4);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const key = node.nodeValue.trim();
    if (Object.hasOwn(copy, key)) localizedNodes.push({ node, key, original: node.nodeValue });
  }
  const localizedAttributes = [...root.querySelectorAll('[aria-label]')].map(element => ({ element, key: element.getAttribute('aria-label') }));
  root.querySelectorAll('[data-ri-period]').forEach(button => button.addEventListener('click', () => {
    // A chosen period stays for six seconds before the periods play on. The hold starts first, so
    // the totals are a live region again when they change and a screen reader hears the choice.
    held = true;
    clearTimeout(holdTimer);
    holdTimer = setTimeout(() => { held = false; sync(); }, 6000);
    sync();
    showPeriod(Number(button.dataset.riPeriod));
    sync();
  }));
  document.addEventListener('languagechange', event => {
    language = event.detail.language;
    localizedNodes.forEach(({ node, key, original }) => { node.nodeValue = original.replace(key, t(key)); });
    localizedAttributes.forEach(({ element, key }) => element.setAttribute('aria-label', t(key)));
    drawChart();
    showPeriod(period, false);
  });
  drawChart();
  showPeriod(period, false);
  requestAnimationFrame(() => thumb.classList.add('is-ready'));
  new ResizeObserver(() => { drawChart(); moveThumb(false); }).observe(chart);
  new ResizeObserver(() => moveThumb(false)).observe(root.querySelector('.ri-periods'));
  sync();
  root.dataset.ready = 'true';
}
