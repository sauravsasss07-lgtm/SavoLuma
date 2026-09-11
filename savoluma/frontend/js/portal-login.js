/* ==========================================================================
   SavoLuma — portal-login.js
   Shared by every *-login.html page. The <form> carries data-role and
   data-redirect attributes so this one script drives all five logins.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  if (!form) return;

  const role = form.getAttribute('data-role');
  const redirect = form.getAttribute('data-redirect');
  const errorBox = document.getElementById('authError');

  // If already logged in as this role, skip straight to dashboard.
  const existing = SavoAuth.getSession();
  if (existing && existing.role === role) {
    window.location.href = redirect;
    return;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    const result = SavoAuth.login(username, password, role);
    if (!result.ok) {
      errorBox.textContent = result.error;
      errorBox.style.display = 'block';
      return;
    }
    window.location.href = redirect;
  });
});
