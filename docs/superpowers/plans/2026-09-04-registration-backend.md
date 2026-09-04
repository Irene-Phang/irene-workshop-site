# Workshop Registration Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect the existing static registration form to Google Apps Script so registration rows are saved in Google Sheets and payment proofs are saved privately in Google Drive before the site reports success.

**Architecture:** Keep the site static. A focused browser module validates the form, encodes the proof, and posts a normal HTML form into a hidden iframe; an Apps Script Web App validates and stores the submission, then returns an HTML response that reports the result through `postMessage`. Google resource IDs remain in Apps Script Properties, while only the public Web App URL is configured once in `data.js`.

**Tech Stack:** HTML, CSS, Vanilla JavaScript, Node.js built-in test runner, Google Apps Script, Google Sheets, Google Drive

**Spec:** `docs/superpowers/specs/2026-09-04-registration-backend-design.md`

## Global Constraints

- Preserve the current pure HTML, CSS, and Vanilla JavaScript static-site architecture.
- Keep the public Apps Script endpoint in `siteData.registration.endpoint`; never duplicate it in HTML or another JavaScript file.
- Keep `SPREADSHEET_ID` and `PAYMENT_FOLDER_ID` only in Apps Script Properties; never commit them.
- Accept only JPEG, PNG, WebP, and PDF payment proofs up to 5MB.
- Do not show success until the Apps Script response confirms both Drive and Sheet writes.
- Calculate the displayed registration price with the existing Malaysia-time `getWorkshopPriceState()` behavior.
- Do not send automatic WhatsApp, email, payment confirmation, or Google Meet links.
- Keep the Google Sheet and payment-proof folder private.
- Implement every behavior change with a failing test first.

## File Structure

- Create `registration.js`: browser-safe registration validation, payload building, iframe transport, message verification, and UI controller.
- Create `apps-script/Code.gs`: Apps Script request validation, Drive upload, Sheet append, rollback, deduplication, and response HTML.
- Create `apps-script/appsscript.json`: minimal Apps Script manifest and Kuala Lumpur timezone.
- Create `tests/registration.test.cjs`: Node tests for the public frontend registration contract.
- Create `tests/apps-script-registration.test.cjs`: Node VM tests for Apps Script behavior with in-memory Google-service fakes.
- Modify `data.js`: add the one public endpoint setting and proof constraints.
- Modify `workshop-template.html`: load `registration.js`, add the honeypot and hidden response iframe.
- Modify `script.js`: delegate the existing form setup to the new module and remove the fake-success implementation.
- Modify `style.css`: submitting, error, and unavailable states only.
- Modify `DAILY-UPDATES.md`: document endpoint and registration-system maintenance.

---

### Task 1: Frontend Registration Contract

**Files:**
- Create: `registration.js`
- Create: `tests/registration.test.cjs`
- Modify: `data.js`

**Interfaces:**
- Consumes: `getWorkshopPriceState(workshop, dateKey?)` from `script.js`; `siteData.registration` and a workshop object.
- Produces: `Registration.validateProof(file, config)`, `Registration.createRegistrationPayload(values)`, `Registration.isTrustedResponse(event, iframeWindow, nonce)`, and `Registration.bytesFromMb(value)`.

- [ ] **Step 1: Write failing validation and payload tests**

Add literal expectations covering the production failures: missing proof accepted, unsupported MIME accepted, a file over 5MB accepted, a wrong iframe response trusted, and workshop/price fields omitted.

```javascript
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
    proofName: "proof.png",
    proofType: "image/png",
    proofSize: "12",
    proofBase64: "QUJD"
  });
});
```

- [ ] **Step 2: Run the new test and verify RED**

Run: `node --test tests/registration.test.cjs`

Expected: FAIL because `registration.js` and the exported functions do not exist.

- [ ] **Step 3: Implement the smallest browser-safe contract**

Expose one object in both environments without a build step:

```javascript
const Registration = (() => {
  function bytesFromMb(value) {
    return value * 1024 * 1024;
  }

  function validateProof(file, config) {
    if (!file) return { ok: false, message: config.missingProofMessage };
    if (!config.acceptedProofTypes.includes(file.type)) {
      return { ok: false, message: "付款证明只接受 JPG、PNG、WebP 或 PDF。" };
    }
    if (file.size > bytesFromMb(config.maxProofSizeMb)) {
      return { ok: false, message: `付款证明不能超过 ${config.maxProofSizeMb}MB。` };
    }
    return { ok: true, message: "" };
  }

  return { bytesFromMb, validateProof, createRegistrationPayload, isTrustedResponse, setup };
})();

if (typeof module !== "undefined" && module.exports) module.exports = Registration;
if (typeof window !== "undefined") window.Registration = Registration;
```

Add the centralized configuration:

```javascript
registration: {
  endpoint: "",
  maxProofSizeMb: 5,
  acceptedProofTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  submissionTimeoutMs: 30000,
  // existing copy remains here
}
```

- [ ] **Step 4: Run the frontend contract tests and verify GREEN**

Run: `node --test tests/registration.test.cjs tests/workshop-pricing.test.cjs`

Expected: all tests PASS.

- [ ] **Step 5: Commit the contract**

```bash
git add -- registration.js data.js tests/registration.test.cjs
git commit -m "feat: define registration submission contract"
```

### Task 2: Real Form State and Iframe Transport

**Files:**
- Modify: `registration.js`
- Modify: `tests/registration.test.cjs`
- Modify: `workshop-template.html`
- Modify: `script.js`
- Modify: `style.css`

**Interfaces:**
- Consumes: `Registration.setup({ form, workshop, priceState, config })` and the Task 1 validation/payload functions.
- Produces: one form post to `[data-registration-response-frame]`, followed by a verified `{ source: "irene-workshop-registration", nonce, ok, submissionId, message }` response.

- [ ] **Step 1: Write failing controller tests**

Use small real test doubles that record form submissions and UI state. Cover: empty endpoint never succeeds, two rapid clicks submit once, a mismatched nonce is ignored, a backend failure preserves values, and a matching success resets the form.

```javascript
test("an unconfigured endpoint cannot display a fake success", async () => {
  const harness = createFormHarness({ endpoint: "" });
  await harness.submit();
  assert.equal(harness.submitCount, 0);
  assert.equal(harness.message, "报名系统设置中，请 WhatsApp 联系 Irene。");
  assert.equal(harness.messageType, "error");
});

test("ignores a response with the wrong nonce", () => {
  const frameWindow = {};
  assert.equal(Registration.isTrustedResponse({
    source: frameWindow,
    data: { source: "irene-workshop-registration", nonce: "wrong" }
  }, frameWindow, "expected"), false);
});
```

- [ ] **Step 2: Run the controller tests and verify RED**

Run: `node --test tests/registration.test.cjs`

Expected: FAIL because submission state, file encoding, timeout, iframe transport, and message handling are missing.

- [ ] **Step 3: Add the hidden transport elements**

Add inside the registration form:

```html
<div class="honeypot" aria-hidden="true">
  <label for="company-website">Website</label>
  <input id="company-website" name="companyWebsite" type="text" tabindex="-1" autocomplete="off">
</div>
<iframe class="registration-response-frame" name="registration-response" data-registration-response-frame title="报名提交结果" hidden></iframe>
```

Load `registration.js` after `data.js` and before `script.js` on every page using the same cache version.

- [ ] **Step 4: Implement file encoding, one-shot submission, timeout, and UI states**

The controller must build actual hidden inputs, set the temporary form target/action/method, submit exactly once, then restore the original form attributes. It must disable the submit button until a matching response or timeout.

```javascript
function isTrustedResponse(event, iframeWindow, nonce) {
  return event.source === iframeWindow &&
    event.data?.source === "irene-workshop-registration" &&
    event.data?.nonce === nonce;
}
```

Replace the fake-success body in `setupRegistrationForm()` with:

```javascript
Registration.setup({
  form,
  workshop: getWorkshopBySlug(siteData, new URLSearchParams(location.search).get("workshop")),
  priceState: getWorkshopPriceState(workshop),
  config: siteData.registration
});
```

Add only state styles: hidden honeypot, disabled submit button, and existing error/success colors.

- [ ] **Step 5: Run tests and browser-check the unavailable state**

Run: `node --test tests/registration.test.cjs tests/workshop-pricing.test.cjs`

Expected: all tests PASS.

Browser check at 390px with the endpoint still empty: valid-looking input plus proof must show “报名系统设置中，请 WhatsApp 联系 Irene。” and must not show `successTitle`.

- [ ] **Step 6: Commit the transport**

```bash
git add -- registration.js tests/registration.test.cjs workshop-template.html script.js style.css index.html past-workshops.html
git commit -m "feat: connect registration form to verified transport"
```

### Task 3: Apps Script Storage Handler

**Files:**
- Create: `apps-script/Code.gs`
- Create: `apps-script/appsscript.json`
- Create: `tests/apps-script-registration.test.cjs`

**Interfaces:**
- Consumes: URL-encoded parameters from Task 2 and Script Properties `SPREADSHEET_ID`, `PAYMENT_FOLDER_ID`.
- Produces: a private Drive file, one `Registrations` row, and an HTML `postMessage` response with the original nonce and submission ID.

- [ ] **Step 1: Write failing request-validation tests**

Load `Code.gs` with Node's `vm` module and exercise the real validation functions. Literal cases: required fields absent, honeypot populated, bad Base64, unsupported MIME, reported file size over 5MB, and valid input.

```javascript
test("rejects a bot honeypot without writing data", () => {
  const result = context.processRegistration_(validParams({ companyWebsite: "spam.example" }), fakeServices());
  assert.deepEqual(result, { ok: false, code: "INVALID_SUBMISSION", message: "无法处理这次报名。" });
  assert.equal(services.rows.length, 0);
  assert.equal(services.files.length, 0);
});
```

- [ ] **Step 2: Run validation tests and verify RED**

Run: `node --test tests/apps-script-registration.test.cjs`

Expected: FAIL because `Code.gs` does not exist.

- [ ] **Step 3: Implement validation and sanitized filenames**

Use constants in one place:

```javascript
var REGISTRATION_SHEET_NAME = "Registrations";
var MAX_PROOF_BYTES = 5 * 1024 * 1024;
var ALLOWED_PROOF_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
```

`validateSubmission_(params)` returns a normalized object or throws a safe `RegistrationError_`. `sanitizeFileName_()` removes path separators and control characters. The saved name follows:

The filename is assembled as `submissionId + "_" + workshopId + "_" + utcTimestamp + "." + safeExtension`.

- [ ] **Step 4: Write failing storage, deduplication, and rollback tests**

Cover these observable outcomes with in-memory service fakes:

```javascript
test("stores one file and one row for a valid submission", () => {
  const services = fakeServices();
  const result = context.processRegistration_(validParams(), services);
  assert.equal(result.ok, true);
  assert.equal(services.files.length, 1);
  assert.equal(services.rows.length, 1);
  assert.equal(services.rows[0][12], "待核对");
});

test("removes the just-created file when the sheet append fails", () => {
  const services = fakeServices({ appendError: new Error("sheet failed") });
  assert.throws(() => context.processRegistration_(validParams(), services));
  assert.equal(services.files[0].trashed, true);
});
```

- [ ] **Step 5: Run storage tests and verify RED**

Run: `node --test tests/apps-script-registration.test.cjs`

Expected: validation tests PASS and new storage tests FAIL because persistence is missing.

- [ ] **Step 6: Implement locked storage and response HTML**

`processRegistration_(params, services)` must:

1. validate;
2. obtain a script lock;
3. return the existing success result when `submissionId` already exists;
4. create the proof blob and Drive file;
5. append the 14-column row;
6. trash only the newly-created file if append fails;
7. release the lock in `finally`.

`doPost(e)` builds production adapters for `PropertiesService`, `SpreadsheetApp`, `DriveApp`, `LockService`, and `Utilities`, then returns HTML containing:

```javascript
window.parent.postMessage({
  source: "irene-workshop-registration",
  nonce: SAFE_NONCE,
  ok: true,
  submissionId: SAFE_SUBMISSION_ID,
  message: "报名资料已经保存。"
}, "*");
```

All values embedded in HTML must be serialized with `JSON.stringify`; never interpolate unescaped form content into script source.

- [ ] **Step 7: Verify all backend tests GREEN**

Run: `node --test tests/apps-script-registration.test.cjs tests/registration.test.cjs tests/workshop-pricing.test.cjs`

Expected: all tests PASS with no warnings.

- [ ] **Step 8: Commit the backend source**

```bash
git add -- apps-script/Code.gs apps-script/appsscript.json tests/apps-script-registration.test.cjs
git commit -m "feat: add Google Apps Script registration storage"
```

### Task 4: Create and Verify Google Workspace Resources

**Files:**
- Create temporarily outside the project: a local `.xlsx` used only for native Google Sheets import.
- No committed project files.

**Interfaces:**
- Consumes: the 14-column schema from the design and Task 3.
- Produces: verified private IDs for the `Workshop 报名资料` Sheet and `付款证明` folder.

- [ ] **Step 1: Search before creating**

Use Google Drive search for the exact names `Irene Workshop 报名系统`, `Workshop 报名资料`, and `付款证明`. Reuse only an exact, clearly matching Irene registration project; do not edit unrelated files.

- [ ] **Step 2: Create the folder structure if absent**

Under `My Drive/ChatGPT`, create `Irene Workshop 报名系统`, then create its private `付款证明` subfolder. Preserve default private sharing.

- [ ] **Step 3: Create the native Google Sheet through the spreadsheet workflow**

Create a local workbook with one tab named `Registrations`, freeze row 1, and write the exact 14 headers from the design. Import it with `upload_mode: "native_google_sheets"` into the project folder.

- [ ] **Step 4: Verify the exact destination**

Read Sheet metadata and the bounded range `Registrations!A1:N2`. Confirm the tab name, header order, no extra populated rows, native Google Sheets MIME type, and private sharing. Record the observed spreadsheet and folder IDs for Apps Script Properties only.

### Task 5: Deploy and Authorize the Apps Script Web App

**Files:**
- Read: `apps-script/Code.gs`
- Read: `apps-script/appsscript.json`
- Modify: `data.js`

**Interfaces:**
- Consumes: verified Sheet/folder IDs from Task 4 and tested source from Task 3.
- Produces: the observed Apps Script `/exec` Web App URL configured as `siteData.registration.endpoint`.

- [ ] **Step 1: Create the Apps Script project in Irene's Google account**

Create `Irene Workshop Registration API`, replace `Code.gs` with the tested repository source, and set the manifest timezone to `Asia/Kuala_Lumpur`.

- [ ] **Step 2: Set private Script Properties**

Create the property key `SPREADSHEET_ID` with the exact spreadsheet ID returned by the verified metadata read, and the property key `PAYMENT_FOLDER_ID` with the exact folder ID returned by the verified Drive metadata read.

Do not paste these IDs into project source or chat output.

- [ ] **Step 3: Deploy as a Web App**

Deploy a new Web App version with “Execute as: Me” and access that permits anonymous workshop registrants. Complete Irene's one-time Google authorization if prompted. Copy the returned `/exec` URL exactly as observed.

- [ ] **Step 4: Configure the one public endpoint**

Set only `siteData.registration.endpoint` to the exact `/exec` URL copied from the completed deployment result.

Do not place the URL in HTML, `registration.js`, `script.js`, or tests.

- [ ] **Step 5: Run local tests and syntax checks**

Run:

```bash
node --test tests/*.test.cjs
node --check data.js
node --check registration.js
node --check script.js
git diff --check
```

Expected: all tests and checks PASS.

- [ ] **Step 6: Commit endpoint configuration**

```bash
git add -- data.js
git commit -m "config: connect workshop registration endpoint"
```

### Task 6: Live End-to-End Registration Test

**Files:**
- No production files unless a failing test exposes a defect.
- Test first for every defect before modifying production code.

**Interfaces:**
- Consumes: the deployed Web App and local website.
- Produces: verified evidence that one browser submission creates one Sheet row and one accessible Drive proof.

- [ ] **Step 1: Submit a marked test registration at 390px**

Use:

```text
姓名：系统测试
WhatsApp：0000000000
任教科目及年级：TEST - 可删除
```

Upload an allowed image under 5MB. Click submit twice rapidly and verify the UI creates only one request, waits for the backend, then displays a real registration number.

- [ ] **Step 2: Verify Google Sheet and Drive results**

Read the new bounded Sheet row by its registration number. Confirm all 14 columns, workshop ID, title, date, current price snapshot, `待核对`, and a Drive link. Open the exact Drive file metadata and confirm MIME, filename, size, and parent folder.

- [ ] **Step 3: Verify failure behavior**

Temporarily exercise frontend-only failures without changing backend resources: unsupported text file, a generated file over 5MB, missing proof, and a second click while submitting. Confirm no new Sheet rows are created.

- [ ] **Step 4: Verify responsive layouts and browser errors**

Check homepage and registration page at 375px, 390px, 430px, and 1280px. Required evidence: no horizontal overflow, no broken images, no new console errors, correct RM99/RM119 display, usable file controls, and readable success/error status.

- [ ] **Step 5: Remove only the marked test artifacts**

Resolve the exact test row and Drive file by the recorded registration number, verify both belong to `系统测试`, then remove only those artifacts. Re-read the Sheet range and Drive folder to confirm production data was not touched.

### Task 7: Maintenance Documentation and Final Verification

**Files:**
- Modify: `DAILY-UPDATES.md`

**Interfaces:**
- Consumes: the verified endpoint and Google resource workflow.
- Produces: owner instructions that do not reveal private IDs.

- [ ] **Step 1: Update maintenance instructions**

Document:

- `registration.endpoint` is the only website-side connection setting.
- Proof types and size are controlled in `data.js` and enforced again by Apps Script.
- Sheet/folder IDs are managed in Apps Script Properties, not GitHub.
- How to pause registration safely: set Workshop `status` to `closed`.
- A successful green website message means both Drive and Sheet saves completed; payment still remains `待核对` until Irene verifies it.

- [ ] **Step 2: Run the complete verification suite**

Run:

```bash
node --test tests/*.test.cjs
node --check data.js
node --check registration.js
node --check script.js
git diff --check
git status --short
```

Expected: tests and syntax checks PASS; status lists only the intended documentation change before commit.

- [ ] **Step 3: Commit documentation**

```bash
git add -- DAILY-UPDATES.md
git commit -m "docs: explain workshop registration maintenance"
```

- [ ] **Step 4: Final readback**

Verify the latest commits, confirm no private Google IDs occur in tracked files, and confirm the working tree is clean. Do not push GitHub until Irene explicitly reaches the final publishing step.
