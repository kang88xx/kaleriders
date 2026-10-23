import test from 'node:test';
import assert from 'node:assert/strict';
import { submitInquiry, initInquiryForm } from '../public/contact.js';

const inquiry = { name: '팀 이름', email: 'visitor@example.com', project: 'Project', service: 'strategy', message: 'Hello\n문의', _honey: '' };
const response = (payload, ok = true) => ({ ok, json: async () => payload });

for (const success of [true, 'true']) {
  test(`accepted response (${JSON.stringify(success)}) uses fixed recipient and visitor reply-to`, async () => {
    const controller = new AbortController();
    await submitInquiry({ ...inquiry, _replyto: 'wrong@example.com', _url: 'https://wrong.example', recipient: 'wrong@example.com' }, {
      signal: controller.signal,
      fetchImpl: async (url, options) => {
        assert.equal(url, 'https://formsubmit.co/ajax/hello@kaleriders.com');
        assert.equal(options.method, 'POST');
        assert.deepEqual(options.headers, { Accept: 'application/json', 'Content-Type': 'application/json' });
        assert.equal(options.signal, controller.signal);
        assert.deepEqual(JSON.parse(options.body), { ...inquiry, _subject: 'KALE Riders 웹사이트 문의', _template: 'table', _url: 'https://kaleriders.com/', _replyto: inquiry.email });
        return response({ success });
      },
    });
  });
}

for (const [label, fetchImpl] of [
  ['HTTP 200 with false success', async () => response({ success: false })],
  ['HTTP 200 with string false success', async () => response({ success: 'false' })],
  ['missing acknowledgement', async () => response({})],
  ['null JSON', async () => response(null)],
  ['activation required', async () => response({ success: true, message: 'Please activate this form' })],
  ['activation email', async () => response({ success: 'true', message: 'Activation email sent' })],
  ['confirmation required', async () => response({ success: true, message: 'Please confirm your email' })],
  ['HTTP 429', async () => response({ success: true }, false)],
  ['invalid JSON', async () => ({ ok: true, json: async () => { throw new SyntaxError('invalid'); } })],
  ['network failure', async () => { throw new TypeError('offline'); }],
]) {
  test(`rejects ${label}`, async () => {
    await assert.rejects(submitInquiry(inquiry, { fetchImpl }));
  });
}

function fixture(submit) {
  const controls = Object.entries(inquiry).map(([name, value]) => ({ name, value, disabled: false }));
  controls.push({ name: 'unavailable', value: 'keep disabled', disabled: true });
  const button = { disabled: false };
  const idle = { hidden: false };
  const busy = { hidden: true };
  const error = { hidden: true };
  const result = { hidden: true, focusCount: 0, focus() { this.focusCount++; } };
  const dialog = { open: true };
  let handler;
  const attributes = new Map();
  const form = {
    hidden: false, valid: true, resets: 0,
    reportValidity() { return this.valid; },
    querySelector(selector) { return { '.form-submit': button, '[data-submit-idle]': idle, '[data-submit-busy]': busy, '#brief-error': error }[selector]; },
    querySelectorAll() { return controls; },
    addEventListener(name, listener) { assert.equal(name, 'submit'); handler = listener; },
    setAttribute(name, value) { attributes.set(name, value); },
    removeAttribute(name) { attributes.delete(name); },
    reset() { this.resets++; controls.forEach(control => { control.value = ''; }); },
  };
  initInquiryForm({ form, result, dialog, submit, makeFormData: () => controls.filter(control => !control.disabled).map(control => [control.name, control.value]) });
  const send = () => handler({ preventDefault() {} });
  return { form, controls, button, idle, busy, error, result, dialog, attributes, send };
}

function assertUnlocked(f) {
  assert.equal(f.button.disabled, false);
  assert.equal(f.attributes.has('aria-busy'), false);
  assert.equal(f.idle.hidden, false);
  assert.equal(f.busy.hidden, true);
  assert.deepEqual(f.controls.map(control => control.disabled), [false, false, false, false, false, false, true]);
}

test('invalid form is not submitted', async () => {
  const f = fixture(() => assert.fail('Should not send'));
  f.form.valid = false;
  await f.send();
  assertUnlocked(f);
});

test('pending request locks inputs, suppresses duplicates, and resets only after success', async () => {
  let resolve;
  let calls = 0;
  const f = fixture(data => {
    calls++;
    assert.deepEqual(data, inquiry, 'Values captured before disabling fields');
    return new Promise(done => { resolve = done; });
  });
  const pending = f.send();
  assert.equal(f.button.disabled, true);
  assert(f.controls.every(control => control.disabled));
  assert.equal(f.attributes.get('aria-busy'), 'true');
  assert.equal(f.idle.hidden, true);
  assert.equal(f.busy.hidden, false);
  await f.send();
  assert.equal(calls, 1);
  assert.equal(f.form.resets, 0);
  resolve();
  await pending;
  assert.equal(f.form.hidden, true);
  assert.equal(f.result.hidden, false);
  assert.equal(f.result.focusCount, 1);
  assert.equal(f.form.resets, 1);
  assert(f.controls.every(control => control.value === ''));
  assertUnlocked(f);
});

test('failure preserves values and allows retry without exposing remote response', async () => {
  let calls = 0;
  const f = fixture(async () => {
    if (++calls === 1) throw new Error('private remote response');
  });
  const values = f.controls.map(control => control.value);
  await f.send();
  assert.equal(f.error.hidden, false);
  assert.equal(f.error.textContent, undefined);
  assert.equal(f.form.hidden, false);
  assert.equal(f.result.hidden, true);
  assert.equal(f.form.resets, 0);
  assert.deepEqual(f.controls.map(control => control.value), values);
  assertUnlocked(f);
  f.dialog.open = false;
  await f.send();
  assert.equal(calls, 2);
  assert.equal(f.error.hidden, true);
  assert.equal(f.form.resets, 1);
  assert.equal(f.result.focusCount, 0, 'Closed dialog does not steal focus');
});

test('20-second timeout aborts, preserves inputs, unlocks, and allows retry', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let signal;
  let calls = 0;
  const f = fixture((_data, options) => {
    signal = options.signal;
    return ++calls === 1 ? new Promise(() => {}) : Promise.resolve();
  });
  const values = f.controls.map(control => control.value);
  const pending = f.send();
  t.mock.timers.tick(19_999);
  assert.equal(signal.aborted, false);
  assert.equal(f.button.disabled, true);
  t.mock.timers.tick(1);
  await pending;
  assert.equal(signal.aborted, true);
  assert.equal(f.error.hidden, false);
  assert.deepEqual(f.controls.map(control => control.value), values);
  assertUnlocked(f);
  await f.send();
  assert.equal(calls, 2);
  assert.equal(f.result.hidden, false);
  assertUnlocked(f);
});
