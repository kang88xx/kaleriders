// Owner-editable draft. All numbers are illustrative, not verified client results.
const copy = (ko, en) => ({ ko, en });
export const serviceContentStatus = 'draft';
export const performanceData = {
  periods: [4, 8, 12], defaultPeriod: 8,
  // Weekly activity in one fictional campaign. Columns: impressions, tracked visits, completed actions.
  weeks: [
    [42000, 1400, 98], [56000, 1800, 144], [68000, 2200, 198], [84000, 2800, 280],
    [92000, 3200, 352], [106000, 3600, 432], [122000, 4000, 520], [140000, 4600, 644],
    [152000, 5000, 750], [168000, 5600, 896], [184000, 6200, 1054], [206000, 7000, 1260],
  ].map(([impressions, visits, actions], index) => ({ week: index + 1, impressions, visits, actions })),
};
export const getRate = (value, total) => total > 0 ? value / total * 100 : null;

export function getPerformanceSummary(period) {
  if (!performanceData.periods.includes(period)) throw new RangeError('Unsupported report period');
  const weeks = performanceData.weeks.slice(0, period);
  const totals = weeks.reduce((sum, row) => ({ impressions: sum.impressions + row.impressions, visits: sum.visits + row.visits, actions: sum.actions + row.actions }), { impressions: 0, visits: 0, actions: 0 });
  return { ...totals, conversion: getRate(totals.actions, totals.visits), weeks };
}
export const serviceData = {
  kol: {
    groups: [
      { label: copy('리서치 · 인사이트', 'Research & insights'), value: 18 },
      { label: copy('Web3 · 트레이딩', 'Web3 & trading'), value: 14 },
      { label: copy('게임 · 라이프스타일', 'Gaming & lifestyle'), value: 10 },
      { label: copy('커뮤니티 리더', 'Community leaders'), value: 6 },
    ],
    views: 800000, engagements: 51200,
  },
  press: {
    groups: [
      { label: copy('Web3 전문 매체', 'Web3 publications'), value: 5 },
      { label: copy('경제 · 비즈니스', 'Business & finance'), value: 4 },
      { label: copy('IT · 테크', 'Technology media'), value: 3 },
    ],
    storyAngles: 3,
  },
  events: {
    formats: [
      { label: copy('커뮤니티 밋업', 'Community meetup'), min: 30, max: 80, detail: copy('대화 · 데모 · 네트워킹', 'Conversation · demos · networking') },
      { label: copy('브랜드 · 사이드 행사', 'Brand & side event'), min: 100, max: 300, detail: copy('프로그램 · 파트너 · 콘텐츠', 'Program · partners · content') },
      { label: copy('대형 컨퍼런스', 'Large conference'), min: 500, max: 1000, detail: copy('무대 · 운영팀 · 현장 총괄', 'Stage · crew · production') },
    ],
  },
  community: {
    stages: [
      { label: copy('캠페인 방문', 'Campaign visits'), value: 10000 },
      { label: copy('커뮤니티 입장', 'Community joins'), value: 3200 },
      { label: copy('미션 · 에어드랍 참여', 'Quest & airdrop entries'), value: 1920 },
      { label: copy('프로젝트 서비스 체험', 'Product trials'), value: 864 },
    ],
  },
};
export const serviceCopy = {
  eyebrow: 'MADE FOR KOREA. MEASURED FOR YOU.',
  title: copy('실행은 구체적으로.\n성과는 한눈에.', 'Local expertise.\nVisible progress.'),
  intro: copy('한국 시장의 첫 접점부터 실제 참여까지. 필요한 서비스를 연결하고, 무엇이 달라졌는지 데이터로 전달합니다.', 'From a first connection in Korea to real participation. We connect the services you need and make progress clear through data.'),
  draft: copy('예시 데이터 · 아래 수치와 그래프는 서비스 설명을 위한 가상 예시입니다. 실제 실적이나 보장 수치가 아닙니다.', 'Illustrative data · Figures and charts below explain the service. They are not verified results or guaranteed outcomes.'),
  sample: copy('예시 데이터', 'Illustrative data'),
  jumpLabel: copy('서비스 상세 바로가기', 'Explore our services'),
  deliverables: copy('함께 제공하는 것', 'What you receive'),
  cta: copy('우리 프로젝트에 맞게 이야기하기', 'Let’s shape your project'),
  ctaIntro: copy('목표에 맞는 조합으로 시작하세요.', 'Start with the right mix for your goals.'),
  ctaDescription: copy('서비스 하나부터 통합 캠페인까지, 목표·예산·일정에 맞춰 실행 범위를 설계합니다.', 'From one service to a coordinated campaign, we scope the work around your goals, budget and timeline.'),
  sections: [
    {
      id: 'performance', number: '01', label: copy('성과 분석', 'Performance'), eyebrow: 'MEASURE & LEARN',
      title: copy('보고서에서 끝나지 않는,\n다음 실행의 근거.', 'Clear reporting.\nBetter next steps.'),
      description: copy('노출부터 방문, 실제 참여까지 한 흐름으로 분석합니다. 클라이언트에게 그래프와 해석을 함께 제공하고, 다음 캠페인의 우선순위를 제안합니다.', 'We follow the journey from exposure to visits and participation. Clients receive charts, interpretation and priorities for the next campaign.'),
      deliverables: [copy('목표·KPI·측정 기준 설계', 'Goals, KPIs and measurement plan'), copy('주간 추이와 채널별 성과 분석', 'Weekly trends and channel analysis'), copy('월간 리포트와 개선 액션 전달', 'Monthly report and next actions')],
    },
    {
      id: 'kol', number: '02', label: copy('한국 KOL', 'Korean KOLs'), eyebrow: 'THE RIGHT VOICES',
      title: copy('한국 KOL 그룹,\n우리에게 맞는 연결.', 'Korean voices.\nThe right audience.'),
      description: copy('한국 KOL 그룹을 기반으로 프로젝트에 맞는 크리에이터를 연결합니다. 팔로워 수와 함께 주제 적합성, 실제 반응, 참여 비용을 살펴 집행 효율을 높입니다.', 'We connect projects with our Korean KOL group. Topic fit, audience response and cost per action guide creator selection alongside follower counts.'),
      deliverables: [copy('타깃·카테고리별 KOL 매칭', 'KOL matching by audience and category'), copy('콘텐츠 브리프·현지 메시지 기획', 'Content briefs and local messaging'), copy('게시 일정·커뮤니케이션 관리', 'Publishing and creator coordination'), copy('반응률·유입·참여 효율 분석', 'Engagement, traffic and efficiency review')],
    },
    {
      id: 'press', number: '03', label: copy('한국 언론', 'Korean press'), eyebrow: 'A STORY WORTH SHARING',
      title: copy('한국의 기사로,\n프로젝트를 알리다.', 'Your story,\nin the Korean press.'),
      description: copy('한국 독자가 이해할 수 있는 보도자료와 스토리를 준비하고, 국내 언론 사이트의 기사 노출을 위한 배포·피칭을 진행합니다. 게재 후에는 링크와 반응을 정리합니다.', 'We prepare Korean press materials and story angles, then distribute and pitch them to local publications. Published links and available responses are collected in a coverage report.'),
      deliverables: [copy('국문 보도자료·인터뷰 자료 작성', 'Korean releases and interview materials'), copy('매체 리스트·스토리별 피칭', 'Media list and tailored story pitching'), copy('기사 게재·유료 노출 범위 조율', 'Editorial and paid placement coordination'), copy('기사 링크·유입 클리핑 리포트', 'Coverage links and traffic report')],
    },
    {
      id: 'events', number: '04', label: copy('행사 · 밋업', 'Events & meetups'), eyebrow: 'BRING PEOPLE TOGETHER',
      title: copy('작은 밋업부터,\n큰 무대의 순간까지.', 'Small gatherings.\nBig shared moments.'),
      description: copy('한국 내 대형 행사, 브랜드 이벤트, 소규모 밋업을 기획하고 대행합니다. 전체 운영부터 필요한 현장 서포트까지 기존 팀과 유연하게 함께합니다.', 'We plan and produce large events, brand experiences and intimate meetups in Korea. Work with us on full production or selected on-site support alongside your team.'),
      deliverables: [copy('장소·예산·프로그램 기획', 'Venue, budget and program planning'), copy('초청·등록·참가자 커뮤니케이션', 'Invitations, registration and guest support'), copy('무대·스태프·통역·현장 진행', 'Stage, crew, interpretation and operations'), copy('사진·리캡·참석 데이터 정리', 'Photography, recaps and attendance reporting')],
    },
    {
      id: 'community', number: '05', label: copy('커뮤니티 참여', 'Community activation'), eyebrow: 'FROM INTEREST TO PARTICIPATION',
      title: copy('에어드랍의 관심을,\n서비스 경험으로.', 'From an airdrop\nto a product experience.'),
      description: copy('커뮤니티 에어드랍과 미션을 프로젝트 서비스의 첫 경험으로 연결합니다. 공지·온보딩·참여 안내를 설계하고, 실제 체험까지 이어지는 흐름을 운영합니다.', 'We connect community airdrops and quests with a first product experience. Announcements, onboarding and participation guidance help people move from interest to trying the service.'),
      deliverables: [copy('에어드랍·참여 미션 구성', 'Airdrop and participation quest design'), copy('한국어 온보딩·사용 안내', 'Korean onboarding and product guides'), copy('참여 조건·중복·문의 관리', 'Eligibility, duplicate checks and support'), copy('완료율·서비스 체험 전환 분석', 'Completion and product trial analysis')],
    },
  ],
  report: {
    title: copy('캠페인 성과 리포트', 'Campaign performance report'),
    periodLabel: copy('론칭 후 누적 기간 선택', 'Select cumulative weeks since launch'),
    period: copy('론칭 후 {n}주 누적', 'First {n} weeks since launch'),
    week: copy('{n}주', '{n} weeks'),
    weekColumn: copy('주차', 'Week'),
    metrics: [copy('누적 노출', 'Total impressions'), copy('추적 방문', 'Tracked visits'), copy('완료 행동', 'Completed actions'), copy('방문 대비 완료율', 'Visit-to-action rate')],
    tableHeaders: [copy('주차', 'Week'), copy('주간 노출', 'Weekly impressions'), copy('주간 방문', 'Weekly visits'), copy('주간 완료 행동', 'Weekly actions'), copy('방문 대비 완료율', 'Visit-to-action rate')],
    chartTitle: copy('주간 완료 행동 추이', 'Completed actions by week'),
    chartUnit: copy('단위: 건 · 주차별 예시', 'Unit: actions · weekly example'),
    table: copy('그래프 수치 자세히 보기', 'View the chart data'),
    method: copy('완료율 = 완료 행동 ÷ 추적 방문. 노출은 중복을 포함하며, 클릭·미션 완료 등 합의한 이벤트와 UTM 기준으로 보고합니다. 방문이 없으면 완료율은 —로 표시합니다.', 'Rate = completed actions ÷ tracked visits. Impressions can repeat; reports use agreed events and UTM attribution. A dash means there are no visits to calculate a rate.'),
    insightTitle: copy('숫자에 해석을 더합니다.', 'Numbers, with a clear next step.'),
    analysis: [
      { label: copy('관찰', 'Observe'), text: copy('유입과 완료 행동의 주간 추이를 나란히 확인합니다.', 'Read weekly visits alongside completed actions.') },
      { label: copy('해석', 'Understand'), text: copy('반응이 좋은 채널·콘텐츠와 참여가 끊기는 지점을 찾습니다.', 'Find responsive channels and content, and where participation drops.') },
      { label: copy('다음 실행', 'Act'), text: copy('효율이 높은 조합에 집중하고, 온보딩 문구와 미션 난이도를 조정합니다.', 'Focus on effective combinations and refine onboarding and quests.') },
    ],
    handoff: copy('클라이언트 제공 · 그래프 리포트 + 채널별 데이터 + 실행 제안', 'Client handoff · charts + channel data + recommended actions'),
  },
  kol: {
    headline: copy('분야별 KOL 구성 예시', 'Illustrative KOL mix'),
    groupLabel: copy('KOL 그룹 구성 예시', 'KOLs in the example group'),
    engagementLabel: copy('콘텐츠 반응률 예시', 'Example engagement rate'),
    note: copy('구성 인원은 가상 예시입니다. 반응률 = 반응 수 ÷ 콘텐츠 조회 수이며, 실제 집행은 개별 채널 데이터를 확인합니다.', 'Group sizes are illustrative. Engagement rate = engagements ÷ content views; live campaigns use verified channel data.'),
  },
  press: {
    headline: copy('프로젝트에 맞춘 매체 구성', 'A media mix for your story'),
    targetsLabel: copy('피칭 대상 매체 예시', 'Example pitching targets'),
    anglesLabel: copy('스토리 앵글 예시', 'Example story angles'),
    note: copy('위 수치는 제안 구성 예시이며 게재 실적이 아닙니다. 기사 게재는 매체의 편집 판단과 집행 조건에 따라 달라집니다.', 'This is an illustrative outreach plan, not published coverage. Publication depends on editorial decisions and placement terms.'),
  },
  events: {
    headline: copy('목적에 맞게 설계하는 행사 규모', 'An event format for every goal'),
    attendees: copy('명', 'people'),
    note: copy('인원 범위는 기획 예시입니다. 실제 수용 인원은 장소·예산·운영 조건에 맞춰 확정합니다.', 'Capacity ranges are planning examples. Final capacity depends on the venue, budget and operating requirements.'),
    link: copy('실제 행사 사진과 사례 보기', 'Explore event photos and stories'),
  },
  community: {
    headline: copy('참여를 서비스 체험으로 연결', 'Make participation lead to a product trial'),
    rateLabel: copy('미션 참여 → 서비스 체험', 'Quest entry → product trial'),
    chartUnit: copy('단위: 건 · 단계별 참여 예시', 'Unit: actions · illustrative journey'),
    note: copy('전환율 = 서비스 체험 ÷ 미션 참여. 단계별 집계 기준과 중복 제외 조건을 정하고, 보상 조건은 프로젝트와 함께 안내합니다.', 'Conversion = product trials ÷ quest entries. We agree counting and deduplication rules, and communicate reward conditions with the project.'),
  },
};
