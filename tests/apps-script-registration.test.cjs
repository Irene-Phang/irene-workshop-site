const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "..", "apps-script", "Code.gs"), "utf8");
const context = vm.createContext({ JSON, Date, Error, String, Number, Array, Object, RegExp });
vm.runInContext(source, context);

function validParams(overrides = {}) {
  return {
    submissionId: "REG-20260904-ABC123",
    nonce: "NONCE-123",
    workshopId: "ai-exam-language-2026-09",
    workshopTitle: "AI 出卷实战 WORKSHOP",
    workshopDate: "15 September 2026",
    name: "系统测试",
    whatsapp: "0000000000",
    teaching: "TEST - 可删除",
    displayedPrice: "RM99",
    priceType: "早鸟",
    companyWebsite: "",
    proofName: "proof.png",
    proofType: "image/png",
    proofSize: "3",
    proofBase64: "QUJD",
    ...overrides
  };
}

function fakeServices(options = {}) {
  const state = {
    files: [],
    rows: [],
    released: false,
    existingSubmissionId: options.existingSubmissionId || ""
  };

  return {
    state,
    now: () => new Date("2026-09-04T12:00:00.000Z"),
    decodeBase64(value) {
      return Array.from(Buffer.from(value, "base64"));
    },
    lock: {
      waitLock() {},
      releaseLock() {
        state.released = true;
      }
    },
    findBySubmissionId(id) {
      return state.existingSubmissionId === id ? { submissionId: id } : null;
    },
    createFile(fileData) {
      const file = {
        ...fileData,
        url: "https://drive.google.com/file/d/test-file/view",
        trashed: false
      };
      state.files.push(file);
      return file;
    },
    appendRow(row) {
      if (options.appendError) throw options.appendError;
      state.rows.push(row);
    },
    trashFile(file) {
      file.trashed = true;
    }
  };
}

test("rejects a bot honeypot without writing data", () => {
  const services = fakeServices();
  const result = context.processRegistration_(validParams({ companyWebsite: "spam.example" }), services);

  assert.equal(result.ok, false);
  assert.equal(result.code, "INVALID_SUBMISSION");
  assert.equal(result.message, "无法处理这次报名。");
  assert.equal(services.state.rows.length, 0);
  assert.equal(services.state.files.length, 0);
});

test("rejects unsupported and oversized proofs", () => {
  const unsupported = fakeServices();
  const badType = context.processRegistration_(validParams({ proofType: "text/plain" }), unsupported);
  assert.equal(badType.code, "INVALID_PROOF");
  assert.equal(unsupported.state.files.length, 0);

  const oversized = fakeServices();
  const tooLarge = context.processRegistration_(validParams({ proofSize: String(5 * 1024 * 1024 + 1) }), oversized);
  assert.equal(tooLarge.code, "INVALID_PROOF");
  assert.equal(oversized.state.files.length, 0);
});

test("stores one file and one 14-column row for a valid submission", () => {
  const services = fakeServices();
  const result = context.processRegistration_(validParams(), services);

  assert.equal(result.ok, true);
  assert.equal(result.submissionId, "REG-20260904-ABC123");
  assert.equal(services.state.files.length, 1);
  assert.equal(services.state.files[0].mimeType, "image/png");
  assert.equal(services.state.files[0].bytes.length, 3);
  assert.match(services.state.files[0].name, /^REG-20260904-ABC123_ai-exam-language-2026-09_20260904T120000Z\.png$/);
  assert.equal(services.state.rows.length, 1);
  assert.equal(services.state.rows[0].length, 14);
  assert.equal(services.state.rows[0][1], "REG-20260904-ABC123");
  assert.equal(services.state.rows[0][8], "RM99");
  assert.equal(services.state.rows[0][9], "早鸟");
  assert.equal(services.state.rows[0][12], "待核对");
  assert.equal(services.state.released, true);
});

test("returns the existing success without duplicating a submission", () => {
  const services = fakeServices({ existingSubmissionId: "REG-20260904-ABC123" });
  const result = context.processRegistration_(validParams(), services);

  assert.equal(result.ok, true);
  assert.equal(result.duplicate, true);
  assert.equal(services.state.files.length, 0);
  assert.equal(services.state.rows.length, 0);
  assert.equal(services.state.released, true);
});

test("trashes the just-created file when the sheet append fails", () => {
  const services = fakeServices({ appendError: new Error("sheet failed") });

  assert.throws(() => context.processRegistration_(validParams(), services), /sheet failed/);
  assert.equal(services.state.files.length, 1);
  assert.equal(services.state.files[0].trashed, true);
  assert.equal(services.state.rows.length, 0);
  assert.equal(services.state.released, true);
});

test("response HTML posts only serialized result data", () => {
  const html = context.buildResponseHtml_({
    ok: true,
    nonce: "NONCE-</script><script>alert(1)</script>",
    submissionId: "REG-1",
    message: "报名资料已经保存。"
  });

  assert.match(html, /irene-workshop-registration/);
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
  assert.match(html, /window\.parent\.postMessage/);
});

test("response wrapper can be pasted through a JavaScript string without escaped quotes", () => {
  const responseFunction = source.slice(
    source.indexOf("function buildResponseHtml_"),
    source.indexOf("function doPost")
  );

  assert.doesNotMatch(responseFunction, /\\\"/);
});
