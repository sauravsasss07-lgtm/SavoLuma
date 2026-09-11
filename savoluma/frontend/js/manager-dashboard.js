/* ==========================================================================
   SavoLuma — manager-dashboard.js
   Manager sees and manages only their own team's projects/tasks/attendance
   (spec section 21). Task assignment is the core interactive feature here.
   ========================================================================== */

let CURRENT_MANAGER_ID = null;

document.addEventListener('DOMContentLoaded', () => {
  const session = SavoAuth.guard('MANAGER', 'manager-login.html');
  if (!session) return;
  initDashboardShell(session);
  CURRENT_MANAGER_ID = session.employeeId;

  renderWorkspace();
  renderTeam();
  renderProjectsDetail();
  renderKanban();
  renderAttendance();
  wireAssignTask();
});

function mgrDb() { return SavoDB.load(); }
function myProjects() { return SavoAPI.getProjectsByManager(CURRENT_MANAGER_ID); }
function myTeam() { return mgrDb().users.filter(u => u.manager === CURRENT_MANAGER_ID); }

function renderWorkspace() {
  const projects = myProjects();
  const team = myTeam();
  const tasks = SavoAPI.getTasksByManager(CURRENT_MANAGER_ID);
  document.getElementById('mgrStatRow').innerHTML = [
    { label: 'My Projects', value: projects.length },
    { label: 'Team Members', value: team.length },
    { label: 'Open Tasks', value: tasks.filter(t => t.status !== 'DONE').length },
    { label: 'Tasks Due', value: tasks.filter(t => t.status !== 'DONE' && t.dueDate).length }
  ].map(s => `<div class="stat-card"><div class="stat-label">${s.label}</div><div class="stat-value">${s.value}</div></div>`).join('');

  document.getElementById('mgrProjectsOverviewTable').innerHTML = `
    <tr><th>Project</th><th>Client</th><th>Status</th><th>Progress</th></tr>
    ${projects.map(p => `
      <tr><td>${p.name}</td><td>${p.client}</td><td><span class="badge ${statusBadge(p.status)}">${p.status}</span></td>
      <td><div class="progress-track" style="width:120px;"><div class="progress-fill" style="width:${p.progress}%;"></div></div></td></tr>
    `).join('') || `<tr><td class="empty-state" colspan="4">No projects assigned to you yet.</td></tr>`}
  `;
}

function renderTeam() {
  const team = myTeam();
  document.getElementById('mgrTeamTable').innerHTML = `
    <tr><th>ID</th><th>Name</th><th>Title</th><th>Team</th><th>Status</th></tr>
    ${team.map(u => `<tr><td>${u.employeeId}</td><td>${u.name}</td><td>${u.title || u.role}</td><td>${u.team}</td><td><span class="badge ${statusBadge(u.status)}">${u.status}</span></td></tr>`).join('') || `<tr><td class="empty-state" colspan="5">No team members assigned yet.</td></tr>`}
  `;
}

function renderProjectsDetail() {
  const projects = myProjects();
  document.getElementById('mgrProjectsDetail').innerHTML = projects.map(p => `
    <div class="mgr-project-block">
      <div class="mp-head"><h4 style="margin:0;">${p.name}</h4><span class="badge ${statusBadge(p.status)}">${p.status}</span></div>
      <p style="margin:0;">${p.client} · ${p.startDate} → ${p.endDate}</p>
      <div class="progress-track" style="margin-top:10px;"><div class="progress-fill" style="width:${p.progress}%;"></div></div>
      <div class="milestone-row">
        ${(p.milestones || []).map(m => `<span class="milestone-pill ${m.done ? 'done' : (m.inProgress ? 'inprogress' : '')}">${m.name}${m.done ? ' ✓' : (m.inProgress ? ' (in progress)' : '')}</span>`).join('')}
      </div>
    </div>
  `).join('') || '<p class="field-hint">No projects assigned to you yet.</p>';
}

function renderKanban() {
  const tasks = SavoAPI.getTasksByManager(CURRENT_MANAGER_ID);
  const d = mgrDb();
  const statuses = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
  document.getElementById('kanbanRow').innerHTML = statuses.map(s => `
    <div class="kanban-col">
      <h4>${s.replace('_',' ')} <span class="badge badge-grey">${tasks.filter(t => t.status === s).length}</span></h4>
      ${tasks.filter(t => t.status === s).map(t => {
        const emp = d.users.find(u => u.employeeId === t.assignedTo);
        return `
          <div class="kanban-card">
            <strong>${t.title}</strong>
            <div class="k-meta"><span>${emp ? emp.name : t.assignedTo}</span><span class="badge ${statusBadge(t.priority)}">${t.priority}</span></div>
            <select style="width:100%;margin-top:8px;" onchange="mgrUpdateTaskStatus('${t.id}', this.value)">
              ${statuses.map(st => `<option ${st===t.status?'selected':''}>${st}</option>`).join('')}
              <option ${t.status==='BLOCKED'?'selected':''}>BLOCKED</option>
            </select>
          </div>
        `;
      }).join('')}
    </div>
  `).join('');
}
function mgrUpdateTaskStatus(id, status) {
  SavoAPI.updateTaskStatus(id, status, CURRENT_MANAGER_ID);
  renderKanban();
  renderWorkspace();
  showToast('Task status updated.', 'success');
}

function renderAttendance() {
  const team = myTeam();
  const records = SavoAPI.getAttendanceForTeam(team.map(t => t.employeeId));
  document.getElementById('mgrAttendanceTable').innerHTML = `
    <tr><th>Employee</th><th>Date</th><th>Minutes Worked</th><th>Status</th></tr>
    ${records.map(r => {
      const emp = team.find(t => t.employeeId === r.employeeId);
      return `<tr><td>${emp ? emp.name : r.employeeId}</td><td>${r.date}</td><td>${r.minutesWorked}</td><td><span class="badge ${statusBadge(r.status)}">${r.status}</span></td></tr>`;
    }).join('') || `<tr><td class="empty-state" colspan="4">No attendance records for your team yet.</td></tr>`}
  `;
}

function wireAssignTask() {
  const projSelect = document.getElementById('atProject');
  const empSelect = document.getElementById('atEmployee');
  projSelect.innerHTML = myProjects().map(p => `<option value="${p.id}">${p.name}</option>`).join('');
  empSelect.innerHTML = myTeam().map(u => `<option value="${u.employeeId}">${u.name}</option>`).join('');

  document.getElementById('assignTaskForm').addEventListener('submit', e => {
    e.preventDefault();
    SavoAPI.createTask({
      projectId: projSelect.value,
      title: document.getElementById('atTitle').value.trim(),
      assignedTo: empSelect.value,
      assignedBy: CURRENT_MANAGER_ID,
      priority: document.getElementById('atPriority').value,
      dueDate: document.getElementById('atDue').value
    });
    document.getElementById('assignTaskModal').classList.remove('open');
    renderKanban();
    renderWorkspace();
    showToast('Task assigned.', 'success');
    e.target.reset();
  });
}
