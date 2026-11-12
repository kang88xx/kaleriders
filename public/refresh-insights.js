import { performanceData, getPerformanceSummary } from './service-performance-data.js?v=periods-20261112';

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

  function renderReport() {
    const summary = getPerformanceSummary(period);
    for (const key of ['impressions', 'visits', 'actions']) root.querySelector(`[data-ri-metric="${key}"]`).textContent = number(summary[key]);
    root.querySelector('[data-ri-period-label]').textContent = language === 'en' ? `First ${period} weeks since launch` : `론칭 후 ${period}주 누적`;
    root.querySelector('[data-ri-rate]').textContent = language === 'en' ? `Visit-to-action rate ${summary.conversion.toFixed(1)}%` : `방문 대비 완료율 ${summary.conversion.toFixed(1)}%`;
    root.querySelectorAll('[data-ri-period]').forEach(button => {
      button.setAttribute('aria-pressed', String(Number(button.dataset.riPeriod) === period));
      button.textContent = t(`${button.dataset.riPeriod}주`);
    });

    // A fixed scale across periods makes their changes directly comparable.
    const max = Math.ceil(Math.max(...performanceData.weeks.map(row => row.actions)) / 400) * 400;
    const chart = root.querySelector('#ri-chart-svg');
    const { width, height } = chart.getBoundingClientRect();
    const chartWidth = Math.max(180, width);
    const chartHeight = Math.max(180, height);
    const baseline = chartHeight - 36;
    const right = chartWidth - 18;
    chart.setAttribute('viewBox', `0 0 ${chartWidth} ${chartHeight}`);
    // Draw in the rendered CSS-pixel size so mobile labels do not shrink with a desktop viewBox.
    const span = performanceData.weeks.length;
    const x = week => 48 + (week - 1) / (span - 1) * (right - 48);
    const y = actions => baseline - actions / max * (baseline - 32);
    const points = summary.weeks.map(row => `${x(row.week)},${y(row.actions)}`).join(' ');
    const last = summary.weeks.at(-1);
    const chartTitle = t('주간 완료 행동');
    const description = language === 'en'
      ? `Illustrative weekly actions for the first ${period} weeks. Full figures are available in the data table below.`
      : `론칭 후 ${period}주간의 주별 완료 행동 예시입니다. 전체 수치는 아래 데이터 표에서 확인할 수 있습니다.`;
    chart.innerHTML = `
      <title id="ri-chart-title">${chartTitle}</title><desc id="ri-chart-description">${description}</desc>
      ${[0, max / 2, max].map(tick => `<line class="ri-gridline" x1="48" y1="${y(tick)}" x2="${right}" y2="${y(tick)}"/><text class="ri-axis" x="38" y="${y(tick) + 4}" text-anchor="end">${number(tick)}</text>`).join('')}
      <polygon class="ri-chart-fill" points="48,${baseline} ${points} ${x(last.week)},${baseline}"/>
      <polyline class="ri-chart-line" points="${points}"/>
      ${summary.weeks.map(row => `<circle class="ri-chart-dot" cx="${x(row.week)}" cy="${y(row.actions)}" r="3.5"/>`).join('')}
      <circle class="ri-chart-end" cx="${x(last.week)}" cy="${y(last.actions)}" r="6"/>
      <text class="ri-chart-value" x="${x(last.week)}" y="${y(last.actions) - 14}" text-anchor="${last.week === span ? 'end' : 'middle'}">${number(last.actions)}</text>
      ${[1, ...performanceData.periods].map(week => `<text class="ri-axis" x="${x(week)}" y="${chartHeight - 10}" text-anchor="middle">${language === 'en' ? `W${week}` : `${week}주`}</text>`).join('')}`;
    root.querySelector('[data-ri-table]').innerHTML = summary.weeks.map(row => `<tr><th scope="row">${language === 'en' ? `Week ${row.week}` : `${row.week}주`}</th><td>${number(row.impressions)}</td><td>${number(row.visits)}</td><td>${number(row.actions)}</td></tr>`).join('');
  }

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
    period = Number(button.dataset.riPeriod);
    renderReport();
  }));
  document.addEventListener('languagechange', event => {
    language = event.detail.language;
    localizedNodes.forEach(({ node, key, original }) => { node.nodeValue = original.replace(key, t(key)); });
    localizedAttributes.forEach(({ element, key }) => element.setAttribute('aria-label', t(key)));
    renderReport();
  });
  renderReport();
  new ResizeObserver(renderReport).observe(root.querySelector('#ri-chart-svg'));
  root.dataset.ready = 'true';
}
