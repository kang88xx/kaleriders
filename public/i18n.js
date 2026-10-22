import { english } from './translations.js';

const storageKey = 'agency-language';
let currentLanguage = 'en';

export const resolveLanguage = (search, saved) => {
  const requested = new URLSearchParams(search).get('lang');
  return [requested, saved].find(value => value === 'ko' || value === 'en') || 'en';
};

export const translate = (text, language = currentLanguage) =>
  language === 'en' ? (english[text] ?? text) : text;

export const formatBrief = ({ name, project, service, message }, language = currentLanguage) => [
  'KALE RIDERS — PROJECT BRIEF', '',
  `${translate('이름/팀명', language)}: ${name}`,
  `${translate('프로젝트', language)}: ${project}`,
  `${translate('함께하고 싶은 일', language)}: ${service}`, '',
  translate('프로젝트 이야기', language), message, '',
  translate('이 브리프는 기기에 저장한 초안이며, 상담 요청으로 전송되지 않았습니다.', language),
].join('\n');

export function initLanguage(doc = document, view = window) {
  let saved;
  try { saved = view.localStorage.getItem(storageKey); } catch { /* Storage can be unavailable. */ }

  // Keep the original text nodes, controls and artwork intact across switches.
  const textNodes = [];
  const walker = doc.createTreeWalker(doc.documentElement, 4);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentElement.closest('script, style, svg, noscript, [data-motion-toggle], #route-description')) continue;
    const original = node.nodeValue;
    const key = original.trim();
    if (Object.hasOwn(english, key)) textNodes.push({ node, original, key });
  }

  const attributes = [];
  doc.querySelectorAll('[aria-label], [placeholder], meta[name="description"]').forEach(element => {
    for (const name of ['aria-label', 'placeholder', 'content']) {
      const original = element.getAttribute(name);
      if (original && Object.hasOwn(english, original)) attributes.push({ element, name, original });
    }
  });
  const buttons = [...doc.querySelectorAll('[data-language]')];

  const applyLanguage = (language, remember = false) => {
    if (language !== 'ko' && language !== 'en') return;
    currentLanguage = language;
    doc.documentElement.lang = language;
    textNodes.forEach(({ node, original, key }) => {
      node.nodeValue = language === 'ko' ? original : original.replace(key, () => translate(key));
    });
    attributes.forEach(({ element, name, original }) => element.setAttribute(name, translate(original)));
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === language)));
    if (remember) {
      try { view.localStorage.setItem(storageKey, language); } catch { /* Switching still works without storage. */ }
      const url = new URL(view.location.href);
      url.searchParams.set('lang', language);
      try { view.history.replaceState(null, '', url); } catch { /* Local file previews may block history. */ }
    }
    doc.dispatchEvent(new CustomEvent('languagechange', { detail: { language } }));
  };

  buttons.forEach(button => button.addEventListener('click', () => applyLanguage(button.dataset.language, true)));
  view.addEventListener('popstate', () => applyLanguage(resolveLanguage(view.location.search, currentLanguage)));
  applyLanguage(resolveLanguage(view.location.search, saved));
}
