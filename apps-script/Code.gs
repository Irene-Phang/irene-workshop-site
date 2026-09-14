var REGISTRATION_SHEET_NAME = "Registrations";
var MAX_PROOF_BYTES = 5 * 1024 * 1024;
var ALLOWED_PROOF_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

function safeText_(value, maxLength) {
  return String(value == null ? "" : value).trim().slice(0, maxLength);
}

function invalidResult_(code, message) {
  return { ok: false, status: "error", code: code, message: message };
}

function normalizeWhatsApp_(value) {
  var digits = safeText_(value, 80).replace(/\D/g, "");
  if (digits.indexOf("00") === 0) {
    digits = digits.slice(2);
  }
  if (digits.indexOf("0") === 0) {
    return "60" + digits.slice(1);
  }
  return digits;
}

function validateSubmission_(params) {
  if (safeText_(params.companyWebsite, 200)) {
    return invalidResult_("INVALID_SUBMISSION", "无法处理这次报名。");
  }

  var required = [
    "submissionId", "nonce", "workshopId", "workshopTitle", "workshopDate",
    "name", "email", "whatsapp", "displayedPrice", "priceType", "proofName",
    "proofType", "proofSize", "proofBase64"
  ];
  for (var i = 0; i < required.length; i += 1) {
    if (!safeText_(params[required[i]], required[i] === "proofBase64" ? 8000000 : 500)) {
      return invalidResult_("INVALID_SUBMISSION", "报名资料不完整，请检查后重试。");
    }
  }

  var proofType = safeText_(params.proofType, 100);
  var proofSize = Number(params.proofSize);
  var proofBase64 = safeText_(params.proofBase64, 8000000);
  if (ALLOWED_PROOF_TYPES.indexOf(proofType) === -1 ||
      !Number.isFinite(proofSize) || proofSize <= 0 || proofSize > MAX_PROOF_BYTES ||
      !/^[A-Za-z0-9+/]+={0,2}$/.test(proofBase64) || proofBase64.length % 4 !== 0) {
    return invalidResult_("INVALID_PROOF", "付款证明格式不正确或超过 5MB，请重新选择。");
  }

  return {
    ok: true,
    data: {
      submissionId: safeText_(params.submissionId, 120),
      nonce: safeText_(params.nonce, 120),
      workshopId: safeText_(params.workshopId, 120),
      workshopTitle: safeText_(params.workshopTitle, 200),
      workshopDate: safeText_(params.workshopDate, 100),
      name: safeText_(params.name, 120),
      email: safeText_(params.email, 200),
      whatsapp: normalizeWhatsApp_(params.whatsapp),
      teaching: safeText_(params.teaching, 200),
      displayedPrice: safeText_(params.displayedPrice, 40),
      priceType: safeText_(params.priceType, 40),
      proofName: safeText_(params.proofName, 200),
      proofType: proofType,
      proofSize: proofSize,
      proofBase64: proofBase64
    }
  };
}

function pad2_(value) {
  return String(value).padStart(2, "0");
}

function formatUtcTimestamp_(date) {
  return date.getUTCFullYear() +
    pad2_(date.getUTCMonth() + 1) +
    pad2_(date.getUTCDate()) + "T" +
    pad2_(date.getUTCHours()) +
    pad2_(date.getUTCMinutes()) +
    pad2_(date.getUTCSeconds()) + "Z";
}

function extensionForMime_(mimeType) {
  return {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "application/pdf": "pdf"
  }[mimeType];
}

function sanitizeIdentifier_(value) {
  return String(value).replace(/[^A-Za-z0-9_-]/g, "-").slice(0, 120);
}

function processRegistration_(params, services) {
  var validation = validateSubmission_(params);
  if (!validation.ok) {
    return validation;
  }

  var data = validation.data;
  var createdFile = null;
  services.lock.waitLock(30000);

  try {
    var existing = services.findByWorkshopAndWhatsapp(data.workshopId, data.whatsapp);
    if (existing) {
      return {
        ok: true,
        status: "duplicate",
        submissionId: existing.submissionId || "",
        message: "你已经提交过这场 Workshop 的报名。"
      };
    }

    var bytes = services.decodeBase64(data.proofBase64);
    if (!bytes || bytes.length !== data.proofSize || bytes.length > MAX_PROOF_BYTES) {
      return invalidResult_("INVALID_PROOF", "付款证明格式不正确或超过 5MB，请重新选择。");
    }

    var now = services.now();
    var fileName = sanitizeIdentifier_(data.submissionId) + "_" +
      sanitizeIdentifier_(data.workshopId) + "_" +
      formatUtcTimestamp_(now) + "." + extensionForMime_(data.proofType);
    createdFile = services.createFile({
      bytes: bytes,
      mimeType: data.proofType,
      name: fileName
    });

    try {
      services.appendRow([
        now,
        data.submissionId,
        data.workshopId,
        data.workshopTitle,
        data.workshopDate,
        data.name,
        data.email,
        data.whatsapp,
        data.teaching,
        data.displayedPrice,
        data.priceType,
        createdFile.name,
        createdFile.url,
        "待核对",
        ""
      ]);
    } catch (error) {
      services.trashFile(createdFile);
      throw error;
    }

    return {
      ok: true,
      status: "success",
      submissionId: data.submissionId,
      message: "报名资料已经保存。"
    };
  } finally {
    services.lock.releaseLock();
  }
}

function createGoogleServices_() {
  var properties = PropertiesService.getScriptProperties();
  var spreadsheetId = properties.getProperty("SPREADSHEET_ID");
  var paymentFolderId = properties.getProperty("PAYMENT_FOLDER_ID");
  if (!spreadsheetId || !paymentFolderId) {
    throw new Error("Registration storage is not configured.");
  }

  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(REGISTRATION_SHEET_NAME);
  var folder = DriveApp.getFolderById(paymentFolderId);
  if (!sheet) {
    throw new Error("Registrations sheet is missing.");
  }

  return {
    now: function () { return new Date(); },
    decodeBase64: function (value) { return Utilities.base64Decode(value); },
    lock: LockService.getScriptLock(),
    findByWorkshopAndWhatsapp: function (workshopId, normalizedWhatsapp) {
      if (sheet.getLastRow() < 2) return null;
      var rows = sheet.getRange(2, 2, sheet.getLastRow() - 1, 7).getValues();
      for (var i = 0; i < rows.length; i += 1) {
        if (safeText_(rows[i][1], 120) === workshopId &&
            normalizeWhatsApp_(rows[i][6]) === normalizedWhatsapp) {
          return { submissionId: safeText_(rows[i][0], 120) };
        }
      }
      return null;
    },
    createFile: function (fileData) {
      var driveFile = folder.createFile(Utilities.newBlob(fileData.bytes, fileData.mimeType, fileData.name));
      return { name: driveFile.getName(), url: driveFile.getUrl(), driveFile: driveFile };
    },
    appendRow: function (row) { sheet.appendRow(row); },
    trashFile: function (file) { file.driveFile.setTrashed(true); }
  };
}

function buildResponseHtml_(result) {
  var payload = {
    source: "irene-workshop-registration",
    nonce: result.nonce || "",
    ok: Boolean(result.ok),
    status: result.status || "error",
    submissionId: result.submissionId || "",
    message: result.message || "报名资料无法保存，请重试。"
  };
  var serialized = JSON.stringify(payload)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
  return '<!doctype html><meta charset="utf-8"><script>(function(){var result=' +
    serialized + ';window.top.postMessage(result,"*");if(window.parent!==window.top){window.parent.postMessage(result,"*");}}());</scr' + 'ipt>';
}

function doPost(e) {
  var params = e && e.parameter ? e.parameter : {};
  var result;
  try {
    result = processRegistration_(params, createGoogleServices_());
  } catch (error) {
    console.error(error);
    result = invalidResult_("STORAGE_ERROR", "报名资料暂时无法保存，请稍后重试或 WhatsApp 联系 Irene。");
  }
  result.nonce = safeText_(params.nonce, 120);
  result.submissionId = result.submissionId || safeText_(params.submissionId, 120);
  return HtmlService.createHtmlOutput(buildResponseHtml_(result))
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
