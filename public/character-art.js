const BLUE = '#254ad8';
const PALE = '#b8c6f3';
const LIME = '#d8ee7a';
const APRICOT = '#e8b58d';
const PAPER = '#f4f3eb';

function face() {
  return `<g class="character-face"><g class="character-look"><g class="character-blink">
    <ellipse cx="32" cy="36" rx="2.5" ry="3.7" fill="${BLUE}"/><ellipse cx="47" cy="36" rx="2.5" ry="3.7" fill="${BLUE}"/>
    <circle cx="32.6" cy="34.9" r=".8" fill="${PAPER}"/><circle cx="47.6" cy="34.9" r=".8" fill="${PAPER}"/>
    </g></g><path d="M35 44Q40 48 45 44" fill="none" stroke="${BLUE}" stroke-width="1.8" stroke-linecap="round"/>
    <ellipse cx="24" cy="42" rx="3.5" ry="1.5" fill="${PAPER}" opacity=".7"/><ellipse cx="55" cy="42" rx="3.5" ry="1.5" fill="${PAPER}" opacity=".7"/></g>`;
}

function limbs() {
  return `<g fill="none" stroke="${BLUE}" stroke-width="2" stroke-linecap="round">
    <g class="character-arm character-arm-left"><path d="M19 43Q10 44 9 36M9 36L6 34M9 36L10 32"/></g>
    <g class="character-arm character-arm-right"><path d="M61 43Q68 48 71 40M71 40L74 38M71 40L70 36"/></g>
    <g class="character-feet"><path d="M30 62L27 69L23 69M50 62L53 68L57 68"/></g></g>`;
}

function starPoints() {
  return Array.from({ length: 12 }, (_, index) => {
    const angle = index * Math.PI / 6 - Math.PI / 2 + .18;
    const radius = index % 2 ? 22 : 32;
    return `${(40 + Math.cos(angle) * radius).toFixed(2)},${(39 + Math.sin(angle) * radius).toFixed(2)}`;
  }).join(' ');
}

export function avatarMarkup(member) {
  const identity = ['kang', 'kalya', 'mascort'].includes(member) ? member : 'kang';
  const figures = {
    kang: `<g class="character-orbit-back"><ellipse cx="40" cy="41" rx="35" ry="12" transform="rotate(-24 40 41)" fill="none" stroke="${BLUE}" stroke-width="1.5"/></g>
      ${limbs()}<g class="character-body"><circle cx="40" cy="39" r="25" fill="${LIME}" stroke="${BLUE}" stroke-width="1.5"/>
      <path d="M22 27Q27 20 35 19" fill="none" stroke="${PAPER}" stroke-width="3" stroke-linecap="round"/>${face()}</g>
      <g class="character-orbit-front"><path d="M8 49C16 60 64 43 72 27" fill="none" stroke="${BLUE}" stroke-width="1.7"/><circle cx="68" cy="32" r="4.5" fill="${PAPER}" stroke="${BLUE}" stroke-width="1.3"/></g>`,
    kalya: `${limbs()}<g class="character-coil"><path d="M22 17C-1 21 8 32 40 32S78 46 57 51S7 47 15 61C22 72 64 69 69 59" fill="none" stroke="${BLUE}" stroke-width="8" stroke-linecap="round"/><path d="M23 17C2 21 9 30 40 30S76 44 57 49S10 46 17 59" fill="none" stroke="${PALE}" stroke-width="1.8" stroke-linecap="round"/></g>
      <g class="character-body"><ellipse cx="40" cy="36" rx="22" ry="21" fill="${PALE}" stroke="${BLUE}" stroke-width="1.5"/><path d="M22 22Q40 7 58 22" fill="none" stroke="${BLUE}" stroke-width="5" stroke-linecap="round"/>${face()}</g>
      <g class="character-satellite"><circle cx="65" cy="16" r="4" fill="${LIME}" stroke="${BLUE}" stroke-width="1.2"/></g>`,
    mascort: `${limbs()}<g class="character-body"><g class="character-star"><polygon points="${starPoints()}" fill="${APRICOT}" stroke="${BLUE}" stroke-width="1.5" stroke-linejoin="round"/><path d="M25 28L29 24" fill="none" stroke="${PAPER}" stroke-width="2.5" stroke-linecap="round"/></g>${face()}</g>
      <g class="character-spark" fill="none" stroke="${BLUE}" stroke-width="1.4" stroke-linecap="round"><path d="M67 10V18M63 14H71"/></g>`,
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" class="character-art character-art--${identity}" viewBox="0 0 80 80" width="80" height="80" aria-hidden="true" focusable="false" style="display:block;width:100%;height:100%;overflow:visible">${figures[identity]}</svg>`;
}
