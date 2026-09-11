/* ==========================================================================
   SavoLuma — portal-login.js
   Shared by every *-login.html page. Posts to /api/v1/auth/login and,
   when the backend requires it, /api/v1/auth/verify-2fa.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  if (!form) return;

  const role = form.getAttribute('data-role');
  const redirect = form.getAttribute('data-redirect');
  const errorBox = document.getElementById('authError');
  const submitBtn = form.querySelector('button[type="submit"]');

  const existing = SavoAuth.getSession();
  if (existing && existing.token && existing.role === role) {
    window.location.href = redirect;
    return;
  }

  let pendingUsername = '';
  let pendingChallengeId = '';

  function showError(message) {
    errorBox.textContent = message;
    errorBox.style.display = 'block';
  }

  function hideError() {
    errorBox.textContent = '';
    errorBox.style.display = 'none';
  }

  function finishLogin(data, username) {
    if (role && data.role !== role) {
      SavoAuth.clearSession();
      showError('This is the ' + role + ' login. Your account role is ' + data.role + '.');
      return;
    }
    SavoAuth.setSessionFromAuthResponse(data, username);
    window.location.href = redirect;
  }

  function showTwoFactorStep(username, challengeId, developmentOtpHint) {
    pendingUsername = username;
    pendingChallengeId = challengeId;

    const passwordField = document.getElementById('loginPassword');
    if (passwordField) passwordField.closest('.field').style.display = 'none';
    document.getElementById('loginUsername').readOnly = true;

    let otpWrap = document.getElementById('otpFieldWrap');
    if (!otpWrap) {
      otpWrap = document.createElement('div');
      otpWrap.className = 'field';
      otpWrap.id = 'otpFieldWrap';
      otpWrap.innerHTML = '<label for="loginOtp">Verification code</label>'
        + '<input id="loginOtp" inputmode="numeric" autocomplete="one-time-code" required maxlength="8">'
        + '<p class="field-hint" id="otpHint">Enter the code from your authenticator or email.</p>';
      passwordField.closest('.field').after(otpWrap);
    }
    otpWrap.style.display = 'block';
    const hint = document.getElementById('otpHint');
    if (hint) {
      hint.textContent = developmentOtpHint
        ? ('Development code (server TWO_FACTOR_DEV_RETURN): ' + developmentOtpHint)
        : 'Enter the verification code issued by the server for this login.';
    }
    document.getElementById('loginOtp').focus();
    submitBtn.textContent = 'Verify';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();
    submitBtn.disabled = true;

    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const otpInput = document.getElementById('loginOtp');

    try {
      if (pendingChallengeId && otpInput) {
        const data = await SavoAPI.verifyTwoFactor(pendingUsername || username, pendingChallengeId, otpInput.value.trim());
        finishLogin(data, pendingUsername || username);
        return;
      }

      const data = await SavoAPI.login(username, password);
      if (data.twoFactorRequired) {
        showTwoFactorStep(username, data.challengeId, data.developmentOtpHint);
        return;
      }
      finishLogin(data, username);
    } catch (err) {
      showError(err.message || 'Sign-in failed.');
    } finally {
      submitBtn.disabled = false;
    }
  });
});
