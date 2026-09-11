/* ==========================================================================
   SavoLuma — dashboard-common.js
   Shared by every *-dashboard.html: sidebar panel switching, logout,
   and the initials-avatar helper. Each role's own *-dashboard.js handles
   its specific data rendering and CRUD.
   ========================================================================== */

function initDashboardShell(session) {
  // Sidebar nav → panel switching
  document.querySelectorAll('.dash-nav button[data-panel]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.dash-nav button').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.dash-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const target = document.getElementById(btn.getAttribute('data-panel'));
      if (target) target.classList.add('active');
      const title = document.getElementById('topbarTitle');
      if (title) title.textContent = btn.getAttribute('data-title') || btn.textContent.trim();
    });
  });

  // User identity in sidebar footer
  const nameEl = document.getElementById('sidebarUserName');
  const roleEl = document.getElementById('sidebarUserRole');
  const avatarEl = document.getElementById('sidebarAvatar');
  if (nameEl) nameEl.textContent = session.name;
  if (roleEl) roleEl.textContent = session.role;
  if (avatarEl) avatarEl.textContent = initials(session.name);

  // Logout
  document.querySelectorAll('[data-logout]').forEach(btn => {
    btn.addEventListener('click', () => {
      SavoAuth.logout();
      window.location.href = btn.getAttribute('data-logout') || 'index.html';
    });
  });

  // Generic modal open/close wiring: elements with data-modal-open / data-modal-close
  document.querySelectorAll('[data-modal-open]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = document.getElementById(btn.getAttribute('data-modal-open'));
      if (modal) modal.classList.add('open');
    });
  });
  document.querySelectorAll('[data-modal-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      if (modal) modal.classList.remove('open');
    });
  });
}

function initials(name) {
  if (!name) return '?';
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

function statusBadge(status) {
  const map = {
    ACTIVE: 'badge-green', BLOCKED: 'badge-red', DONE: 'badge-green', COMPLETED: 'badge-green',
    IN_PROGRESS: 'badge-blue', DEVELOPMENT: 'badge-blue', REVIEW: 'badge-blue', TESTING: 'badge-blue',
    TODO: 'badge-grey', PLANNING: 'badge-grey', OPEN: 'badge-amber', NEW: 'badge-amber',
    BLOCKED_TASK: 'badge-red', HIGH: 'badge-red', MEDIUM: 'badge-amber', LOW: 'badge-grey',
    QUALIFIED: 'badge-blue', PROPOSAL: 'badge-amber', WON: 'badge-green', LOST: 'badge-red',
    PRESENT: 'badge-green', ABSENT: 'badge-red', HALF_DAY: 'badge-amber'
  };
  return map[status] || 'badge-grey';
}
