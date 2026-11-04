const requestJson = async (url, body) => {
  const response = await fetch(url, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error("The server returned an unreadable response. Please try again later.");
  }
  if (!response.ok) {
    const error = new Error(payload.error || "The request could not be completed.");
    error.retryAfterSeconds = Number.parseInt(response.headers.get("Retry-After") || "", 10) || 0;
    throw error;
  }
  return payload;
};

const setMessage = (element, text, isError = false) => {
  if (!element) return;
  element.textContent = text;
  element.classList.toggle("error", isError);
};

document.querySelectorAll(".password-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const input = button.parentElement.querySelector("input");
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    button.textContent = show ? "Hide" : "Show";
    button.setAttribute("aria-label", `${show ? "Hide" : "Show"} ${input.name}`);
    button.setAttribute("aria-pressed", String(show));
  });
});

document.querySelectorAll("[data-login-form]").forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = form.querySelector("[data-auth-message]");
    if (!form.reportValidity()) return;

    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true;
    setMessage(message, "Signing in…");
    try {
      const data = Object.fromEntries(new FormData(form));
      const result = await requestJson(`/api/auth/login/${encodeURIComponent(form.dataset.role)}`, data);
      window.location.assign(result.redirectTo);
    } catch (error) {
      setMessage(message, error.message, true);
      submit.disabled = false;
    }
  });
});

document.querySelectorAll("[data-registration-form]").forEach((form) => {
  let challenge = null;
  let resendTimer = 0;
  let resendInterval = 0;
  const message = form.querySelector("[data-auth-message]");
  const panel = document.querySelector("[data-verification-panel]");
  const verificationForm = panel?.querySelector("[data-verification-form]");
  const verificationMessage = panel?.querySelector("[data-verification-message]");
  const success = document.querySelector("[data-registration-success]");
  const resendButton = panel?.querySelector("[data-resend-otp]");
  const countdown = panel?.querySelector("[data-resend-countdown]");

  const startResendCountdown = (seconds) => {
    window.clearInterval(resendInterval);
    resendTimer = Math.max(0, Math.ceil(seconds));
    resendButton.disabled = resendTimer > 0;
    const update = () => {
      if (resendTimer <= 0) {
        resendButton.disabled = false;
        countdown.textContent = "You can request another code.";
        window.clearInterval(resendInterval);
        return;
      }
      countdown.textContent = `Request another code in ${resendTimer} second${resendTimer === 1 ? "" : "s"}.`;
      resendTimer -= 1;
    };
    update();
    if (resendTimer > 0) {
      resendInterval = window.setInterval(update, 1000);
    }
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true;
    setMessage(message, "Sending your verification code…");
    try {
      const data = Object.fromEntries(new FormData(form));
      const result = await requestJson(`/api/auth/register/${encodeURIComponent(form.dataset.role)}`, data);
      challenge = { id: result.challengeId, token: result.challengeToken };
      panel.querySelector("[data-verification-email]").textContent = result.email;
      form.hidden = true;
      panel.hidden = false;
      setMessage(message, "");
      startResendCountdown(result.resendAfterSeconds);
      panel.querySelector('input[name="otp"]').focus();
    } catch (error) {
      setMessage(message, error.message, true);
      submit.disabled = false;
    }
  });

  verificationForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!challenge || !verificationForm.reportValidity()) return;

    const submit = verificationForm.querySelector('[type="submit"]');
    submit.disabled = true;
    setMessage(verificationMessage, "Verifying your email address…");
    try {
      await requestJson("/api/auth/verify-email", {
        challengeId: challenge.id,
        challengeToken: challenge.token,
        otp: new FormData(verificationForm).get("otp")
      });
      challenge = null;
      window.clearInterval(resendInterval);
      panel.hidden = true;
      success.hidden = false;
      success.querySelector("h2").focus();
    } catch (error) {
      setMessage(verificationMessage, error.message, true);
      submit.disabled = false;
    }
  });

  resendButton?.addEventListener("click", async () => {
    if (!challenge || resendButton.disabled) return;
    resendButton.disabled = true;
    setMessage(verificationMessage, "Sending a new verification code…");
    try {
      const result = await requestJson("/api/auth/resend-otp", {
        challengeId: challenge.id,
        challengeToken: challenge.token
      });
      setMessage(verificationMessage, "A new code has been sent to your email address.");
      startResendCountdown(result.resendAfterSeconds);
      verificationForm.querySelector('input[name="otp"]').value = "";
    } catch (error) {
      setMessage(verificationMessage, error.message, true);
      if (error.retryAfterSeconds) {
        startResendCountdown(error.retryAfterSeconds);
      } else {
        resendButton.disabled = false;
      }
    }
  });
});

const dashboard = document.querySelector("[data-dashboard-role]");
if (dashboard) {
  const expectedRole = dashboard.dataset.dashboardRole || window.location.pathname.split("/").pop();
  const loginPage = expectedRole === "staff"
    ? "/shm-staff-login.html"
    : expectedRole === "landlord" ? "/landlord-login.html" : "/tenant-login.html";

  fetch("/api/auth/session", { credentials: "same-origin", cache: "no-store" })
    .then(async (response) => {
      if (response.status === 401) {
        window.location.replace(loginPage);
        return;
      }
      if (!response.ok) throw new Error("We could not verify your session. Please refresh the page.");
      const sessionInfo = await response.json();
      if (sessionInfo.role !== expectedRole
        || (expectedRole === "staff" && sessionInfo.staffRole !== "admin")) {
        window.location.replace(loginPage);
      }
    })
    .catch((error) => {
      setMessage(dashboard.querySelector("[data-auth-message]"), error.message, true);
    });

  dashboard.querySelector("[data-logout]")?.addEventListener("click", async () => {
    const button = dashboard.querySelector("[data-logout]");
    button.disabled = true;
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: "{}"
      });
      if (!response.ok) throw new Error("Sign out could not be completed. Please try again.");
      window.location.assign("/shm-portal.html");
    } catch (error) {
      setMessage(dashboard.querySelector("[data-auth-message]"), error.message, true);
      button.disabled = false;
    }
  });
}
