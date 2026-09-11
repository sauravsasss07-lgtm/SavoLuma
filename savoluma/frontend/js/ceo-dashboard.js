/* ==========================================================================
   SavoLuma — ceo-dashboard.js
   CEO role has permissions: ['*'] (see data.js roles) — full read access
   across every module. This dashboard is intentionally read-heavy: the
   CEO oversees rather than performs day-to-day CRUD.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const session = SavoAuth.guard('CEO', 'ceo-login.html');
  if (!session) return;
  initDashboardShell(session);

  const d = SavoDB.load();

  document.getElementById('statRow').innerHTML = [
    { label: 'Total Employees', value: d.users.length },
    { label: 'Total Projects', value: d.projects.length },
    { label: 'Total Clients', value: d.clients.length },
    { label: 'Open Tickets', value: d.tickets.filter(t => !['RESOLVED','CLOSED'].includes(t.status)).length }
  ].map(s => `<div class="stat-card"><div class="stat-label">${s.label}</div><div class="stat-value">${s.value}</div></div>`).join('');

  const teams = [...new Set(d.users.map(u => u.team).filter(Boolean))];
  document.getElementById('orgGrid').innerHTML = teams.map(t => {
    const members = d.users.filter(u => u.team === t);
    return `<div class="org-tile"><div class="org-count">${members.length}</div><div class="org-label">${t}</div></div>`;
  }).join('') + `<div class="org-tile"><div class="org-count">${d.users.filter(u=>u.role==='MANAGER').length}</div><div class="org-label">Managers</div></div>`;

  document.getElementById('ceoProjectsTable').innerHTML = `
    <tr><th>Project</th><th>Client</th><th>Manager</th><th>Status</th><th>Progress</th><th>Timeline</th></tr>
    ${d.projects.map(p => `
      <tr><td>${p.name}</td><td>${p.client}</td><td>${name(d, p.manager)}</td>
      <td><span class="badge ${statusBadge(p.status)}">${p.status}</span></td>
      <td><div class="progress-track" style="width:110px;"><div class="progress-fill" style="width:${p.progress}%;"></div></div></td>
      <td style="font-size:0.82rem;color:var(--ink-soft);">${p.startDate} → ${p.endDate}</td></tr>
    `).join('')}
  `;

  document.getElementById('ceoPeopleTable').innerHTML = `
    <tr><th>ID</th><th>Name</th><th>Role</th><th>Team</th><th>Manager</th><th>Status</th></tr>
    ${d.users.map(u => `
      <tr><td>${u.employeeId}</td><td>${u.name}</td><td><span class="badge badge-blue">${u.role}</span></td>
      <td>${u.team || '—'}</td><td>${name(d, u.manager)}</td>
      <td><span class="badge ${statusBadge(u.status)}">${u.status}</span></td></tr>
    `).join('')}
  `;

  document.getElementById('ceoLeadsTable').innerHTML = `
    <tr><th>Lead</th><th>Company</th><th>Source</th><th>Status</th></tr>
    ${d.leads.map(l => `<tr><td>${l.name}</td><td>${l.company}</td><td>${l.source}</td><td><span class="badge ${statusBadge(l.status)}">${l.status}</span></td></tr>`).join('')}
  `;

  document.getElementById('ceoActiveContracts').textContent = d.projects.filter(p => p.status !== 'COMPLETED').length;

  document.getElementById('ceoTicketsTable').innerHTML = `
    <tr><th>Ticket</th><th>Client</th><th>Subject</th><th>Priority</th><th>Status</th></tr>
    ${d.tickets.map(t => `<tr><td>${t.id}</td><td>${t.client}</td><td>${t.subject}</td><td><span class="badge ${statusBadge(t.priority)}">${t.priority}</span></td><td><span class="badge ${statusBadge(t.status)}">${t.status}</span></td></tr>`).join('')}
  `;
});

function name(d, id) { const u = d.users.find(u => u.employeeId === id); return u ? u.name : '—'; }
