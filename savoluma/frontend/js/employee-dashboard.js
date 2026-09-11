/* ==========================================================================
   SavoLuma — employee-dashboard.js
   Profile, projects, and tasks come from /auth/me, /projects/my, /tasks/my.
   Leave still uses the local store (no leave controller yet).
   ========================================================================== */

let CURRENT_EMP_ID = null;
let profileUser = null;

document.addEventListener('DOMContentLoaded', async () => {
  const session = SavoAuth.guard('EMPLOYEE', 'employee-login.html');
  if (!session) return;
  initDashboardShell(session);
  CURRENT_EMP_ID = session.employeeId;

  await renderProfile();
  renderTeam();
  await renderProjects();
  await renderTasks();
  renderLeave();
  wireLeaveForm();
});

function empDb() { return SavoDB.load(); }

async function renderProfile() {
  try {
    profileUser = await SavoAPI.getMe();
  } catch (err) {
    showApiError(err, 'Could not load your profile.');
    return;
  }
  const u = profileUser;
  document.getElementById('profileCard').innerHTML = `
    <div class="profile-head">
      <div class="avatar-circle">${u.photo ? `<img src="${u.photo}" style="width:100%;height:100%;object-fit:cover;">` : initials(u.name)}</div>
      <div><h3 style="margin-bottom:2px;">${u.name}</h3><p class="field-hint" style="margin:0;">${u.title || u.role} · ${u.employeeId}</p></div>
    </div>
    <div class="profile-fields">
      <div class="pf-item"><div class="pf-label">Department</div><div class="pf-value">${u.department || '—'}</div></div>
      <div class="pf-item"><div class="pf-label">Team</div><div class="pf-value">${u.team || '—'}</div></div>
      <div class="pf-item"><div class="pf-label">Email</div><div class="pf-value">${u.email || '—'}</div></div>
      <div class="pf-item"><div class="pf-label">Phone</div><div class="pf-value">${u.phone || '—'}</div></div>
      <div class="pf-item"><div class="pf-label">Reporting Manager</div><div class="pf-value">${u.manager || '—'}</div></div>
      <div class="pf-item"><div class="pf-label">Username</div><div class="pf-value">${u.username || '—'}</div></div>
    </div>
  `;
}

function renderTeam() {
  document.getElementById('empTeamTable').innerHTML = `
    <tr><th>Name</th><th>Title / Role</th><th>Status</th></tr>
    <tr><td class="empty-state" colspan="3">Teammate directory is not exposed on the employee API. Your manager can see direct reports from their workspace.</td></tr>
  `;
}

async function renderProjects() {
  try {
    const projects = await SavoAPI.getProjectsForEmployee();
    document.getElementById('empProjects').innerHTML = projects.map(p => `
      <div class="mgr-project-block" style="border:1px solid var(--line);border-radius:var(--radius-lg);padding:20px;margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <h4 style="margin:0;">${p.name}</h4><span class="badge ${statusBadge(p.status)}">${p.status}</span>
        </div>
        <p style="margin:0;">${p.projectCode || ''} · Manager: ${p.managerName || p.manager || '—'}</p>
        <div class="progress-track" style="margin-top:10px;"><div class="progress-fill" style="width:${p.progress}%;"></div></div>
      </div>
    `).join('') || '<p class="field-hint">You are not currently assigned to any project.</p>';
  } catch (err) {
    showApiError(err, 'Could not load your projects.');
  }
}

async function renderTasks() {
  try {
    const tasks = await SavoAPI.getTasksForEmployee();
    document.getElementById('empTasksTable').innerHTML = `
      <tr><th>Task</th><th>Project</th><th>Priority</th><th>Due</th><th>Status</th></tr>
      ${tasks.map(t => `
          <tr><td>${t.title}</td><td>${t.projectName || t.projectId || '—'}</td>
          <td><span class="badge ${statusBadge(t.priority)}">${t.priority}</span></td>
          <td>${t.dueDate || '—'}</td>
          <td><select onchange="empUpdateTask('${t.id}', this.value)">
            ${['TODO','IN_PROGRESS','REVIEW','TESTING','DONE','BLOCKED'].map(s => `<option ${s===t.status?'selected':''}>${s}</option>`).join('')}
          </select></td></tr>
        `).join('') || `<tr><td class="empty-state" colspan="5">No tasks assigned to you right now.</td></tr>`}
    `;
  } catch (err) {
    showApiError(err, 'Could not load your tasks.');
  }
}

async function empUpdateTask(id, status) {
  try {
    await SavoAPI.updateTaskStatus(id, status);
    showToast('Task status updated.', 'success');
    await renderTasks();
  } catch (err) { showApiError(err); }
}

function renderLeave() {
  const requests = SavoAPI.getLeaveRequestsForEmployee(CURRENT_EMP_ID);
  document.getElementById('leaveList').innerHTML = requests.length ? `
    <table class="dash-table">
      <tr><th>From</th><th>To</th><th>Reason</th><th>Status</th></tr>
      ${requests.map(r => `<tr><td>${r.from}</td><td>${r.to}</td><td>${r.reason || '—'}</td><td><span class="badge badge-amber">${r.status}</span></td></tr>`).join('')}
    </table>
  ` : '<p class="field-hint">No leave requests submitted yet.</p>';
}
function wireLeaveForm() {
  document.getElementById('leaveForm').addEventListener('submit', e => {
    e.preventDefault();
    SavoAPI.submitLeaveRequest({
      employeeId: CURRENT_EMP_ID,
      from: document.getElementById('lvFrom').value,
      to: document.getElementById('lvTo').value,
      reason: document.getElementById('lvReason').value.trim()
    });
    renderLeave();
    e.target.reset();
    showToast('Leave request submitted.', 'success');
  });
}
