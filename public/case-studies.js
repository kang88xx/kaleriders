import { caseStudies } from './case-studies-data.js';

// Resolve media against this module, including on the /sample/ alias.
const assetURL = path => new URL(path, import.meta.url).href;

export function initCaseStudies(doc = document) {
  const root = doc.getElementById('case-studies-root');
  if (!root || root.dataset.ready) return;
  root.replaceChildren();
  const bindings = [];
  const pair = (ko, en) => ({ ko, en });
  const el = (tag, className, parent, copy) => {
    const node = doc.createElement(tag);
    if (className) node.className = className;
    if (copy) {
      if (typeof copy === 'string') node.textContent = copy;
      else bindings.push(language => { node.textContent = copy[language]; });
    }
    parent.append(node);
    return node;
  };
  const attr = (node, name, copy) => bindings.push(language => node.setAttribute(name, copy[language]));
  const heading = el('div', 'case-heading', root);
  el('p', 'eyebrow', heading, 'CONNECTIONS, IN REAL LIFE');
  const title = el('h2', '', heading, pair('만남이 경험이 되는 순간.', 'Where connection comes to life.'));
  title.id = 'work-title';
  el('p', 'case-intro', heading, pair('기술을 나누고, 커뮤니티를 만나고, 함께 기억할 장면을 만듭니다.', 'Sharing ideas, meeting communities, and creating moments worth remembering.'));
  el('p', 'case-draft-note', heading, pair('검토용 초안 · 수치와 수행 내용은 가상 예시이며, 실제 내용으로 교체 예정입니다.', 'Review draft · Metrics and delivery descriptions are illustrative and will be replaced with verified information.'));
  const grid = el('div', 'case-grid', root);
  caseStudies.forEach((item, index) => {
    const article = el('article', `case-card${index === 0 ? ' case-featured' : ''}`, grid);
    article.id = `case-${item.id}`;
    article.setAttribute('aria-labelledby', `case-title-${item.id}`);
    const media = el('div', 'case-media', article);
    if (item.media.type === 'video') {
      const video = el('video', '', media);
      video.controls = true;
      video.playsInline = true;
      video.preload = 'none';
      video.poster = assetURL(item.media.poster);
      video.src = assetURL(item.media.src);
      attr(video, 'aria-label', item.media.alt);
      const fallback = el('a', '', video, pair('행사 영상 열기', 'Open event video'));
      fallback.href = assetURL(item.media.src);
    } else {
      const photo = el('img', '', media);
      photo.src = assetURL(item.media.src);
      photo.loading = 'lazy';
      photo.decoding = 'async';
      attr(photo, 'alt', item.media.alt);
    }
    const body = el('div', 'case-body', article);
    const meta = el('div', 'case-meta', body);
    el('span', 'case-category', meta, item.category);
    el('span', 'case-date', meta, item.date);
    const name = el('h3', '', body, item.title);
    name.id = `case-title-${item.id}`;
    el('p', 'case-summary', body, item.summary);
    el('p', 'case-metrics-label', body, pair('예시 성과', 'Sample results'));
    const metrics = el('dl', 'case-metrics', body);
    item.metrics.forEach(metric => {
      const group = el('div', '', metrics);
      el('dt', '', group, metric.label);
      el('dd', '', group, metric.value);
    });
    const detail = el('details', 'case-details', article);
    const summary = el('summary', '', detail);
    el('span', '', summary, pair('사례 자세히 보기', 'Explore the case'));
    const icon = el('span', 'case-detail-icon', summary, '+');
    icon.setAttribute('aria-hidden', 'true');
    const content = el('div', 'case-detail-content', detail);
    const story = el('div', 'case-story', content);
    [[pair('목적', 'The goal'), item.goal], [pair('수행 내용', 'Our approach'), item.approach], [pair('결과와 다음 단계', 'Outcome and next steps'), item.outcome]].forEach(([label, text]) => {
      const block = el('div', '', story);
      el('h4', '', block, label);
      el('p', '', block, text);
    });
    const services = el('ul', 'case-services', content);
    attr(services, 'aria-label', pair('수행 업무 예시', 'Illustrative scope of work'));
    item.services.forEach(service => el('li', '', services, service));
    if (item.gallery.length) {
      el('h4', 'case-gallery-title', content, pair('현장의 장면들', 'From the event'));
      const gallery = el('div', 'case-gallery', content);
      item.gallery.forEach(photo => {
        const link = el('a', '', gallery);
        link.href = assetURL(photo.src);
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        attr(link, 'aria-label', pair(`${photo.alt.ko} — 원본 보기 (새 탭)`, `${photo.alt.en} — View full image (new tab)`));
        const img = el('img', '', link);
        img.src = assetURL(photo.src);
        img.loading = 'lazy';
        img.decoding = 'async';
        attr(img, 'alt', photo.alt);
      });
    }
  });
  const update = language => bindings.forEach(bind => bind(language === 'ko' ? 'ko' : 'en'));
  doc.addEventListener('languagechange', event => update(event.detail.language));
  update('en');
  root.dataset.ready = 'true';
}
