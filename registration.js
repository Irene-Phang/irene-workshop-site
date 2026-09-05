const Registration = (() => {
  function bytesFromMb(value) {
    return value * 1024 * 1024;
  }

  function validateProof(file, config) {
    if (!file) {
      return { ok: false, message: config.missingProofMessage };
    }

    if (!config.acceptedProofTypes.includes(file.type)) {
      return { ok: false, message: "付款证明只接受 JPG、PNG、WebP 或 PDF。" };
    }

    if (file.size > bytesFromMb(config.maxProofSizeMb)) {
      return { ok: false, message: `付款证明不能超过 ${config.maxProofSizeMb}MB。` };
    }

    return { ok: true, message: "" };
  }

  function createRegistrationPayload(values) {
    return {
      submissionId: values.submissionId,
      nonce: values.nonce,
      workshopId: values.workshopId,
      workshopTitle: values.workshopTitle,
      workshopDate: values.workshopDate,
      name: values.name,
      whatsapp: values.whatsapp,
      teaching: values.teaching,
      displayedPrice: values.displayedPrice,
      priceType: values.priceType,
      companyWebsite: values.companyWebsite,
      proofName: values.proof.name,
      proofType: values.proof.type,
      proofSize: String(values.proof.size),
      proofBase64: values.proofBase64
    };
  }

  function isTrustedResponse(event, iframeWindow, nonce) {
    return event.source === iframeWindow &&
      event.data?.source === "irene-workshop-registration" &&
      event.data?.nonce === nonce;
  }

  function createSubmissionController(options) {
    let submitting = false;
    let activeNonce = "";
    let timeoutId = null;

    function finish() {
      submitting = false;
      activeNonce = "";
      if (timeoutId !== null) {
        options.clearTimer(timeoutId);
        timeoutId = null;
      }
      options.setBusy(false);
    }

    async function submit(createPayload) {
      if (submitting) {
        return false;
      }

      if (!options.endpoint) {
        options.showError("报名系统设置中，请 WhatsApp 联系 Irene。");
        return false;
      }

      submitting = true;
      options.setBusy(true);

      try {
        const payload = await createPayload();
        activeNonce = payload.nonce;
        options.post(payload);
        timeoutId = options.setTimer(() => {
          finish();
          options.showError("暂时无法确认报名是否成功，请重试或 WhatsApp 联系 Irene。");
        }, options.timeoutMs);
        return true;
      } catch (error) {
        finish();
        options.showError(error.message || "报名资料无法提交，请重试。");
        return false;
      }
    }

    function handleMessage(event) {
      if (!submitting || !isTrustedResponse(event, options.iframeWindow, activeNonce)) {
        return false;
      }

      const result = event.data;
      finish();

      if (result.ok) {
        options.showSuccess(result);
        options.reset();
      } else {
        options.showError(result.message || "报名资料无法保存，请重试。");
      }

      return true;
    }

    return { submit, handleMessage };
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(String(reader.result).split(",")[1] || ""));
      reader.addEventListener("error", () => reject(new Error("无法读取付款证明，请重新选择。")));
      reader.readAsDataURL(file);
    });
  }

  function createToken(prefix) {
    const value = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return `${prefix}-${value.replace(/-/g, "").toUpperCase()}`;
  }

  function postViaIframe(endpoint, frameName, payload) {
    const transportForm = document.createElement("form");
    transportForm.method = "POST";
    transportForm.action = endpoint;
    transportForm.target = frameName;
    transportForm.hidden = true;

    Object.entries(payload).forEach(([name, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value ?? "";
      transportForm.append(input);
    });

    document.body.append(transportForm);
    transportForm.submit();
    transportForm.remove();
  }

  function setup({ form, workshop, priceState, config }) {
    if (!form || !workshop) {
      return;
    }

    const proofInput = form.querySelector("[data-proof-input]");
    const fileLabel = form.querySelector("[data-file-label]");
    const fileStatus = form.querySelector("[data-file-status]");
    const proofName = form.querySelector("[data-proof-name]");
    const removeProof = form.querySelector("[data-remove-proof]");
    const message = form.querySelector("[data-form-message]");
    const submitButton = form.querySelector('button[type="submit"]');
    const responseFrame = form.querySelector("[data-registration-response-frame]");

    function updateFileStatus() {
      const file = proofInput.files[0];
      fileStatus.hidden = !file;
      proofName.textContent = file ? file.name : "";
      fileLabel.textContent = file ? "重新选择" : "选择付款证明";
    }

    function clearMessage() {
      message.replaceChildren();
      message.className = "form-message";
    }

    function showError(text) {
      clearMessage();
      message.classList.add("form-message--error");
      message.textContent = text;
    }

    function showSuccess(result) {
      const title = document.createElement("strong");
      const text = document.createElement("p");
      const reference = document.createElement("p");
      clearMessage();
      message.classList.add("form-message--success");
      title.textContent = config.successTitle;
      text.textContent = config.successMessage;
      reference.textContent = `报名编号：${result.submissionId}`;
      message.append(title, text, reference);
    }

    const controller = createSubmissionController({
      endpoint: config.endpoint,
      timeoutMs: config.submissionTimeoutMs,
      iframeWindow: responseFrame.contentWindow,
      post(payload) {
        postViaIframe(config.endpoint, responseFrame.name, payload);
      },
      setBusy(value) {
        submitButton.disabled = value;
        submitButton.textContent = value ? "正在提交…" : "提交报名";
        form.setAttribute("aria-busy", String(value));
      },
      showError,
      showSuccess,
      reset() {
        form.reset();
        updateFileStatus();
      },
      setTimer: window.setTimeout.bind(window),
      clearTimer: window.clearTimeout.bind(window)
    });

    proofInput.addEventListener("change", () => {
      clearMessage();
      updateFileStatus();
    });
    removeProof.addEventListener("click", () => {
      proofInput.value = "";
      updateFileStatus();
      proofInput.focus();
    });
    window.addEventListener("message", controller.handleMessage);

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearMessage();

      if (!form.reportValidity()) {
        return;
      }

      const proof = proofInput.files[0];
      const validation = validateProof(proof, config);
      if (!validation.ok) {
        showError(validation.message);
        return;
      }

      await controller.submit(async () => {
        const nonce = createToken("NONCE");
        return createRegistrationPayload({
          submissionId: createToken("REG"),
          nonce,
          workshopId: workshop.id,
          workshopTitle: workshop.title,
          workshopDate: workshop.dateLabel,
          name: form.elements.name.value.trim(),
          whatsapp: form.elements.whatsapp.value.trim(),
          teaching: form.elements.teaching.value.trim(),
          displayedPrice: `RM${priceState.currentPrice}`,
          priceType: priceState.isEarlyBird ? "早鸟" : "正价",
          companyWebsite: form.elements.companyWebsite.value,
          proof,
          proofBase64: await fileToBase64(proof)
        });
      });
    });

    updateFileStatus();
  }

  return {
    bytesFromMb,
    validateProof,
    createRegistrationPayload,
    isTrustedResponse,
    createSubmissionController,
    setup
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = Registration;
}

if (typeof window !== "undefined") {
  window.Registration = Registration;
}
