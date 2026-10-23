import { english } from './translations.js';

const storageKey = 'agency-language';
let currentLanguage = 'en';

export const resolveLanguage = (search, saved) => {
  const requested = new URLSearchParams(search).get('lang');
  return [requested, saved].find(value => value === 'ko' || value === 'en') || 'en';
};

export const translate = (text, language = currentLanguage) =>
  language === 'en' ? (english[text] ?? text) : text;

export function initLanguage(doc = document, view = window) {
  let saved;
  try { saved = view.localStorage.getItem(storageKey); } catch { /* Storage can be unavailable. */ }

  // Keep the original text nodes, controls and artwork intact across switches.
  const textNodes = [];
  const walker = doc.createTreeWalker(doc.documentElement, 4);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    // Tab titles and sharing metadata stay in English in both page languages.
    if (node.parentElement.closest('head, script, style, svg, noscript, #route-description')) continue;
    const original = node.nodeValue;
    const key = original.trim();
    if (Object.hasOwn(english, key)) textNodes.push({ node, original, key });
  }

  const attributes = [];
  doc.querySelectorAll('[aria-label], [placeholder]').forEach(element => {
    for (const name of ['aria-label', 'placeholder']) {
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
