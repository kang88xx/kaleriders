const services = [
  {
    id: 'kol', label: ['KOL 연결', 'KOL campaigns'],
    heading: [['우리의 이야기를,', 'Your story,'], ['맞는 사람의 목소리로.', 'through Korean creators.']],
    body: ['프로젝트와 결이 맞는 한국 KOL을 연결합니다. 콘텐츠 기획부터 발행과 반응 확인까지 함께합니다.', 'We match your project with Korean KOLs and help plan content, coordinate publishing and track audience response.'],
    pills: [['KOL 매칭', 'KOL matching'], ['콘텐츠 기획', 'Content planning'], ['캠페인 운영', 'Campaign management']],
    icon: '<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 5a3 3 0 0 1 0 6m1 4a5 5 0 0 1 3 5"/>',
    art: '<path d="M120 105 250 180 365 95M250 180 370 285M250 180 110 285" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="250" cy="180" r="70" fill="var(--blue)"/><circle cx="120" cy="105" r="40" fill="var(--paper)"/><circle cx="365" cy="95" r="30" fill="var(--paper)"/><circle cx="370" cy="285" r="45" fill="var(--paper)"/><circle cx="110" cy="285" r="30" fill="var(--paper)"/><g fill="none" stroke="currentColor" stroke-width="2"><circle cx="120" cy="96" r="9"/><path d="M102 121c0-20 36-20 36 0"/><circle cx="370" cy="276" r="10"/><path d="M349 303c0-23 42-23 42 0"/><circle cx="365" cy="95" r="10"/><path d="m100 285 7 7 14-14"/></g><text x="250" y="189" text-anchor="middle" fill="var(--lime)" font-size="28" font-family="Arial">KALE</text><circle cx="250" cy="180" r="94" fill="none" stroke="currentColor" opacity=".25" stroke-dasharray="3 7"/>'
  },
  {
    id: 'meetup', label: ['밋업', 'Meetups'],
    heading: [['온라인의 관심이,', 'Meet your community'], ['직접 만나는 사이로.', 'in person.']],
    body: ['프로젝트와 커뮤니티가 가까워지는 작은 만남을 만듭니다. 공간 섭외, 참가자 모집, 현장 진행을 함께 준비합니다.', 'We help your project meet its community in person, with venue sourcing, guest invitations and on-site hosting.'],
    pills: [['장소 섭외', 'Venue sourcing'], ['참가자 모집', 'Guest invitations'], ['현장 진행', 'On-site hosting']],
    icon: '<path d="M21 11a8 8 0 0 1-8 8H5l-4 3V11a8 8 0 0 1 8-8h4a8 8 0 0 1 8 8Z"/><path d="M7 10h8M7 14h5"/>',
    art: '<ellipse cx="250" cy="225" rx="155" ry="72" fill="var(--paper)" stroke="currentColor" stroke-width="1.5"/><ellipse cx="250" cy="204" rx="155" ry="72" fill="var(--lime)" stroke="currentColor" stroke-width="1.5"/><g fill="var(--blue)"><circle cx="130" cy="135" r="22"/><circle cx="250" cy="94" r="22"/><circle cx="370" cy="135" r="22"/></g><g fill="none" stroke="currentColor" stroke-width="1.5"><path d="M97 171c0-32 66-32 66 0M217 130c0-32 66-32 66 0M337 171c0-32 66-32 66 0"/><path d="M190 212h120M250 187v50"/></g><path d="M214 282h72v40h-25l-13 12v-12h-34Z" fill="var(--paper)" stroke="currentColor" stroke-width="1.5"/><text x="250" y="308" text-anchor="middle" fill="currentColor" font-size="18" font-family="Georgia" font-style="italic">hello.</text>'
  },
  {
    id: 'press', label: ['언론보도', 'Press outreach'],
    heading: [['한국에 전할 이야기,', 'Your news,'], ['읽히는 소식으로.', 'for Korean readers.']],
    body: ['한국 독자의 관점에서 프로젝트의 소식을 정리합니다. 보도자료 작성과 미디어 피칭, 게재 결과 정리를 지원합니다.', 'We prepare your news for Korean readers, write press materials, pitch relevant media and track published coverage.'],
    pills: [['보도자료 작성', 'Press materials'], ['미디어 피칭', 'Media pitching'], ['게재 모니터링', 'Coverage tracking']],
    icon: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h3M14 15h2M8 18h8"/>',
    art: '<g transform="rotate(-8 250 190)"><rect x="139" y="55" width="236" height="278" rx="4" fill="var(--blue)" opacity=".13"/><rect x="124" y="44" width="236" height="278" rx="4" fill="var(--paper)" stroke="currentColor" stroke-width="1.5"/><text x="147" y="86" fill="currentColor" font-size="23" font-family="Georgia" font-style="italic">Project news.</text><path d="M146 103h191" fill="none" stroke="currentColor"/><rect x="146" y="124" width="88" height="88" fill="var(--lime)"/><circle cx="190" cy="168" r="27" fill="none" stroke="currentColor"/><path d="m176 168 10 10 20-20M252 128h83M252 146h65M252 164h83M252 182h72M252 200h56M146 239h191M146 257h191M146 275h145" fill="none" stroke="currentColor" stroke-width="2"/></g><circle cx="375" cy="89" r="32" fill="var(--lime)" stroke="currentColor"/><path d="m361 89 10 10 18-20" fill="none" stroke="currentColor" stroke-width="2"/>'
  },
  {
    id: 'airdrop', label: ['에어드랍', 'Airdrops'],
    heading: [['첫 참여의 계기를,', 'A first chance to try.'], ['다음 경험의 시작으로.', 'A reason to return.']],
    body: ['프로젝트를 직접 경험하는 참여형 캠페인을 설계합니다. 미션과 참여 안내부터 참여자 확인, 결과 정리까지 운영합니다.', 'We plan campaigns that let people try your project, from missions and participant guides to eligibility checks and reporting.'],
    pills: [['참여 미션 설계', 'Mission design'], ['커뮤니티 안내', 'Community guides'], ['참여 결과 확인', 'Participation review']],
    icon: '<path d="M12 3v10m-4-4 4 4 4-4M4 15v6h16v-6"/>',
    art: '<circle cx="250" cy="190" r="140" fill="none" stroke="currentColor" opacity=".2"/><circle cx="250" cy="190" r="103" fill="none" stroke="currentColor" opacity=".25" stroke-dasharray="4 7"/><rect x="182" y="168" width="136" height="104" rx="3" fill="var(--paper)" stroke="currentColor" stroke-width="2"/><path d="M170 145h160v36H170z" fill="var(--lime)" stroke="currentColor" stroke-width="2"/><path d="M250 145v127" fill="none" stroke="currentColor" stroke-width="2"/><path d="M250 143c-75-6-53-67-15-37 8 7 12 20 15 37Zm0 0c75-6 53-67 15-37-8 7-12 20-15 37Z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="112" cy="170" r="12" fill="var(--blue)"/><circle cx="357" cy="284" r="9" fill="var(--blue)"/><path d="M365 102h30m-15-15v30M121 287h20m-10-10v20" fill="none" stroke="currentColor" stroke-width="2"/>'
  },
  {
    id: 'events', label: ['KBW 및 행사 대행 운영', 'KBW & event production'],
    heading: [['기억에 남는 무대,', 'An event worth attending.'], ['그 뒤의 빈틈없는 준비.', 'A team to run it.']],
    body: ['KBW 사이드 이벤트부터 브랜드 행사까지. 콘셉트와 공간, 파트너 조율, 현장 운영을 하나의 흐름으로 연결합니다.', 'We plan and run KBW side events and brand events, coordinating the concept, venue, partners and on-site work.'],
    pills: [['행사 기획', 'Event planning'], ['파트너 조율', 'Partner coordination'], ['현장 운영', 'Event production']],
    icon: '<path d="M3 21V6h18v15M3 10h18M8 3v6M16 3v6M7 15h3M14 15h3M7 18h3M14 18h3"/>',
    art: '<path d="M85 289V100h330v189" fill="none" stroke="currentColor" stroke-width="2"/><path d="m85 100 50-38h230l50 38M135 62v38M365 62v38" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="116" y="126" width="268" height="136" rx="3" fill="var(--blue)"/><text x="250" y="185" text-anchor="middle" fill="var(--lime)" font-size="36" font-family="Arial">LET’S MEET.</text><text x="250" y="218" text-anchor="middle" fill="var(--paper)" font-size="12" letter-spacing="3" font-family="Arial">SEOUL, KOREA</text><path d="M69 289h362v21H69z" fill="var(--paper)" stroke="currentColor" stroke-width="1.5"/><path d="M180 310v20h140v-20" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="m110 101 22 24-40 9 7-33M390 101l-22 24 40 9-7-33" fill="var(--lime)" stroke="currentColor"/>'
  }
];

const escape = text => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
const copy = ([ko, en]) => `<span data-rs-ko="${escape(ko)}" data-rs-en="${escape(en)}">${escape(ko)}</span>`;

export function initRefreshServices() {
  const root = document.querySelector('#refresh-services-root');
  if (!root || root.dataset.ready === 'true') return;
  root.innerHTML = `
    <div class="services-heading"><div><h2 id="services-title">${copy(['가능성에 방향을.', 'A plan for Korea.'])}<br>${copy(['아이디어에 움직임을.', 'Support to carry it out.'])}</h2></div><p>${copy(['필요한 일을, 필요한 순간에.', 'Choose the support you need.'])}<br>${copy(['전략부터 실행까지 함께합니다.', 'We help with planning and delivery.'])}</p></div>
    <div class="service-tabs" role="tablist" aria-label="Services">
      ${services.map((service, index) => `<button type="button" id="tab-${service.id}" role="tab" aria-selected="${index === 0}" aria-controls="panel-${service.id}" tabindex="${index === 0 ? 0 : -1}" data-tab="${service.id}"><svg class="service-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${service.icon}</svg>${copy(service.label)}</button>`).join('')}
    </div>
    ${services.map((service, index) => `<div class="service-panel rs-panel" id="panel-${service.id}" role="tabpanel" aria-labelledby="tab-${service.id}" tabindex="0"${index ? ' hidden' : ''}><div class="panel-copy"><h3>${service.heading.map(copy).join('<br>')}</h3><p>${copy(service.body)}</p><ul>${service.pills.map(pill => `<li>${copy(pill)}</li>`).join('')}</ul><button type="button" class="button rs-inquiry" data-open-brief data-brief-service="${escape(service.label[0])}">${copy(['이 서비스 문의하기', 'Ask about this service'])}<span aria-hidden="true">↗</span></button></div><div class="service-art rs-art rs-art-${service.id}" aria-hidden="true"><span class="art-label">KALE RIDERS / ${service.label[1].toUpperCase()}</span><svg viewBox="0 0 500 380" focusable="false" aria-hidden="true">${service.art}</svg><span class="rs-art-caption">PLANNING & DELIVERY</span></div></div>`).join('')}`;
  const localize = () => root.querySelectorAll('[data-rs-ko]').forEach(node => {
    node.firstChild.nodeValue = document.documentElement.lang === 'en' ? node.dataset.rsEn : node.dataset.rsKo;
  });
  document.addEventListener('languagechange', localize);
  root.dataset.ready = 'true';
}
