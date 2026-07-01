(function () {
  "use strict";

  function initCheckoutButtons() {
    var checkoutUrl =
      (window.VOLTEX_CONFIG && window.VOLTEX_CONFIG.LEMONSQUEEZY_CHECKOUT_URL) || "";

    document.querySelectorAll("[data-lemonsqueezy-checkout]").forEach(function (el) {
      el.setAttribute("href", checkoutUrl);
      el.classList.add("lemonsqueezy-button");
    });

    // Lemon Squeezy's overlay script (loaded in index.html) turns any link
    // with class "lemonsqueezy-button" into an embedded checkout overlay
    // instead of a full page redirect. Nothing else to wire up here.
    if (window.createLemonSqueezy) {
      window.createLemonSqueezy();
    }
  }

  function encodeFormData(form) {
    var data = new FormData(form);
    var params = new URLSearchParams();
    data.forEach(function (value, key) {
      params.append(key, value);
    });
    return params.toString();
  }

  function initRegistrationForm() {
    var form = document.getElementById("client-registration-form");
    if (!form) return;

    var statusEl = document.getElementById("registration-status");

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var honeypot = form.querySelector('input[name="bot-field"]');
      if (honeypot && honeypot.value) {
        return; // silently drop spam submissions
      }

      var emailInput = form.querySelector('input[name="email"]');
      var email = emailInput ? emailInput.value.trim() : "";
      if (!email || !emailInput.checkValidity()) {
        statusEl.textContent = "Ju lutem shkruani nje adrese email te vlefshme.";
        statusEl.className = "registration-status error";
        return;
      }

      var submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) submitButton.disabled = true;
      statusEl.textContent = "Duke u regjistruar...";
      statusEl.className = "registration-status";

      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encodeFormData(form),
      })
        .then(function (response) {
          if (!response.ok) throw new Error("Request failed with " + response.status);
          statusEl.textContent = "Faleminderit! U regjistruat me sukses.";
          statusEl.className = "registration-status success";
          form.reset();
        })
        .catch(function () {
          statusEl.textContent =
            "Dicka shkoi keq. Provo perseri, ose na shkruaj direkt.";
          statusEl.className = "registration-status error";
        })
        .finally(function () {
          if (submitButton) submitButton.disabled = false;
        });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initCheckoutButtons();
    initRegistrationForm();
  });
})();
