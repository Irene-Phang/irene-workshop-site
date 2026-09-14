const test = require("node:test");
const assert = require("node:assert/strict");
const Registration = require("../registration.js");

const CONFIG = {
  missingProofMessage: "请先上传付款证明后再提交报名。",
  maxProofSizeMb: 5,
  acceptedProofTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"]
};

test("rejects a missing payment proof", () => {
  assert.deepEqual(Registration.validateProof(null, CONFIG), {
    ok: false,
    message: "请先上传付款证明后再提交报名。"
  });
});

test("rejects unsupported or oversized payment proofs", () => {
  assert.deepEqual(
    Registration.validateProof({ type: "text/plain", size: 10 }, CONFIG),
    { ok: false, message: "付款证明只接受 JPG、PNG、WebP 或 PDF。" }
  );
  assert.deepEqual(
    Registration.validateProof({ type: "image/png", size: 5 * 1024 * 1024 + 1 }, CONFIG),
    { ok: false, message: "付款证明不能超过 5MB。" }
  );
});

test("accepts an allowed proof at the size boundary", () => {
  assert.deepEqual(
    Registration.validateProof({ type: "application/pdf", size: 5 * 1024 * 1024 }, CONFIG),
    { ok: true, message: "" }
  );
});

test("builds the registration snapshot sent to Google", () => {
  assert.deepEqual(Registration.createRegistrationPayload({
    submissionId: "REG-20260904-ABC123",
    nonce: "nonce-1",
    workshopId: "ai-exam-language-2026-09",
    workshopTitle: "AI 出卷实战 WORKSHOP",
    workshopDate: "15 September 2026",
    name: "林老师",
    email: "teacher@example.com",
    whatsapp: "0123456789",
    teaching: "华文 五年级",
    displayedPrice: "RM99",
    priceType: "早鸟",
    companyWebsite: "",
    proof: { name: "proof.png", type: "image/png", size: 12 },
    proofBase64: "QUJD"
  }), {
    submissionId: "REG-20260904-ABC123",
    nonce: "nonce-1",
    workshopId: "ai-exam-language-2026-09",
    workshopTitle: "AI 出卷实战 WORKSHOP",
    workshopDate: "15 September 2026",
    name: "林老师",
    email: "teacher@example.com",
    whatsapp: "0123456789",
    teaching: "华文 五年级",
    displayedPrice: "RM99",
    priceType: "早鸟",
    companyWebsite: "",
    proofName: "proof.png",
    proofType: "image/png",
    proofSize: "12",
    proofBase64: "QUJD"
  });
});

test("trusts the expected response marker and nonce across Google redirects", () => {
  const validEvent = {
    source: {},
    data: { source: "irene-workshop-registration", nonce: "nonce-1", status: "success" }
  };

  assert.equal(Registration.isTrustedResponse(validEvent, "nonce-1"), true);
  assert.equal(Registration.isTrustedResponse({ ...validEvent, data: { ...validEvent.data, source: "other" } }, "nonce-1"), false);
  assert.equal(Registration.isTrustedResponse({ ...validEvent, data: { ...validEvent.data, nonce: "wrong" } }, "nonce-1"), false);
});

function createControllerHarness(endpoint = "https://example.com/exec") {
  const iframeWindow = {};
  const state = { busy: false, errors: [], successes: [], duplicates: [], locked: [], resetCount: 0, posts: [] };
  const controller = Registration.createSubmissionController({
    endpoint,
    timeoutMs: 30000,
    iframeWindow,
    post(payload) {
      state.posts.push(payload);
    },
    setBusy(value) {
      state.busy = value;
    },
    showError(message) {
      state.errors.push(message);
    },
    showSuccess(result) {
      state.successes.push(result);
    },
    showDuplicate(result) {
      state.duplicates.push(result);
    },
    lockForm(status) {
      state.locked.push(status);
    },
    reset() {
      state.resetCount += 1;
    },
    setTimer() {
      return 7;
    },
    clearTimer() {}
  });
  return { controller, iframeWindow, state };
}

test("an unconfigured endpoint cannot display a fake success", async () => {
  const { controller, state } = createControllerHarness("");
  const submitted = await controller.submit(async () => ({ nonce: "nonce-1" }));

  assert.equal(submitted, false);
  assert.equal(state.posts.length, 0);
  assert.deepEqual(state.successes, []);
  assert.deepEqual(state.errors, ["报名系统设置中，请 WhatsApp 联系 Irene。"]);
});

test("two rapid submits create only one transport post", async () => {
  const { controller, state } = createControllerHarness();
  let release;
  const payloadPromise = new Promise((resolve) => {
    release = () => resolve({ nonce: "nonce-1" });
  });

  const first = controller.submit(() => payloadPromise);
  const second = await controller.submit(async () => ({ nonce: "nonce-2" }));
  release();
  const firstResult = await first;

  assert.equal(second, false);
  assert.equal(firstResult, true);
  assert.equal(state.posts.length, 1);
  assert.equal(state.posts[0].nonce, "nonce-1");
});

test("backend success locks the form while a real failure reopens it", async () => {
  const failure = createControllerHarness();
  await failure.controller.submit(async () => ({ nonce: "nonce-fail" }));
  assert.equal(failure.controller.handleMessage({
    source: failure.iframeWindow,
    data: { source: "irene-workshop-registration", nonce: "nonce-fail", status: "error" }
  }), true);
  assert.deepEqual(failure.state.errors, ["暂时无法完成报名，请重试或 WhatsApp 联系 Irene"]);
  assert.equal(failure.state.resetCount, 0);
  assert.equal(failure.state.busy, false);

  const success = createControllerHarness();
  await success.controller.submit(async () => ({ nonce: "nonce-ok" }));
  assert.equal(success.controller.handleMessage({
    source: success.iframeWindow,
    data: { source: "irene-workshop-registration", nonce: "nonce-ok", status: "success", submissionId: "REG-1" }
  }), true);
  assert.equal(success.state.successes[0].submissionId, "REG-1");
  assert.equal(success.state.resetCount, 1);
  assert.equal(success.state.busy, true);
  assert.deepEqual(success.state.locked, ["success"]);
});

test("duplicate response is distinct and keeps the form locked", async () => {
  const duplicate = createControllerHarness();
  await duplicate.controller.submit(async () => ({ nonce: "nonce-duplicate" }));

  assert.equal(duplicate.controller.handleMessage({
    source: {},
    data: {
      source: "irene-workshop-registration",
      nonce: "nonce-duplicate",
      status: "duplicate",
      submissionId: "REG-FIRST"
    }
  }), true);
  assert.equal(duplicate.state.duplicates[0].submissionId, "REG-FIRST");
  assert.equal(duplicate.state.resetCount, 0);
  assert.equal(duplicate.state.busy, true);
  assert.deepEqual(duplicate.state.locked, ["duplicate"]);
});
