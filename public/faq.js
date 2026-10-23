export function initFaq(doc = document, view = window) {
  const reducedMotion = view.matchMedia('(prefers-reduced-motion: reduce)');
  let firstOpen;
  const items = [...doc.querySelectorAll('.faq-list details')].map(details => {
    const summary = details.querySelector('summary');
    const expanded = details.open && !firstOpen;
    if (expanded) firstOpen = details;
    details.open = expanded;
    return { details, summary, expanded, animation: null };
  });

  const settle = item => {
    const animation = item.animation;
    item.animation = null;
    item.details.open = item.expanded;
    item.details.style.overflow = '';
    animation?.cancel();
  };

  const setExpanded = (item, expanded) => {
    if (item.expanded === expanded) return;
    item.expanded = expanded;
    const { details, summary } = item;
    const start = details.getBoundingClientRect().height;
    const previous = item.animation;
    item.animation = null;
    previous?.cancel();

    if (reducedMotion.matches || typeof details.animate !== 'function') {
      settle(item);
      return;
    }

    // Keep the answer rendered while closing; release native `open` at the end.
    details.open = true;
    const border = details.offsetHeight - details.clientHeight;
    const end = expanded ? details.getBoundingClientRect().height : summary.getBoundingClientRect().height + border;
    details.style.overflow = 'hidden';
    const animation = details.animate(
      [{ height: `${start}px` }, { height: `${end}px` }],
      { duration: 260, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'both' },
    );
    item.animation = animation;
    animation.onfinish = () => {
      if (item.animation === animation) settle(item);
    };
  };

  items.forEach(item => {
    item.onClick = event => {
      if (event.defaultPrevented) return;
      event.preventDefault();
      const expanded = !item.expanded;
      if (expanded) items.forEach(other => { if (other !== item) setExpanded(other, false); });
      setExpanded(item, expanded);
    };
    item.summary.addEventListener('click', item.onClick);
  });

  // Changed text or viewport size should never leave a stale pixel height.
  const settleAll = () => items.forEach(settle);
  const onReducedMotion = () => { if (reducedMotion.matches) settleAll(); };
  doc.addEventListener('languagechange', settleAll);
  view.addEventListener('resize', settleAll);
  reducedMotion.addEventListener('change', onReducedMotion);

  return () => {
    settleAll();
    items.forEach(item => item.summary.removeEventListener('click', item.onClick));
    doc.removeEventListener('languagechange', settleAll);
    view.removeEventListener('resize', settleAll);
    reducedMotion.removeEventListener('change', onReducedMotion);
  };
}
