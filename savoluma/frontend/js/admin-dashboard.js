/* ==========================================================================
   SavoLuma — admin-dashboard.js
   Admin has the broadest business-operations access (see spec section 26):
   users, clients, employees, leads, CRM, projects, support, services,
   portfolio, careers, blog, reports, notifications — but NOT unrestricted
   system-level security (that is SUPER_ADMIN territory, represented here
   by the System Settings panel being visible but 2FA/session policy only).
   ========================================================================== */

const ALL_PERMISSIONS = ['USER_VIEW','USER_CREATE','USER_UPDATE','USER_DELETE','PROJECT_VIEW','PROJECT_CREATE','PROJECT_UPDATE','TASK_VIEW','TASK_ASSIGN','LEAD_VIEW','LEAD_UPDATE','TICKET_VIEW','TICKET_UPDATE','FINANCE_VIEW','REPORT_VIEW','TEAM_VIEW','EMPLOYEE_VIEW','EMPLOYEE_CREATE','JOB_MANAGE','SELF_VIEW'];

document.addEventListener('DOMContentLoaded', () => {
  const session = SavoAuth.guard('ADMIN', 'admin-login.html');
  if (!session) return;
  initDashboardShell(session);

  renderOverview();
  renderEmployees();
  renderRoles();
  renderProjects();
  renderLeads();
  renderTickets();
  renderClients();
  renderTestimonials();
  renderJobs();
  renderApplications();
  renderAudit();
  wireModals();
});

function db() { return SavoDB.load(); }

/* ---------------- Overview ---------------- */
function renderOverview() {
  const d = db();
  const stats = [
    { label: 'Total Employees', value: d.users.length, sub: `${d.users.filter(u=>u.status==='ACTIVE').length} active` },
    { label: 'Active Projects', value: d.projects.filter(p=>p.status!=='COMPLETED').length, sub: `${d.projects.length} total` },
    { label: 'Open Leads', value: d.leads.filter(l=>!['WON','LOST'].includes(l.status)).length, sub: `${d.leads.length} total leads` },
    { label: 'Open Tickets', value: d.tickets.filter(t=>t.status!=='RESOLVED' && t.status!=='CLOSED').length, sub: `${d.tickets.length} total tickets` }
  ];
  document.getElementById('statRow').innerHTML = stats.map(s => `
    <div class="stat-card"><div class="stat-label">${s.label}</div><div class="stat-value">${s.value}</div><div class="stat-sub">${s.sub}</div></div>
  `).join('');

  document.getElementById('overviewProjectsTable').innerHTML = `
    <tr><th>Project</th><th>Client</th><th>Manager</th><th>Status</th><th>Progress</th></tr>
    ${d.projects.map(p => `
      <tr><td>${p.name}</td><td>${p.client}</td><td>${employeeName(p.manager)}</td>
      <td><span class="badge ${statusBadge(p.status)}">${p.status}</span></td>
      <td><div class="progress-track" style="width:120px;"><div class="progress-fill" style="width:${p.progress}%;"></div></div></td></tr>
    `).join('')}
  `;
}

function employeeName(id) { const u = db().users.find(u => u.employeeId === id); return u ? u.name : '—'; }

/* ---------------- Employees ---------------- */
function renderEmployees() {
  const d = db();
  document.getElementById('employeesTable').innerHTML = `
    <tr><th>ID</th><th>Name</th><th>Role</th><th>Department / Team</th><th>Status</th><th>Actions</th></tr>
    ${d.users.map(u => `
      <tr>
        <td>${u.employeeId}</td>
        <td>${u.name}</td>
        <td><span class="badge badge-blue">${u.role}</span></td>
        <td>${u.department}${u.team ? ' / ' + u.team : ''}</td>
        <td><span class="badge ${statusBadge(u.status)}">${u.status}</span></td>
        <td class="table-actions">
          ${u.status === 'ACTIVE'
            ? `<button class="btn btn-outline btn-sm" onclick="blockEmp('${u.employeeId}')">Block</button>`
            : `<button class="btn btn-outline btn-sm" onclick="unblockEmp('${u.employeeId}')">Unblock</button>`}
          <button class="btn btn-danger btn-sm" onclick="removeEmp('${u.employeeId}','${u.name.replace(/'/g,"")}')">Remove</button>
        </td>
      </tr>
    `).join('')}
  `;
}
function blockEmp(id) { SavoAPI.blockEmployee(id); renderEmployees(); renderOverview(); showToast('Employee access blocked.', 'success'); }
function unblockEmp(id) { SavoAPI.unblockEmployee(id); renderEmployees(); renderOverview(); showToast('Employee access restored.', 'success'); }
function removeEmp(id, name) {
  if (!confirm(`Remove ${name} (${id}) from the system? This cannot be undone here.`)) return;
  SavoAPI.removeEmployee(id);
  renderEmployees(); renderOverview();
  showToast('Employee removed.', 'success');
}

/* ---------------- Roles & Permissions ---------------- */
function renderRoles() {
  const d = db();
  document.getElementById('rolesList').innerHTML = d.roles.map(r => `
    <div class="role-row">
      <div class="role-row-head"><strong>${r.label}</strong><span class="badge badge-grey">${r.id}</span></div>
      <div class="perm-chip-row" data-role-id="${r.id}">
        ${r.permissions.includes('*')
          ? `<span class="perm-chip on">ALL PERMISSIONS (unrestricted)</span>`
          : ALL_PERMISSIONS.map(p => `<span class="perm-chip ${r.permissions.includes(p) ? 'on' : ''}" data-perm="${p}" onclick="togglePerm('${r.id}','${p}')">${p}</span>`).join('')}
      </div>
    </div>
  `).join('');
}
function togglePerm(roleId, perm) {
  const d = db();
  const role = d.roles.find(r => r.id === roleId);
  if (!role || role.permissions.includes('*')) return; // CEO stays unrestricted
  const has = role.permissions.includes(perm);
  const updated = has ? role.permissions.filter(p => p !== perm) : [...role.permissions, perm];
  SavoAPI.updateRolePermissions(roleId, updated);
  renderRoles();
  renderAudit();
  showToast(`Updated permissions for ${roleId}.`, 'success');
}

/* ---------------- Projects ---------------- */
function renderProjects() {
  const d = db();
  document.getElementById('projectsTable').innerHTML = `
    <tr><th>ID</th><th>Name</th><th>Client</th><th>Manager</th><th>Status</th><th>Progress</th></tr>
    ${d.projects.map(p => `
      <tr><td>${p.id}</td><td>${p.name}</td><td>${p.client}</td><td>${employeeName(p.manager)}</td>
      <td><span class="badge ${statusBadge(p.status)}">${p.status}</span></td>
      <td><div class="progress-track" style="width:120px;"><div class="progress-fill" style="width:${p.progress}%;"></div></div></td></tr>
    `).join('')}
  `;
  const mgrSelect = document.getElementById('npManager');
  if (mgrSelect) mgrSelect.innerHTML = d.users.filter(u => u.role === 'MANAGER').map(m => `<option value="${m.employeeId}">${m.name}</option>`).join('');
}

/* ---------------- CRM / Leads ---------------- */
function renderLeads() {
  const d = db();
  document.getElementById('leadsTable').innerHTML = `
    <tr><th>Name</th><th>Company</th><th>Source</th><th>Status</th><th>Update</th></tr>
    ${d.leads.map(l => `
      <tr><td>${l.name}</td><td>${l.company}</td><td>${l.source}</td>
      <td><span class="badge ${statusBadge(l.status)}">${l.status}</span></td>
      <td>
        <select onchange="updateLead('${l.id}', this.value)">
          ${['NEW','CONTACTED','QUALIFIED','PROPOSAL','NEGOTIATION','WON','LOST'].map(s => `<option ${s===l.status?'selected':''}>${s}</option>`).join('')}
        </select>
      </td></tr>
    `).join('')}
  `;
}
function updateLead(id, status) { SavoAPI.updateLeadStatus(id, status); renderOverview(); showToast('Lead status updated.', 'success'); }

/* ---------------- Support ---------------- */
function renderTickets() {
  const d = db();
  document.getElementById('ticketsTable').innerHTML = `
    <tr><th>Ticket</th><th>Client</th><th>Subject</th><th>Priority</th><th>Status</th></tr>
    ${d.tickets.map(t => `
      <tr><td>${t.id}</td><td>${t.client}</td><td>${t.subject}</td>
      <td><span class="badge ${statusBadge(t.priority)}">${t.priority}</span></td>
      <td>
        <select onchange="updateTicket('${t.id}', this.value)">
          ${['OPEN','IN_PROGRESS','WAITING_FOR_CLIENT','RESOLVED','CLOSED'].map(s => `<option ${s===t.status?'selected':''}>${s}</option>`).join('')}
        </select>
      </td></tr>
    `).join('')}
  `;
}
function updateTicket(id, status) { SavoAPI.updateTicketStatus(id, status); renderOverview(); showToast('Ticket updated.', 'success'); }

/* ---------------- Clients / Testimonials ---------------- */
function renderClients() {
  const d = db();
  document.getElementById('clientsTable').innerHTML = `
    <tr><th>Client</th><th>Actions</th></tr>
    ${d.clients.map(c => `<tr><td>${c.name}</td><td><button class="btn btn-danger btn-sm" onclick="removeClient('${c.id}')">Remove</button></td></tr>`).join('')}
  `;
}
function removeClient(id) {
  const d = db(); d.clients = d.clients.filter(c => c.id !== id); SavoDB.save(d);
  renderClients(); showToast('Client removed.', 'success');
}
function renderTestimonials() {
  const d = db();
  document.getElementById('testimonialsTable').innerHTML = `
    <tr><th>Quote</th><th>Author</th><th>Actions</th></tr>
    ${d.testimonials.map((t, i) => `<tr><td>${t.quote.slice(0,60)}...</td><td>${t.author}</td><td><button class="btn btn-danger btn-sm" onclick="removeTestimonial(${i})">Remove</button></td></tr>`).join('')}
  `;
}
function removeTestimonial(i) {
  const d = db(); d.testimonials.splice(i, 1); SavoDB.save(d);
  renderTestimonials(); showToast('Testimonial removed.', 'success');
}

/* ---------------- Careers ---------------- */
function renderJobs() {
  const d = db();
  document.getElementById('jobsTable').innerHTML = `
    <tr><th>Title</th><th>Team</th><th>Location</th><th>Type</th><th>Actions</th></tr>
    ${d.jobs.map(j => `<tr><td>${j.title}</td><td>${j.team}</td><td>${j.location}</td><td>${j.type}</td><td><button class="btn btn-danger btn-sm" onclick="removeJob('${j.id}')">Remove</button></td></tr>`).join('')}
  `;
}
function removeJob(id) {
  const d = db(); d.jobs = d.jobs.filter(j => j.id !== id); SavoDB.save(d);
  renderJobs(); showToast('Job posting removed.', 'success');
}
function renderApplications() {
  const d = db();
  document.getElementById('applicationsTable').innerHTML = d.applications.length ? `
    <tr><th>Name</th><th>Role</th><th>Email</th><th>Status</th></tr>
    ${d.applications.map(a => `<tr><td>${a.name}</td><td>${a.role}</td><td>${a.email}</td><td><span class="badge badge-amber">${a.status}</span></td></tr>`).join('')}
  ` : `<tr><td class="empty-state">No applications received yet.</td></tr>`;
}

/* ---------------- Audit ---------------- */
function renderAudit() {
  const d = db();
  document.getElementById('auditTable').innerHTML = `
    <tr><th>Time</th><th>User</th><th>Action</th></tr>
    ${d.auditLogs.map(a => `<tr><td>${a.time}</td><td>${a.user}</td><td>${a.action}</td></tr>`).join('')}
  `;
}

/* ---------------- Modal forms ---------------- */
function wireModals() {
  document.getElementById('addEmployeeForm').addEventListener('submit', e => {
    e.preventDefault();
    SavoAPI.createEmployee({
      name: val('neName'), email: val('neEmail'), role: val('neRole'), department: val('neDept'),
      team: val('neTeam') || 'Unassigned', username: val('neUsername'), password: 'Welcome@123', phone: '', manager: null, photo: null
    });
    closeModals(); renderEmployees(); renderOverview(); renderAudit();
    showToast('Employee created.', 'success');
    e.target.reset();
  });

  document.getElementById('addProjectForm').addEventListener('submit', e => {
    e.preventDefault();
    SavoAPI.createProject({ name: val('npName'), client: val('npClient'), manager: val('npManager'), team: [], stack: [], startDate: new Date().toISOString().slice(0,10), endDate: '', milestones: [] });
    closeModals(); renderProjects(); renderOverview(); renderAudit();
    showToast('Project created.', 'success');
    e.target.reset();
  });

  document.getElementById('addLeadForm').addEventListener('submit', e => {
    e.preventDefault();
    SavoAPI.createLead({ name: val('nlName'), company: val('nlCompany'), email: val('nlEmail'), phone: '', source: val('nlSource'), assignedTo: SavoAuth.getSession().employeeId });
    closeModals(); renderLeads(); renderOverview();
    showToast('Lead added.', 'success');
    e.target.reset();
  });

  document.getElementById('addClientForm').addEventListener('submit', e => {
    e.preventDefault();
    const d = db();
    d.clients.push({ id: 'CLI-' + (d.clients.length + 1), name: val('ncName'), logoText: val('ncName').split(' ').slice(0,2).join(' ') });
    SavoDB.save(d);
    closeModals(); renderClients();
    showToast('Client added.', 'success');
    e.target.reset();
  });

  document.getElementById('addTestimonialForm').addEventListener('submit', e => {
    e.preventDefault();
    const d = db();
    d.testimonials.push({ quote: val('ntQuote'), author: val('ntAuthor'), title: val('ntTitle') });
    SavoDB.save(d);
    closeModals(); renderTestimonials();
    showToast('Testimonial added.', 'success');
    e.target.reset();
  });

  document.getElementById('addJobForm').addEventListener('submit', e => {
    e.preventDefault();
    const d = db();
    d.jobs.push({ id: 'JOB-' + (d.jobs.length + 1), title: val('njTitle'), team: val('njTeam'), location: val('njLocation'), type: val('njType') });
    SavoDB.save(d);
    closeModals(); renderJobs();
    showToast('Job posted.', 'success');
    e.target.reset();
  });
}
function val(id) { return document.getElementById(id).value.trim ? document.getElementById(id).value.trim() : document.getElementById(id).value; }
function closeModals() { document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open')); }
