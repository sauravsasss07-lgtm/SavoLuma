/* ==========================================================================
   SavoLuma — manager-dashboard.js
   Team, projects, and tasks load from the REST API. Attendance has no
   backend controller yet and stays on the local demo store.
   ========================================================================== */

let CURRENT_MANAGER_ID = null;
let mgrProjectsCache = [];
let mgrTeamCache = [];
let mgrTasksCache = [];

document.addEventListener('DOMContentLoaded', async () => {
  const session = SavoAuth.guard('MANAGER', 'manager-login.html');
  if (!session) return;
  initDashboardShell(session);
  CURRENT_MANAGER_ID = session.employeeId;
  wireAssignTask();
  await refreshManagerData();
});

async function refreshManagerData() {
  try {
    mgrProjectsCache = await SavoAPI.getMyProjects();
    mgrTeamCache = await SavoAPI.getDirectReports(CURRENT_MANAGER_ID);
    mgrTasksCache = await SavoAPI.getTasksByManager();
    renderWorkspace();
    renderTeam();
    renderProjectsDetail();
    renderKanban();
    renderAttendance();
    fillAssignSelects();
  } catch (err) {
    showApiError(err, 'Could not load manager workspace.');
  }
}

function renderWorkspace() {
  const projects = mgrProjectsCache;
  const team = mgrTeamCache;
  const tasks = mgrTasksCache;
  document.getElementById('mgrStatRow').innerHTML = [
    { label: 'My Projects', value: projects.length },
    { label: 'Team Members', value: team.length },
    { label: 'Open Tasks', value: tasks.filter(t => t.status !== 'DONE').length },
    { label: 'Tasks Due', value: tasks.filter(t => t.status !== 'DONE' && t.dueDate).length }
  ].map(s => `<div class="stat-card"><div class="stat-label">${s.label}</div><div class="stat-value">${s.value}</div></div>`).join('');

  document.getElementById('mgrProjectsOverviewTable').innerHTML = `
    <tr><th>Project</th><th>Code</th><th>Status</th><th>Progress</th></tr>
    ${projects.map(p => `
      <tr><td>${p.name}</td><td>${p.projectCode || '—'}</td><td><span class="badge ${statusBadge(p.status)}">${p.status}</span></td>
      <td><div class="progress-track" style="width:120px;"><div class="progress-fill" style="width:${p.progress}%;"></div></div></td></tr>
    `).join('') || `<tr><td class="empty-state" colspan="4">No projects assigned to you yet.</td></tr>`}
  `;
}

function renderTeam() {
  const team = mgrTeamCache;
  document.getElementById('mgrTeamTable').innerHTML = `
    <tr><th>ID</th><th>Name</th><th>Title</th><th>Team</th><th>Status</th></tr>
    ${team.map(u => `<tr><td>${u.employeeId}</td><td>${u.name}</td><td>${u.title || u.role}</td><td>${u.team || '—'}</td><td><span class="badge ${statusBadge(u.status)}">${u.status}</span></td></tr>`).join('') || `<tr><td class="empty-state" colspan="5">No team members assigned yet.</td></tr>`}
  `;
}

function renderProjectsDetail() {
  document.getElementById('mgrProjectsDetail').innerHTML = mgrProjectsCache.map(p => `
    <div class="mgr-project-block">
      <div class="mp-head"><h4 style="margin:0;">${p.name}</h4><span class="badge ${statusBadge(p.status)}">${p.status}</span></div>
      <p style="margin:0;">${p.projectCode || ''} · ${p.startDate || '—'} → ${p.endDate || '—'}</p>
      <div class="progress-track" style="margin-top:10px;"><div class="progress-fill" style="width:${p.progress}%;"></div></div>
    </div>
  `).join('') || '<p class="field-hint">No projects assigned to you yet.</p>';
}

function renderKanban() {
  const tasks = mgrTasksCache;
  const statuses = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
  document.getElementById('kanbanRow').innerHTML = statuses.map(s => `
    <div class="kanban-col">
      <h4>${s.replace('_',' ')} <span class="badge badge-grey">${tasks.filter(t => t.status === s).length}</span></h4>
      ${tasks.filter(t => t.status === s).map(t => `
          <div class="kanban-card">
            <strong>${t.title}</strong>
            <div class="k-meta"><span>${t.assignedToName || t.assignedTo || '—'}</span><span class="badge ${statusBadge(t.priority)}">${t.priority}</span></div>
            <select style="width:100%;margin-top:8px;" onchange="mgrUpdateTaskStatus('${t.id}', this.value)">
              ${statuses.map(st => `<option ${st===t.status?'selected':''}>${st}</option>`).join('')}
              <option ${t.status==='BLOCKED'?'selected':''}>BLOCKED</option>
            </select>
          </div>
        `).join('')}
    </div>
  `).join('');
}

async function mgrUpdateTaskStatus(id, status) {
  try {
    await SavoAPI.updateTaskStatus(id, status);
    showToast('Task status updated.', 'success');
    await refreshManagerData();
  } catch (err) { showApiError(err); }
}

function renderAttendance() {
  const team = mgrTeamCache;
  const records = SavoAPI.getAttendanceForTeam(team.map(t => t.employeeId));
  document.getElementById('mgrAttendanceTable').innerHTML = `
    <tr><th>Employee</th><th>Date</th><th>Minutes Worked</th><th>Status</th></tr>
    ${records.map(r => {
      const emp = team.find(t => t.employeeId === r.employeeId);
      return `<tr><td>${emp ? emp.name : r.employeeId}</td><td>${r.date}</td><td>${r.minutesWorked}</td><td><span class="badge ${statusBadge(r.status)}">${r.status}</span></td></tr>`;
    }).join('') || `<tr><td class="empty-state" colspan="4">No attendance records for your team yet.</td></tr>`}
  `;
}

function fillAssignSelects() {
  const projSelect = document.getElementById('atProject');
  const empSelect = document.getElementById('atEmployee');
  if (!projSelect || !empSelect) return;
  projSelect.innerHTML = mgrProjectsCache.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
  empSelect.innerHTML = mgrTeamCache.map(u => `<option value="${u.employeeId}">${u.name}</option>`).join('');
}

function wireAssignTask() {
  document.getElementById('assignTaskForm').addEventListener('submit', async e => {
    e.preventDefault();
    try {
      await SavoAPI.createTask({
        projectId: document.getElementById('atProject').value,
        title: document.getElementById('atTitle').value.trim(),
        assignedTo: document.getElementById('atEmployee').value,
        priority: document.getElementById('atPriority').value,
        dueDate: document.getElementById('atDue').value
      });
      document.getElementById('assignTaskModal').classList.remove('open');
      e.target.reset();
      showToast('Task assigned.', 'success');
      await refreshManagerData();
    } catch (err) { showApiError(err, 'Could not assign task.'); }
  });
}
