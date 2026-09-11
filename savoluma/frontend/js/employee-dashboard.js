/* ==========================================================================
   SavoLuma — employee-dashboard.js
   Employee can only ever see their own record, their own team, projects
   they're staffed on, and tasks assigned to them (spec section 20/22).
   ========================================================================== */

let CURRENT_EMP_ID = null;

document.addEventListener('DOMContentLoaded', () => {
  const session = SavoAuth.guard('EMPLOYEE', 'employee-login.html');
  if (!session) return;
  initDashboardShell(session);
  CURRENT_EMP_ID = session.employeeId;

  renderProfile();
  renderTeam();
  renderProjects();
  renderTasks();
  renderLeave();
  wireLeaveForm();
});

function empDb() { return SavoDB.load(); }
function me() { return empDb().users.find(u => u.employeeId === CURRENT_EMP_ID); }

function renderProfile() {
  const u = me();
  document.getElementById('profileCard').innerHTML = `
    <div class="profile-head">
      <div class="avatar-circle">${u.photo ? `<img src="${u.photo}" style="width:100%;height:100%;object-fit:cover;">` : initials(u.name)}</div>
      <div><h3 style="margin-bottom:2px;">${u.name}</h3><p class="field-hint" style="margin:0;">${u.title || u.role} · ${u.employeeId}</p></div>
    </div>
    <div class="profile-fields">
      <div class="pf-item"><div class="pf-label">Department</div><div class="pf-value">${u.department}</div></div>
      <div class="pf-item"><div class="pf-label">Team</div><div class="pf-value">${u.team || '—'}</div></div>
      <div class="pf-item"><div class="pf-label">Email</div><div class="pf-value">${u.email}</div></div>
      <div class="pf-item"><div class="pf-label">Phone</div><div class="pf-value">${u.phone || '—'}</div></div>
      <div class="pf-item"><div class="pf-label">Reporting Manager</div><div class="pf-value">${name(u.manager)}</div></div>
      <div class="pf-item"><div class="pf-label">Joined</div><div class="pf-value">${u.joined}</div></div>
    </div>
  `;
}
function name(id) { const u = empDb().users.find(x => x.employeeId === id); return u ? u.name : '—'; }

function renderTeam() {
  const u = me();
  const teammates = empDb().users.filter(x => x.team === u.team && x.employeeId !== u.employeeId);
  document.getElementById('empTeamTable').innerHTML = `
    <tr><th>Name</th><th>Title / Role</th><th>Status</th></tr>
    ${teammates.map(t => `<tr><td>${t.name}</td><td>${t.title || t.role}</td><td><span class="badge ${statusBadge(t.status)}">${t.status}</span></td></tr>`).join('') || `<tr><td class="empty-state" colspan="3">You're the only member currently listed on this team.</td></tr>`}
  `;
}

function renderProjects() {
  const projects = SavoAPI.getProjectsForEmployee(CURRENT_EMP_ID);
  document.getElementById('empProjects').innerHTML = projects.map(p => `
    <div class="mgr-project-block" style="border:1px solid var(--line);border-radius:var(--radius-lg);padding:20px;margin-bottom:16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <h4 style="margin:0;">${p.name}</h4><span class="badge ${statusBadge(p.status)}">${p.status}</span>
      </div>
      <p style="margin:0;">${p.client} · Manager: ${name(p.manager)}</p>
      <div class="progress-track" style="margin-top:10px;"><div class="progress-fill" style="width:${p.progress}%;"></div></div>
    </div>
  `).join('') || '<p class="field-hint">You are not currently assigned to any project.</p>';
}

function renderTasks() {
  const tasks = SavoAPI.getTasksForEmployee(CURRENT_EMP_ID);
  const d = empDb();
  document.getElementById('empTasksTable').innerHTML = `
    <tr><th>Task</th><th>Project</th><th>Priority</th><th>Due</th><th>Status</th></tr>
    ${tasks.map(t => {
      const proj = d.projects.find(p => p.id === t.projectId);
      return `
        <tr><td>${t.title}</td><td>${proj ? proj.name : t.projectId}</td>
        <td><span class="badge ${statusBadge(t.priority)}">${t.priority}</span></td>
        <td>${t.dueDate || '—'}</td>
        <td><select onchange="empUpdateTask('${t.id}', this.value)">
          ${['TODO','IN_PROGRESS','REVIEW','TESTING','DONE','BLOCKED'].map(s => `<option ${s===t.status?'selected':''}>${s}</option>`).join('')}
        </select></td></tr>
      `;
    }).join('') || `<tr><td class="empty-state" colspan="5">No tasks assigned to you right now.</td></tr>`}
  `;
}
function empUpdateTask(id, status) {
  SavoAPI.updateTaskStatus(id, status, CURRENT_EMP_ID);
  renderTasks();
  showToast('Task status updated.', 'success');
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
