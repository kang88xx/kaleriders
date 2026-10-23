import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolveLanguage, translate, initLanguage } from '../public/i18n.js';
import { english } from '../public/translations.js';

for (const [search, saved, expected] of [
  ['?lang=en', 'ko', 'en'], ['?lang=ko', 'en', 'ko'],
  ['?lang=invalid', 'en', 'en'], ['?lang=', 'en', 'en'],
  ['', 'en', 'en'], ['', 'ko', 'ko'], ['', undefined, 'en'],
  ['?lang=EN', 'invalid', 'en'], ['?other=en', null, 'en'],
]) {
  test(`locale precedence: ${JSON.stringify({ search, saved })} resolves to ${expected}`, () => {
    assert.equal(resolveLanguage(search, saved), expected);
  });
}

test('every Korean HTML text and accessible attribute has an English translation', () => {
  const html = fileURLToPath(new URL('../public/index.html', import.meta.url));
  const values = JSON.parse(execFileSync('python3', ['-c', `
import json, sys
from html.parser import HTMLParser
class TextParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ignored = None
        self.values = []
    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style'): self.ignored = tag
        attrs = dict(attrs)
        for key in ('aria-label', 'placeholder'):
            if attrs.get(key): self.values.append(attrs[key])
        if tag == 'meta' and attrs.get('name') == 'description':
            self.values.append(attrs.get('content', ''))
    def handle_endtag(self, tag):
        if tag == self.ignored: self.ignored = None
    def handle_data(self, data):
        if not self.ignored and data.strip(): self.values.append(data.strip())
p = TextParser()
with open(sys.argv[1]) as source: p.feed(source.read())
print(json.dumps(p.values))
`, html], { encoding: 'utf8' }));
  const korean = [...new Set(values.filter(value => /[가-힣]/u.test(value)))];
  assert(korean.length > 100, 'Checks actual page copy, including hidden form and navigation');
  assert.deepEqual(korean.filter(value => !Object.hasOwn(english, value)), [], 'Missing translation keys');
  assert.deepEqual(korean.filter(value => !english[value]?.trim() || /[가-힣]/u.test(english[value])), [], 'English translations contain no untranslated Korean');
});

class Element extends EventTarget {
  constructor(attributes = {}, dataset = {}) {
    super();
    this.attributes = new Map(Object.entries(attributes));
    this.dataset = dataset;
  }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  closest() { return null; }
  click() { this.dispatchEvent(new Event('click')); }
}

function fixture({ search = '?campaign=share', saved = 'ko', denied = false } = {}) {
  const input = new Element({ placeholder: '어떻게 불러드릴까요?' });
  input.value = '작성 중인 사용자 이름';
  const option = new Element({ value: 'strategy' });
  option.selected = true;
  const select = new Element();
  select.value = 'strategy';
  select.selectedIndex = 1;
  const dialog = new Element();
  dialog.open = true;
  const tab = new Element({ 'aria-selected': 'true' });
  const heading = new Element();
  const label = new Element({ 'aria-label': '주 메뉴' });
  const meta = new Element({ content: 'KALE Riders helps global projects take root in Korea.' });
  const nodes = [
    { parentElement: heading, nodeValue: '\n  우리가 하는 일  ' },
    { parentElement: option, nodeValue: '리서치 & 전략' },
  ];
  const buttons = ['ko', 'en'].map(language => new Element({}, { language }));
  const doc = new EventTarget();
  doc.documentElement = new Element();
  doc.createTreeWalker = () => {
    let index = -1;
    return { nextNode() { this.currentNode = nodes[++index]; return !!this.currentNode; } };
  };
  doc.querySelectorAll = selector => selector === '[data-language]' ? buttons : [input, label, meta];
  const view = new EventTarget();
  view.location = new URL(`https://example.test/preview${search}#services`);
  const writes = [];
  view.localStorage = {
    getItem() { if (denied) throw new Error('Storage denied'); return saved; },
    setItem(key, value) { if (denied) throw new Error('Storage denied'); writes.push([key, value]); },
  };
  view.history = { replaceState(_state, _title, url) { view.location = new URL(url); } };
  const events = [];
  doc.addEventListener('languagechange', event => events.push(event.detail.language));
  return { doc, view, input, option, select, dialog, tab, heading, label, meta, nodes, buttons, writes, events };
}

test('switching round-trips copy and attributes while retaining nodes and active form state', () => {
  const f = fixture();
  const originalNodes = [...f.nodes];
  initLanguage(f.doc, f.view);
  let clicks = 0;
  f.heading.addEventListener('click', () => clicks++);
  f.buttons[1].click();
  assert.equal(f.doc.documentElement.lang, 'en');
  assert.equal(f.nodes[0].nodeValue, '\n  What we do  ');
  assert.equal(f.nodes[1].nodeValue, 'Research & Strategy');
  assert.equal(f.input.getAttribute('placeholder'), 'What should we call you?');
  assert.equal(f.label.getAttribute('aria-label'), 'Main navigation');
  assert.equal(f.meta.getAttribute('content'), 'KALE Riders helps global projects take root in Korea.');
  assert.deepEqual(f.buttons.map(button => button.getAttribute('aria-pressed')), ['false', 'true']);
  assert.equal(translate('우리가 하는 일'), 'What we do');
  f.buttons[0].click();
  assert.equal(f.nodes[0].nodeValue, '\n  우리가 하는 일  ');
  assert.equal(f.nodes[1].nodeValue, '리서치 & 전략');
  assert.equal(f.input.getAttribute('placeholder'), '어떻게 불러드릴까요?');
  assert.equal(f.label.getAttribute('aria-label'), '주 메뉴');
  assert.equal(f.meta.getAttribute('content'), 'KALE Riders helps global projects take root in Korea.');
  assert.deepEqual(f.buttons.map(button => button.getAttribute('aria-pressed')), ['true', 'false']);
  f.nodes.forEach((node, index) => assert.equal(node, originalNodes[index]));
  assert.equal(f.input.value, '작성 중인 사용자 이름');
  assert.equal(f.option.selected, true);
  assert.equal(f.option.getAttribute('value'), 'strategy');
  assert.equal(f.select.value, 'strategy');
  assert.equal(f.select.selectedIndex, 1);
  assert.equal(f.dialog.open, true);
  assert.equal(f.tab.getAttribute('aria-selected'), 'true');
  f.heading.click();
  assert.equal(clicks, 1, 'Existing element listeners remain attached');
  assert.deepEqual(f.events, ['ko', 'en', 'ko']);
});

test('explicit switching remembers locale and preserves shared URL query and anchor', () => {
  const f = fixture({ search: '?campaign=share&lang=ko', saved: 'en' });
  initLanguage(f.doc, f.view);
  assert.equal(f.doc.documentElement.lang, 'ko', 'URL takes precedence at startup');
  assert.deepEqual(f.writes, [], 'Initialization does not overwrite saved preference');
  f.buttons[1].click();
  assert.deepEqual(f.writes, [['agency-language', 'en']]);
  assert.equal(f.view.location.href, 'https://example.test/preview?campaign=share&lang=en#services');
  f.view.location.search = '?campaign=share&lang=ko';
  f.view.dispatchEvent(new Event('popstate'));
  assert.equal(f.doc.documentElement.lang, 'ko', 'Browser history navigation applies URL locale');
});

test('denied storage still allows URL initialization and language switching', () => {
  const f = fixture({ search: '?lang=en', denied: true });
  assert.doesNotThrow(() => initLanguage(f.doc, f.view));
  assert.equal(f.doc.documentElement.lang, 'en');
  assert.doesNotThrow(() => f.buttons[0].click());
  assert.equal(f.doc.documentElement.lang, 'ko');
  assert.equal(f.view.location.search, '?lang=ko');
});

for (const denied of [false, true]) {
  test(`a first visit starts in English, including when storage is ${denied ? 'denied' : 'empty'}`, () => {
    const f = fixture({ search: '', saved: null, denied });
    initLanguage(f.doc, f.view);
    assert.equal(f.doc.documentElement.lang, 'en');
    assert.equal(f.nodes[0].nodeValue, '\n  What we do  ');
    assert.deepEqual(f.buttons.map(button => button.getAttribute('aria-pressed')), ['false', 'true']);
    assert.deepEqual(f.writes, [], 'The default does not create a saved preference');
    f.buttons[0].click();
    assert.equal(f.doc.documentElement.lang, 'ko', 'Korean remains selectable');
    assert.equal(f.nodes[0].nodeValue, '\n  우리가 하는 일  ');
    assert.equal(f.view.location.search, '?lang=ko');
  });
}

test('unknown text is preserved in both locales', () => {
  assert.equal(translate('Unlisted / 사용자 텍스트', 'en'), 'Unlisted / 사용자 텍스트');
  assert.equal(translate('Unlisted / 사용자 텍스트', 'ko'), 'Unlisted / 사용자 텍스트');
});
