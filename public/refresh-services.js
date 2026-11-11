const escape = text => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
const copy = ([ko, en]) => `<span data-rs-ko="${escape(ko)}" data-rs-en="${escape(en)}">${escape(ko)}</span>`;

// Service artwork: each panel draws its three steps as numbered cards on a 480×380 canvas.
// Card numbers match the numbered steps beside them. Each <g data-box> has one [data-card]
// shape that holds all of its labels; QA checks that no label leaves that shape.
const r1 = value => Math.round(value * 10) / 10;
const svgCopy = ([ko, en]) => `<tspan data-rs-ko="${escape(ko)}" data-rs-en="${escape(en)}">${escape(ko)}</tspan>`;
const label = (x, y, text, { size = 16, weight = 600, anchor = 'start', fill = 'currentColor', opacity = 1, spacing = 0, family = '' } = {}) =>
  `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" fill="${fill}"${opacity < 1 ? ` opacity="${opacity}"` : ''}${spacing ? ` letter-spacing="${spacing}"` : ''}${family ? ` font-family="${family}"` : ''}>${Array.isArray(text) ? svgCopy(text) : escape(text)}</text>`;
const bar = (x, y, length, { width = 6, opacity = .22, color = 'currentColor' } = {}) =>
  `<path d="M${x} ${y}h${length}" stroke="${color}" stroke-width="${width}" stroke-linecap="round" opacity="${opacity}"/>`;
const tick = (cx, cy, r = 10, fill = 'var(--lime)') =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="currentColor" stroke-width="1.5"/><path d="M${r1(cx - r * .42)} ${r1(cy + r * .02)}l${r1(r * .3)} ${r1(r * .3)} ${r1(r * .55)} ${r1(-r * .62)}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
const cross = (cx, cy, r = 10) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="var(--paper)" stroke="currentColor" stroke-width="1.5"/><path d="M${r1(cx - r * .35)} ${r1(cy - r * .35)}l${r1(r * .7)} ${r1(r * .7)}m0 ${r1(-r * .7)}l${r1(-r * .7)} ${r1(r * .7)}" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`;
const person = (cx, cy, r, fill) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="currentColor" stroke-width="1.5"/><circle cx="${cx}" cy="${r1(cy - r * .22)}" r="${r1(r * .3)}" fill="currentColor"/><path d="M${r1(cx - r * .56)} ${r1(cy + r * .66)}a${r1(r * .56)} ${r1(r * .5)} 0 0 1 ${r1(r * 1.12)} 0z" fill="currentColor"/>`;
const card = (x, y, w, h, fill = 'var(--paper)', radius = 14) =>
  `<rect x="${x + 5}" y="${y + 7}" width="${w}" height="${h}" rx="${radius}" fill="currentColor" opacity=".14"/><rect data-card x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" stroke="currentColor" stroke-width="1.5"/>`;
const box = (...parts) => `<g data-box>${parts.join('')}</g>`;
const step = (number, [x, y], ...parts) =>
  `<g class="rs-card" style="--step:${number}">${parts.join('')}<circle cx="${x}" cy="${y}" r="15" fill="var(--blue)" stroke="var(--paper)" stroke-width="3"/><text data-badge x="${x}" y="${y + 5.5}" font-size="15" font-weight="700" text-anchor="middle" fill="var(--paper)">${number}</text></g>`;
const heart = (x, y, size = 1, fill = 'var(--lime)') =>
  `<path transform="translate(${x} ${y}) scale(${size})" d="M0 7C-7 2-11-2-11-6a5.5 5.5 0 0 1 11-1.5A5.5 5.5 0 0 1 11-6c0 4-4 8-11 13z" fill="${fill}" stroke="currentColor" stroke-width="${r1(1.5 / size)}"/>`;
const qr = (x, y, cell, rows) => rows.map((row, j) => [...row].map((bit, i) => bit === '1' ? `<rect x="${r1(x + i * cell)}" y="${r1(y + j * cell)}" width="${cell}" height="${cell}" fill="currentColor"/>` : '').join('')).join('');

const kolArt = [
  step(1, [20, 40], box(card(20, 40, 180, 224),
    label(38, 76, ['추천 KOL', 'Shortlist'], { size: 15, weight: 700, opacity: .7 }),
    ...[['리서치', 'Research', 'var(--lime)', true], ['트레이딩', 'Trading', 'var(--pale)', true], ['게임', 'Gaming', '#f6d9bf', true], ['커뮤니티', 'Community', '#ffffff', false]]
      .map(([ko, en, fill, matched], index) => {
        const y = 110 + index * 42;
        return (index ? `<path d="M34 ${y - 21}h152" stroke="currentColor" opacity=".12"/>` : '') + person(52, y, 15, fill) + label(76, y + 5.5, [ko, en])
          + (matched ? tick(178, y, 9) : `<circle cx="178" cy="${y}" r="9" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".35"/>`);
      }))),
  step(2, [216, 24], box(card(216, 24, 244, 230),
    person(246, 58, 15, 'var(--lime)'), bar(270, 52, 76, { width: 7, opacity: .5 }), bar(270, 66, 50, { width: 5, opacity: .25 }),
    `<rect x="376" y="44" width="68" height="26" rx="13" fill="var(--blue)"/>`, label(410, 62, ['한국어', 'Korean'], { size: 14, weight: 700, anchor: 'middle', fill: 'var(--paper)' }),
    label(234, 106, '새 프로젝트를 소개해요', { size: 17, weight: 700 }), bar(234, 128, 196), bar(234, 144, 148),
    `<rect x="234" y="158" width="210" height="62" rx="10" fill="var(--blue)"/><circle cx="270" cy="189" r="17" fill="var(--lime)"/>`,
    bar(302, 180, 104, { width: 7, opacity: .9, color: 'var(--paper)' }), bar(302, 198, 66, { width: 7, opacity: .55, color: 'var(--paper)' }),
    heart(246, 238, .8), bar(262, 240, 20, { width: 5, opacity: .3 }),
    `<path d="M300 232h20a5 5 0 0 1 5 5v5a5 5 0 0 1-5 5h-12l-7 5v-5a5 5 0 0 1-6-5v-5a5 5 0 0 1 5-5z" fill="var(--paper)" stroke="currentColor" stroke-width="1.5"/>`, bar(334, 240, 16, { width: 5, opacity: .3 }),
    `<path d="M368 244l12-12m-8 0h8v8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`, bar(392, 240, 14, { width: 5, opacity: .3 }))),
  step(3, [20, 280], box(card(20, 280, 316, 86),
    label(38, 310, ['게시 일정', 'Posting schedule'], { size: 16, weight: 700 }),
    `<rect x="220" y="294" width="100" height="24" rx="12" fill="var(--lime)" stroke="currentColor" stroke-width="1.2"/><circle cx="234" cy="306" r="4" fill="var(--blue)"/>`,
    label(278, 311, ['반응 확인 중', 'Tracking'], { size: 14, weight: 700, anchor: 'middle' }),
    ...[0, 1, 2, 3, 4].map(index => {
      const x = 38 + index * 58;
      const mark = index === 0 || index === 2 ? tick(x + 23, 341, 7) : index === 4 ? `<circle cx="${x + 23}" cy="${341}" r="5" fill="var(--blue)"/>` : '';
      return `<rect x="${x}" y="326" width="46" height="30" rx="6" fill="var(--pale)" stroke="currentColor" stroke-width="1" opacity=".95"/><path d="M${x} 332a6 6 0 0 1 6-6h34a6 6 0 0 1 6 6v1H${x}z" fill="var(--blue)"/>${mark}`;
    }))),
  heart(372, 316, 1.3), heart(418, 292, 1), heart(448, 334, .8, 'var(--paper)'), heart(400, 352, .7),
].join('');

const ticket = 'M234 28H378a14 14 0 0 0 28 0H446a14 14 0 0 1 14 14V164a14 14 0 0 1-14 14H406a14 14 0 0 0-28 0H234a14 14 0 0 1-14-14V42a14 14 0 0 1 14-14Z';
const meetupArt = [
  step(1, [20, 36], box(card(20, 36, 190, 172),
    `<rect x="34" y="50" width="162" height="112" rx="8" fill="var(--pale)"/>`,
    `<path d="M34 94H196M96 50V162" stroke="var(--paper)" stroke-width="7"/><path d="M152 50l24 112" stroke="var(--paper)" stroke-width="5"/>`,
    `<path d="M34 142C72 128 112 158 196 134" fill="none" stroke="#b9c8f0" stroke-width="9"/><rect x="112" y="104" width="30" height="20" rx="4" fill="var(--lime)" opacity=".9"/>`,
    `<path d="M122 106C110 92 104 84 104 76a18 18 0 1 1 36 0c0 8-6 16-18 30Z" fill="var(--blue)" stroke="var(--paper)" stroke-width="2"/><circle cx="122" cy="76" r="7" fill="var(--paper)"/>`,
    label(38, 190, ['서울', 'Seoul'], { size: 16, weight: 700 }), tick(190, 184, 9))),
  step(2, [220, 28], box(
    `<path d="${ticket}" transform="translate(5 7)" fill="currentColor" opacity=".14"/><path data-card d="${ticket}" fill="var(--paper)" stroke="currentColor" stroke-width="1.5"/>`,
    label(240, 60, ['초대장', 'INVITATION'], { size: 14, weight: 700, opacity: .65, spacing: 1.5 }),
    label(240, 88, ['커뮤니티', 'Community'], { size: 21, weight: 800 }), label(240, 113, ['밋업', 'meetup'], { size: 21, weight: 800 }),
    label(240, 138, ['19:00 · 서울', '7 PM · Seoul'], { size: 14, opacity: .75 }),
    person(250, 160, 9, 'var(--lime)'), person(266, 160, 9, 'var(--pale)'), person(282, 160, 9, '#f6d9bf'),
    label(298, 165, ['참석 확인', 'RSVP'], { size: 14, weight: 700 }),
    `<path d="M392 48V158" stroke="currentColor" stroke-dasharray="3 5" opacity=".45"/>`,
    qr(408, 58, 7.2, ['11011', '10101', '01110', '10011', '11010']), tick(426, 132, 11))),
  step(3, [66, 224], `<g transform="rotate(-5 155 290)">${box(card(66, 224, 178, 134),
    `<rect x="135" y="234" width="40" height="8" rx="4" fill="none" stroke="currentColor" opacity=".4"/>`,
    `<rect x="66" y="252" width="178" height="54" fill="var(--blue)"/>`,
    label(155, 279, ['안녕하세요', 'HELLO'], { size: 21, weight: 800, anchor: 'middle', fill: 'var(--paper)', spacing: 1 }),
    label(155, 298, ['제 이름은', 'my name is'], { size: 14, anchor: 'middle', fill: 'var(--paper)', opacity: .85 }),
    `<path d="M106 334c10-12 18-12 22 0s14 8 22-4 14-10 20 2 12 6 24-6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`)}</g>`,
    box(`<rect data-card x="268" y="222" width="192" height="48" rx="24" fill="var(--paper)" stroke="currentColor" stroke-width="1.5"/><path d="M292 269l-8 15 22-13" fill="var(--paper)" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>`,
      label(364, 252, ['반가워요!', 'Nice to meet you!'], { size: 16, weight: 700, anchor: 'middle' })),
    box(`<rect data-card x="300" y="294" width="152" height="46" rx="23" fill="var(--lime)" stroke="currentColor" stroke-width="1.5"/><path d="M430 339l8 15-22-13" fill="var(--lime)" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>`,
      label(376, 323, ['저도요 :)', 'Same here!'], { size: 16, weight: 700, anchor: 'middle' }))),
].join('');

const pressArt = [
  step(1, [24, 34], box(card(24, 34, 180, 232),
    label(42, 66, ['보도자료', 'PRESS RELEASE'], { size: 14, weight: 800, spacing: .5 }),
    `<path d="M42 80h144" stroke="currentColor" stroke-width="1.5" opacity=".35"/>`,
    bar(42, 100, 136, { width: 9, opacity: .55 }), bar(42, 118, 96, { width: 9, opacity: .55 }),
    bar(42, 142, 144), bar(42, 158, 130), bar(42, 174, 144), bar(42, 190, 108),
    `<rect x="42" y="212" width="44" height="26" rx="13" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M96 225h22m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><rect x="128" y="212" width="44" height="26" rx="13" fill="var(--blue)"/>`,
    label(64, 230, 'EN', { size: 14, weight: 700, anchor: 'middle' }), label(150, 230, 'KO', { size: 14, weight: 700, anchor: 'middle', fill: 'var(--paper)' }))),
  step(2, [196, 86], box(card(196, 86, 190, 126),
    `<circle cx="212" cy="104" r="3.5" fill="currentColor" opacity=".3"/><circle cx="224" cy="104" r="3.5" fill="currentColor" opacity=".3"/><circle cx="236" cy="104" r="3.5" fill="currentColor" opacity=".3"/><path d="M197 116h188" stroke="currentColor" opacity=".15"/>`,
    label(212, 142, ['To: 편집국', 'To: Newsroom'], { size: 15, opacity: .75 }), bar(212, 164, 130, { width: 7, opacity: .45 }),
    `<rect x="296" y="178" width="76" height="24" rx="12" fill="var(--blue)"/>`, label(334, 195, ['보내기', 'Send'], { size: 14, weight: 700, anchor: 'middle', fill: 'var(--paper)' }))),
  `<path d="M380 186C430 176 440 124 418 96" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 6" opacity=".6"/>`,
  `<g transform="translate(408 84) rotate(-14)"><path d="M0 0L40-16 26 16 16 5Z" fill="var(--paper)" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M16 5 40-16" stroke="currentColor" stroke-width="1.5"/></g>`,
  step(3, [196, 222], box(card(196, 222, 264, 146),
    label(214, 253, ['뉴스', 'NEWS'], { size: 19, weight: 800, family: 'Georgia, serif' }), bar(384, 248, 58, { width: 5, opacity: .3 }),
    `<path d="M214 264h228" stroke="currentColor" stroke-width="1.5" opacity=".5"/>`,
    label(214, 289, '프로젝트, 한국 시장 진출', { size: 16, weight: 700 }),
    `<rect x="214" y="302" width="78" height="50" rx="6" fill="var(--lime)" stroke="currentColor"/><circle cx="234" cy="318" r="6" fill="currentColor" opacity=".45"/><path d="M220 346l20-16 12 9 12-11 22 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>`,
    bar(306, 310, 136), bar(306, 326, 116), bar(306, 342, 128)),
    tick(452, 230, 16)),
].join('');

const airdropArt = [
  step(1, [20, 36], box(card(20, 36, 204, 196),
    label(38, 68, ['참여 미션', 'Missions'], { size: 17, weight: 800 }), label(206, 68, '2/3', { size: 15, weight: 700, anchor: 'end', opacity: .6 }),
    ...[['커뮤니티 입장', 'Join the chat', true], ['앱 써보기', 'Try the app', true], ['후기 남기기', 'Share feedback', false]].map(([ko, en, done], index) => {
      const y = 102 + index * 36;
      return `<rect x="38" y="${y - 11}" width="22" height="22" rx="6" fill="${done ? 'var(--lime)' : 'var(--paper)'}" stroke="currentColor" stroke-width="1.5"${done ? '' : ' opacity=".55"'}/>`
        + (done ? `<path d="M44 ${y}l4 4 7-8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>` : '')
        + label(70, y + 5.5, [ko, en], { opacity: done ? 1 : .55 });
    }),
    bar(38, 208, 156, { width: 8, opacity: .14 }), bar(38, 208, 104, { width: 8, opacity: 1, color: 'var(--blue)' }))),
  step(2, [240, 24], box(card(240, 24, 220, 158),
    `<circle cx="262" cy="52" r="13" fill="var(--blue)"/>`, label(262, 57, 'K', { size: 14, weight: 800, anchor: 'middle', fill: 'var(--paper)' }),
    bar(284, 47, 80, { width: 7, opacity: .5 }), bar(284, 60, 50, { width: 5, opacity: .25 }),
    `<rect x="256" y="76" width="188" height="92" rx="12" fill="var(--pale)"/>`,
    label(270, 102, ['참여 방법 안내', 'How to join'], { size: 16, weight: 800 }),
    label(270, 129, '1', { size: 14, weight: 800, fill: 'var(--blue)' }), bar(286, 124, 132, { opacity: .3 }),
    label(270, 153, '2', { size: 14, weight: 800, fill: 'var(--blue)' }), bar(286, 148, 104, { opacity: .3 }))),
  step(3, [208, 200], box(card(208, 200, 252, 166),
    label(226, 230, ['참여자 확인', 'Eligibility check'], { size: 16, weight: 800 }),
    ...[['0x7a3…f21', true], ['0x19c…0be', true], ['0x7a3…f21', false]].map(([address, valid], index) => {
      const y = 264 + index * 34;
      return (index ? `<path d="M226 ${y - 17}h216" stroke="currentColor" opacity=".12"/>` : '')
        + label(226, y + 5, address, { size: 14, weight: 500, family: 'ui-monospace, SFMono-Regular, Menlo, monospace', opacity: valid ? 1 : .55 })
        + label(418, y + 5, valid ? ['확인', 'Valid'] : ['중복', 'Duplicate'], { size: 14, weight: 700, anchor: 'end', opacity: valid ? 1 : .7 })
        + (valid ? tick(438, y, 9) : cross(438, y, 9));
    }))),
  `<g class="rs-card" style="--step:0"><path d="M38 302C38 266 70 246 108 246S178 266 178 302Q160 290 143 302Q125 290 108 302Q90 290 73 302Q55 290 38 302Z" fill="var(--lime)" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>`
    + `<path d="M73 302C76 270 92 252 108 246M143 302C140 270 124 252 108 246" fill="none" stroke="currentColor" opacity=".45"/>`
    + `<path d="M38 302L101 332M73 302l31 30M143 302l-31 30M178 302l-63 30" stroke="currentColor" opacity=".6"/>`
    + `<circle cx="108" cy="348" r="20" fill="var(--blue)" stroke="currentColor" stroke-width="1.5"/><circle cx="108" cy="348" r="14" fill="none" stroke="var(--paper)" opacity=".45"/>`
    + `<path d="M108 338l3 7 7 .5-5.5 4.5 2 7-6.5-4-6.5 4 2-7-5.5-4.5 7-.5z" fill="var(--lime)"/></g>`,
].join('');

const eventsArt = [
  step(1, [20, 28], box(card(20, 28, 200, 336),
    label(38, 60, ['진행표', 'Run of show'], { size: 17, weight: 800 }),
    `<rect x="160" y="43" width="46" height="24" rx="12" fill="var(--blue)"/>`, label(183, 60, 'KBW', { size: 14, weight: 800, anchor: 'middle', fill: 'var(--paper)' }),
    `<rect x="32" y="130" width="176" height="34" rx="10" fill="var(--lime)" stroke="currentColor" stroke-width="1.2"/>`,
    `<path d="M50 92V338" stroke="currentColor" stroke-width="2" opacity=".18"/>`,
    ...[['18:00', '입장', 'Doors'], ['19:00', '키노트', 'Keynote'], ['19:30', '패널 토크', 'Panel talk'], ['20:30', '데모', 'Demos'], ['21:00', '네트워킹', 'Networking'], ['22:00', '마무리', 'Wrap-up']]
      .map(([time, ko, en], index) => {
        const y = 101 + index * 46;
        return `<circle cx="50" cy="${y}" r="5" fill="${index === 1 ? 'var(--blue)' : 'var(--paper)'}" stroke="currentColor" stroke-width="1.5"/>`
          + label(64, y + 5, time, { size: 14, weight: 700 }) + label(114, y + 5, [ko, en], { size: 15, weight: 500 });
      }))),
  step(2, [236, 24], box(card(236, 24, 224, 128),
    label(254, 56, ['파트너', 'Partners'], { size: 17, weight: 800 }), label(442, 56, '3/4', { size: 15, weight: 700, anchor: 'end', opacity: .6 }),
    ...[0, 1, 2, 3].map(index => `<rect x="${254 + index * 48}" y="74" width="40" height="40" rx="10" fill="var(--pale)" stroke="currentColor" stroke-width="1.2"/>`),
    `<circle cx="274" cy="94" r="11" fill="var(--blue)"/><path d="M322 83l13 22h-26z" fill="var(--lime)" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M370 81l13 13-13 13-13-13z" fill="currentColor" opacity=".55"/>`,
    `<circle cx="408" cy="94" r="2.5" fill="currentColor" opacity=".5"/><circle cx="418" cy="94" r="2.5" fill="currentColor" opacity=".5"/><circle cx="428" cy="94" r="2.5" fill="currentColor" opacity=".5"/>`,
    tick(292, 76, 7), tick(340, 76, 7), tick(388, 76, 7),
    bar(254, 134, 186, { width: 5, opacity: .14 }), bar(254, 134, 140, { width: 5, opacity: 1, color: 'var(--blue)' }))),
  step(3, [236, 168], box(card(236, 168, 224, 196),
    label(254, 198, ['현장 배치도', 'Floor plan'], { size: 17, weight: 800 }),
    `<path d="M330 350H260a6 6 0 0 1-6-6V218a6 6 0 0 1 6-6h176a6 6 0 0 1 6 6v126a6 6 0 0 1-6 6H366" fill="var(--pale)" stroke="currentColor" stroke-width="1.5"/>`,
    `<rect x="290" y="220" width="116" height="30" rx="4" fill="var(--blue)"/>`, label(348, 240, ['무대', 'STAGE'], { size: 14, weight: 800, anchor: 'middle', fill: 'var(--paper)', spacing: 1 }),
    ...[266, 280, 294].flatMap(y => [0, 1, 2, 3, 4, 5].map(index => `<circle cx="${318 + index * 12}" cy="${y}" r="3" fill="currentColor" opacity=".45"/>`)),
    ...[[262, 262], [262, 292], [408, 262], [408, 292]].map(([x, y]) => `<rect x="${x}" y="${y}" width="26" height="20" rx="3" fill="var(--lime)" stroke="currentColor" stroke-width="1.2"/>`),
    `<path d="M348 344v-26m-7 7 7-7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`)),
].join('');

export const services = [
  {
    id: 'kol', label: ['KOL 연결', 'KOL campaigns'],
    heading: [['우리의 이야기를,', 'Your story,'], ['맞는 사람의 목소리로.', 'through Korean creators.']],
    body: ['프로젝트와 결이 맞는 한국 KOL을 연결합니다. 콘텐츠 기획부터 발행과 반응 확인까지 함께합니다.', 'We match your project with Korean KOLs and help plan content, coordinate publishing and track audience response.'],
    pills: [['KOL 매칭', 'KOL matching'], ['콘텐츠 기획', 'Content planning'], ['캠페인 운영', 'Campaign management']],
    icon: '<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 5a3 3 0 0 1 0 6m1 4a5 5 0 0 1 3 5"/>',
    art: kolArt,
  },
  {
    id: 'meetup', label: ['밋업', 'Meetups'],
    heading: [['온라인의 관심이,', 'Meet your community'], ['직접 만나는 사이로.', 'in person.']],
    body: ['프로젝트와 커뮤니티가 가까워지는 작은 만남을 만듭니다. 공간 섭외, 참가자 모집, 현장 진행을 함께 준비합니다.', 'We help your project meet its community in person, with venue sourcing, guest invitations and on-site hosting.'],
    pills: [['장소 섭외', 'Venue sourcing'], ['참가자 모집', 'Guest invitations'], ['현장 진행', 'On-site hosting']],
    icon: '<path d="M21 11a8 8 0 0 1-8 8H5l-4 3V11a8 8 0 0 1 8-8h4a8 8 0 0 1 8 8Z"/><path d="M7 10h8M7 14h5"/>',
    art: meetupArt,
  },
  {
    id: 'press', label: ['언론보도', 'Press outreach'],
    heading: [['한국에 전할 이야기,', 'Your news,'], ['읽히는 소식으로.', 'for Korean readers.']],
    body: ['한국 독자의 관점에서 프로젝트의 소식을 정리합니다. 보도자료 작성과 미디어 피칭, 게재 결과 정리를 지원합니다.', 'We prepare your news for Korean readers, write press materials, pitch relevant media and track published coverage.'],
    pills: [['보도자료 작성', 'Press materials'], ['미디어 피칭', 'Media pitching'], ['게재 모니터링', 'Coverage tracking']],
    icon: '<path d="M4 4h13v15a2 2 0 0 0 2 2H6a2 2 0 0 1-2-2Z"/><path d="M17 8h3v11a2 2 0 0 1-4 0M8 8h5M8 12h5M8 16h3"/>',
    art: pressArt,
  },
  {
    id: 'airdrop', label: ['에어드랍', 'Airdrops'],
    heading: [['첫 참여의 계기를,', 'A first chance to try.'], ['다음 경험의 시작으로.', 'A reason to return.']],
    body: ['프로젝트를 직접 경험하는 참여형 캠페인을 설계합니다. 미션과 참여 안내부터 참여자 확인, 결과 정리까지 운영합니다.', 'We plan campaigns that let people try your project, from missions and participant guides to eligibility checks and reporting.'],
    pills: [['참여 미션 설계', 'Mission design'], ['커뮤니티 안내', 'Community guides'], ['참여 결과 확인', 'Participation review']],
    icon: '<path d="M3 11a9 7 0 0 1 18 0Z"/><path d="M3 11l7 7m11-7-7 7m-2-7v7"/><rect x="9" y="17" width="6" height="5" rx="1"/>',
    art: airdropArt,
  },
  {
    id: 'events', label: ['KBW 및 행사 대행 운영', 'KBW & event production'],
    heading: [['기억에 남는 무대,', 'An event worth attending.'], ['그 뒤의 빈틈없는 준비.', 'A team to run it.']],
    body: ['KBW 사이드 이벤트부터 브랜드 행사까지. 콘셉트와 공간, 파트너 조율, 현장 운영을 하나의 흐름으로 연결합니다.', 'We plan and run KBW side events and brand events, coordinating the concept, venue, partners and on-site work.'],
    pills: [['행사 기획', 'Event planning'], ['파트너 조율', 'Partner coordination'], ['현장 운영', 'Event production']],
    icon: '<path d="M3 21V6h18v15M3 10h18M8 3v6M16 3v6M7 15h3M14 15h3M7 18h3M14 18h3"/>',
    art: eventsArt,
  }
];

export function initRefreshServices() {
  const root = document.querySelector('#refresh-services-root');
  if (!root || root.dataset.ready === 'true') return;
  root.innerHTML = `
    <div class="services-heading"><div><h2 id="services-title">${copy(['가능성에 방향을.', 'A plan for Korea.'])}<br>${copy(['아이디어에 움직임을.', 'Support to carry it out.'])}</h2></div><p>${copy(['필요한 일을, 필요한 순간에.', 'Choose the support you need.'])}<br>${copy(['전략부터 실행까지 함께합니다.', 'We help with planning and delivery.'])}</p></div>
    <div class="service-tabs" role="tablist" aria-label="Services">
      ${services.map((service, index) => `<button type="button" id="tab-${service.id}" role="tab" aria-selected="${index === 0}" aria-controls="panel-${service.id}" tabindex="${index === 0 ? 0 : -1}" data-tab="${service.id}"><svg class="service-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${service.icon}</svg>${copy(service.label)}</button>`).join('')}
    </div>
    ${services.map((service, index) => `<div class="service-panel rs-panel" id="panel-${service.id}" role="tabpanel" aria-labelledby="tab-${service.id}" tabindex="0"${index ? ' hidden' : ''}><div class="panel-copy"><h3>${service.heading.map(copy).join('<br>')}</h3><p>${copy(service.body)}</p><ol class="rs-steps" role="list">${service.pills.map((pill, step) => `<li><span class="rs-step-no" aria-hidden="true">${step + 1}</span>${copy(pill)}</li>`).join('')}</ol><button type="button" class="button rs-inquiry" data-open-brief data-brief-service="${escape(service.label[0])}">${copy(['이 서비스 문의하기', 'Ask about this service'])}<span aria-hidden="true">↗</span></button></div><div class="service-art rs-art rs-art-${service.id}" aria-hidden="true"><svg viewBox="0 0 480 380" focusable="false" aria-hidden="true">${service.art}</svg></div></div>`).join('')}`;
  const localize = () => root.querySelectorAll('[data-rs-ko]').forEach(node => {
    node.firstChild.nodeValue = document.documentElement.lang === 'en' ? node.dataset.rsEn : node.dataset.rsKo;
  });
  document.addEventListener('languagechange', localize);
  root.dataset.ready = 'true';
}
