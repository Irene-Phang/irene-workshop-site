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

test("trusts only the expected iframe and nonce", () => {
  const iframeWindow = {};
  const validEvent = {
    source: iframeWindow,
    data: { source: "irene-workshop-registration", nonce: "nonce-1" }
  };

  assert.equal(Registration.isTrustedResponse(validEvent, iframeWindow, "nonce-1"), true);
  assert.equal(Registration.isTrustedResponse({ ...validEvent, source: {} }, iframeWindow, "nonce-1"), false);
  assert.equal(Registration.isTrustedResponse({ ...validEvent, data: { ...validEvent.data, nonce: "wrong" } }, iframeWindow, "nonce-1"), false);
});
