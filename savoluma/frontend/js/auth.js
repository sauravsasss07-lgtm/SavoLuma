/* ==========================================================================
   SavoLuma — auth.js
   DEMO auth layer. In production this calls POST /api/v1/auth/login,
   receives a JWT, and stores it (see api.js). Here we store a signed-
   looking session object in localStorage so every role dashboard can be
   guarded and is fully clickable offline.
   ========================================================================== */

const SavoAuth = (() => {
  const SESSION_KEY = 'savoluma_session_v1';

  function login(username, password, expectedRole) {
    const db = SavoDB.load();
    const user = db.users.find(u => u.username === username);

    if (!user) return { ok: false, error: 'No account found with that username.' };
    if (user.status === 'BLOCKED') return { ok: false, error: 'This account has been deactivated by an administrator. Contact HR/Admin.' };
    if (user.password !== password) return { ok: false, error: 'Incorrect password.' };
    if (expectedRole && user.role !== expectedRole) {
      return { ok: false, error: `This is the ${expectedRole} login. Your account role is ${user.role}.` };
    }

    const session = {
      employeeId: user.employeeId,
      username: user.username,
      name: user.name,
      role: user.role,
      loginAt: new Date().toISOString(),
      // In production: token: response.jwt
      mockToken: btoa(`${user.employeeId}:${user.role}:${Date.now()}`)
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { ok: true, session };
  }

  function getSession() {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
  }

  // Call at the top of every protected dashboard page.
  // Redirects to the correct login if there is no session or the role doesn't match.
  function guard(requiredRole, loginPage) {
    const session = getSession();
    if (!session || session.role !== requiredRole) {
      window.location.href = loginPage;
      return null;
    }
    return session;
  }

  return { login, getSession, logout, guard };
})();
