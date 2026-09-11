/* ==========================================================================
   SavoLuma — ceo-dashboard.js
   People and projects come from the API. Sales/support without controllers
   still read the local demo store. Finance remains unconnected.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  const session = SavoAuth.guard('CEO', 'ceo-login.html');
  if (!session) return;
  initDashboardShell(session);

  const d = SavoDB.load();
  let users = [];
  let projects = [];
  try {
    users = await SavoAPI.getEmployees();
    projects = await SavoAPI.getProjects();
  } catch (err) {
    showApiError(err, 'Could not load company directory.');
  }

  document.getElementById('statRow').innerHTML = [
    { label: 'Total Employees', value: users.length },
    { label: 'Total Projects', value: projects.length },
    { label: 'Total Clients', value: d.clients.length },
    { label: 'Open Tickets', value: d.tickets.filter(t => !['RESOLVED','CLOSED'].includes(t.status)).length }
  ].map(s => `<div class="stat-card"><div class="stat-label">${s.label}</div><div class="stat-value">${s.value}</div></div>`).join('');

  const teams = [...new Set(users.map(u => u.team).filter(Boolean))];
  document.getElementById('orgGrid').innerHTML = teams.map(t => {
    const members = users.filter(u => u.team === t);
    return `<div class="org-tile"><div class="org-count">${members.length}</div><div class="org-label">${t}</div></div>`;
  }).join('') + `<div class="org-tile"><div class="org-count">${users.filter(u => u.role === 'MANAGER').length}</div><div class="org-label">Managers</div></div>`;

  document.getElementById('ceoProjectsTable').innerHTML = `
    <tr><th>Project</th><th>Code</th><th>Manager</th><th>Status</th><th>Progress</th><th>Timeline</th></tr>
    ${projects.map(p => `
      <tr><td>${p.name}</td><td>${p.projectCode || '—'}</td><td>${p.managerName || name(users, p.manager)}</td>
      <td><span class="badge ${statusBadge(p.status)}">${p.status}</span></td>
      <td><div class="progress-track" style="width:110px;"><div class="progress-fill" style="width:${p.progress}%;"></div></div></td>
      <td style="font-size:0.82rem;color:var(--ink-soft);">${p.startDate || '—'} → ${p.endDate || '—'}</td></tr>
    `).join('') || '<tr><td class="empty-state" colspan="6">No projects returned from the API.</td></tr>'}
  `;

  document.getElementById('ceoPeopleTable').innerHTML = `
    <tr><th>ID</th><th>Name</th><th>Role</th><th>Team</th><th>Manager</th><th>Status</th></tr>
    ${users.map(u => `
      <tr><td>${u.employeeId}</td><td>${u.name}</td><td><span class="badge badge-blue">${u.role}</span></td>
      <td>${u.team || '—'}</td><td>${name(users, u.manager)}</td>
      <td><span class="badge ${statusBadge(u.status)}">${u.status}</span></td></tr>
    `).join('') || '<tr><td class="empty-state" colspan="6">No employees returned from the API.</td></tr>'}
  `;

  document.getElementById('ceoLeadsTable').innerHTML = `
    <tr><th>Lead</th><th>Company</th><th>Source</th><th>Status</th></tr>
    ${d.leads.map(l => `<tr><td>${l.name}</td><td>${l.company}</td><td>${l.source}</td><td><span class="badge ${statusBadge(l.status)}">${l.status}</span></td></tr>`).join('')}
  `;

  document.getElementById('ceoActiveContracts').textContent = projects.filter(p => p.status !== 'COMPLETED').length;

  document.getElementById('ceoTicketsTable').innerHTML = `
    <tr><th>Ticket</th><th>Client</th><th>Subject</th><th>Priority</th><th>Status</th></tr>
    ${d.tickets.map(t => `<tr><td>${t.id}</td><td>${t.client}</td><td>${t.subject}</td><td><span class="badge ${statusBadge(t.priority)}">${t.priority}</span></td><td><span class="badge ${statusBadge(t.status)}">${t.status}</span></td></tr>`).join('')}
  `;
});

function name(users, id) { const u = users.find(emp => emp.employeeId === id); return u ? u.name : '—'; }
