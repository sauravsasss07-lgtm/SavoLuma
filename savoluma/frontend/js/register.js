/* ==========================================================================
   SavoLuma — register.js
   Populates the reporting-manager list and creates a new employee record
   via SavoAPI.createEmployee(), which auto-generates the Employee ID.
   Real backend: POST /api/v1/users (HR/ADMIN only, enforced server-side).
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const db = SavoDB.load();
  const managerSelect = document.getElementById('regManager');
  const managers = db.users.filter(u => ['MANAGER', 'ADMIN', 'CEO'].includes(u.role) && u.status === 'ACTIVE');
  managerSelect.innerHTML = '<option value="">None</option>' + managers.map(m => `<option value="${m.employeeId}">${m.name} (${m.role})</option>`).join('');

  const form = document.getElementById('registerForm');
  const result = document.getElementById('registerResult');
  const errorBox = document.getElementById('authError');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('regUsername').value.trim();

    const freshDb = SavoDB.load();
    if (freshDb.users.some(u => u.username === username)) {
      errorBox.textContent = 'That username already exists. Choose a different one.';
      errorBox.style.display = 'block';
      return;
    }
    errorBox.style.display = 'none';

    const employee = SavoAPI.createEmployee({
      name: document.getElementById('regName').value.trim(),
      email: document.getElementById('regEmail').value.trim(),
      phone: document.getElementById('regPhone').value.trim(),
      role: document.getElementById('regRole').value,
      department: document.getElementById('regDept').value.trim(),
      team: document.getElementById('regTeam').value.trim() || 'Unassigned',
      manager: managerSelect.value || null,
      username: username,
      password: document.getElementById('regPassword').value,
      photo: null
    });

    result.style.display = 'block';
    result.innerHTML = `Employee created — <strong>ID: ${employee.employeeId}</strong>, username: <strong>${employee.username}</strong>. Share the temporary password securely; they'll use it on the ${employee.role} login.`;
    form.reset();
    document.getElementById('regPassword').value = 'Welcome@123';
  });
});
