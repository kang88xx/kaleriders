const inquiryEndpoint = 'https://formsubmit.co/ajax/hello@kaleriders.com';

export async function submitInquiry(data, { fetchImpl = fetch, signal } = {}) {
  const response = await fetchImpl(inquiryEndpoint, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      project: data.project,
      service: data.service,
      message: data.message,
      _honey: data._honey || '',
      _subject: 'KALE Riders 웹사이트 문의',
      _template: 'table',
      _url: 'https://kaleriders.com/',
      _replyto: data.email,
    }),
  });
  if (!response.ok) throw new Error('Inquiry submission failed');
  const payload = await response.json();
  const activationRequired = /activat(?:e|ion)|confirm\s+(?:your\s+)?email/i.test(payload?.message || '');
  if (!(payload?.success === true || payload?.success === 'true') || activationRequired) {
    throw new Error('Inquiry submission not confirmed');
  }
}

export function initInquiryForm({ form, result, dialog, submit = submitInquiry, makeFormData = node => new FormData(node) }) {
  let pending = false;
  const button = form.querySelector('.form-submit');
  const idleLabel = form.querySelector('[data-submit-idle]');
  const busyLabel = form.querySelector('[data-submit-busy]');
  const error = form.querySelector('#brief-error');

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (pending || !form.reportValidity()) return;
    const data = Object.fromEntries(makeFormData(form));
    const controls = [...form.querySelectorAll('input, select, textarea')];
    const disabledStates = controls.map(control => control.disabled);
    const buttonWasDisabled = button.disabled;
    const controller = new AbortController();
    pending = true;
    error.hidden = true;
    button.disabled = true;
    controls.forEach(control => { control.disabled = true; });
    form.setAttribute('aria-busy', 'true');
    idleLabel.hidden = true;
    busyLabel.hidden = false;
    let timeout;
    try {
      const deadline = new Promise((_, reject) => {
        timeout = setTimeout(() => {
          controller.abort();
          reject(new Error('Inquiry submission timed out'));
        }, 20_000);
      });
      await Promise.race([submit(data, { signal: controller.signal }), deadline]);
      form.hidden = true;
      result.hidden = false;
      form.reset();
      if (dialog.open) result.focus();
    } catch {
      error.hidden = false;
    } finally {
      clearTimeout(timeout);
      controls.forEach((control, index) => { control.disabled = disabledStates[index]; });
      button.disabled = buttonWasDisabled;
      form.removeAttribute('aria-busy');
      idleLabel.hidden = false;
      busyLabel.hidden = true;
      pending = false;
    }
  });
}
