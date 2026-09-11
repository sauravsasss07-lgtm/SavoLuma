/* ==========================================================================
   SavoLuma — register.js
   HR/Admin onboarding via POST /api/v1/users.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  const session = SavoAuth.getSession();
  if (!session || !session.token || !['ADMIN', 'HR', 'SUPER_ADMIN'].includes(session.role)) {
    window.location.replace('index.html');
    return;
  }

  const managerSelect = document.getElementById('regManager');
  const form = document.getElementById('registerForm');
  const result = document.getElementById('registerResult');
  const errorBox = document.getElementById('authError');

  try {
    const users = await SavoAPI.getEmployees();
    const managers = users.filter(u => ['MANAGER', 'ADMIN', 'CEO'].includes(u.role) && u.status === 'ACTIVE');
    managerSelect.innerHTML = '<option value="">None</option>' + managers.map(m =>
      `<option value="${m.employeeId}">${m.name} (${m.role})</option>`).join('');
  } catch (err) {
    errorBox.textContent = err.message || 'Could not load managers from the API.';
    errorBox.style.display = 'block';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.style.display = 'none';
    result.style.display = 'none';
    try {
      const employee = await SavoAPI.createEmployee({
        name: document.getElementById('regName').value.trim(),
        email: document.getElementById('regEmail').value.trim(),
        phone: document.getElementById('regPhone').value.trim(),
        role: document.getElementById('regRole').value,
        department: document.getElementById('regDept').value.trim(),
        team: document.getElementById('regTeam').value.trim() || 'Unassigned',
        manager: managerSelect.value || null,
        username: document.getElementById('regUsername').value.trim(),
        temporaryPassword: document.getElementById('regPassword').value
      });
      result.style.display = 'block';
      result.innerHTML = 'Employee created — <strong>ID: ' + employee.employeeId
        + '</strong>, username: <strong>' + employee.username
        + '</strong>. Share the temporary password securely.';
      form.reset();
    } catch (err) {
      errorBox.textContent = err.message || 'Could not create employee.';
      errorBox.style.display = 'block';
    }
  });
});
