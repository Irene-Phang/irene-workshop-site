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

  return {
    bytesFromMb,
    validateProof,
    createRegistrationPayload,
    isTrustedResponse
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = Registration;
}

if (typeof window !== "undefined") {
  window.Registration = Registration;
}
