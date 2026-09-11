/* ==========================================================================
   SavoLuma — auth.js
   Stores the JWT issued by POST /api/v1/auth/login (or /verify-2fa).
   Dashboard guards require a real token, not a client-made mock.
   ========================================================================== */

const SavoAuth = (() => {
  const SESSION_KEY = 'savoluma_session_v1';

  function persistSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  function setSessionFromAuthResponse(data, username) {
    const session = {
      token: data.token,
      employeeId: data.employeeId,
      username: username,
      name: data.name,
      role: data.role,
      loginAt: new Date().toISOString()
    };
    persistSession(session);
    return session;
  }

  function getSession() {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (_) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  function logout() {
    if (typeof SavoAPI !== 'undefined' && SavoAPI.logout) {
      return SavoAPI.logout();
    }
    clearSession();
    return Promise.resolve();
  }

  function guard(requiredRole, loginPage) {
    const session = getSession();
    if (!session || !session.token || session.role !== requiredRole) {
      window.location.href = loginPage;
      return null;
    }
    return session;
  }

  return { persistSession, setSessionFromAuthResponse, getSession, clearSession, logout, guard };
})();
