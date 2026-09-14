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
    email: "teacher@example.com",
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
    lockEvents: []
  };

  return {
    state,
    now: () => new Date("2026-09-04T12:00:00.000Z"),
    decodeBase64(value) {
      return Array.from(Buffer.from(value, "base64"));
    },
    lock: {
      waitLock() {
        state.lockEvents.push("wait");
      },
      releaseLock() {
        state.lockEvents.push("release");
        state.released = true;
      }
    },
    findByWorkshopAndWhatsapp(workshopId, normalizedWhatsapp) {
      const row = state.rows.find((item) =>
        item[2] === workshopId && context.normalizeWhatsApp_(item[7]) === normalizedWhatsapp
      );
      return row ? { submissionId: row[1] } : null;
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

test("rejects a submission without the Google Meet email", () => {
  const services = fakeServices();
  const result = context.processRegistration_(validParams({ email: "" }), services);

  assert.equal(result.ok, false);
  assert.equal(result.code, "INVALID_SUBMISSION");
  assert.equal(services.state.rows.length, 0);
  assert.equal(services.state.files.length, 0);
});

test("stores the email in one 15-column row for a valid submission", () => {
  const services = fakeServices();
  const result = context.processRegistration_(validParams(), services);

  assert.equal(result.ok, true);
  assert.equal(result.submissionId, "REG-20260904-ABC123");
  assert.equal(services.state.files.length, 1);
  assert.equal(services.state.files[0].mimeType, "image/png");
  assert.equal(services.state.files[0].bytes.length, 3);
  assert.match(services.state.files[0].name, /^REG-20260904-ABC123_ai-exam-language-2026-09_20260904T120000Z\.png$/);
  assert.equal(services.state.rows.length, 1);
  assert.equal(services.state.rows[0].length, 15);
  assert.equal(services.state.rows[0][1], "REG-20260904-ABC123");
  assert.equal(services.state.rows[0][6], "teacher@example.com");
  assert.equal(services.state.rows[0][9], "RM99");
  assert.equal(services.state.rows[0][10], "早鸟");
  assert.equal(services.state.rows[0][13], "待核对");
  assert.equal(services.state.released, true);
});

test("normalizes Malaysian WhatsApp variants to one value", () => {
  assert.equal(context.normalizeWhatsApp_("012-345 6789"), "60123456789");
  assert.equal(context.normalizeWhatsApp_("+60 12 345 6789"), "60123456789");
  assert.equal(context.normalizeWhatsApp_("0060 12-345 6789"), "60123456789");
});

test("three retries for one workshop and WhatsApp store only one row and proof", () => {
  const services = fakeServices();
  const attempts = [
    validParams({ submissionId: "REG-1", whatsapp: "012-345 6789" }),
    validParams({ submissionId: "REG-2", whatsapp: "+60 12 345 6789" }),
    validParams({ submissionId: "REG-3", whatsapp: "60123456789" })
  ].map((params) => context.processRegistration_(params, services));

  assert.equal(attempts[0].status, "success");
  assert.equal(attempts[1].status, "duplicate");
  assert.equal(attempts[2].status, "duplicate");
  assert.equal(attempts[1].submissionId, "REG-1");
  assert.equal(services.state.files.length, 1);
  assert.equal(services.state.rows.length, 1);
  assert.equal(services.state.rows[0][7], "60123456789");
  assert.deepEqual(services.state.lockEvents, ["wait", "release", "wait", "release", "wait", "release"]);
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
    status: "success",
    nonce: "NONCE-</script><script>alert(1)</script>",
    submissionId: "REG-1",
    message: "报名资料已经保存。"
  });

  assert.match(html, /irene-workshop-registration/);
  assert.match(html, /"status":"success"/);
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
  assert.match(html, /window\.top\.postMessage/);
});

test("response wrapper can be pasted through a JavaScript string without escaped quotes", () => {
  const responseFunction = source.slice(
    source.indexOf("function buildResponseHtml_"),
    source.indexOf("function doPost")
  );

  assert.doesNotMatch(responseFunction, /\\\"/);
});
