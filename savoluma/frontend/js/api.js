/* ==========================================================================
   SavoLuma — api.js
   FUTURE REAL BACKEND ADAPTER.
   Every dashboard script (admin.js, hr.js, manager.js, employee.js, ceo.js)
   should eventually call functions from THIS file instead of touching
   SavoDB directly. Right now each function reads/writes the local demo
   database; each one has the real endpoint it will call once the Spring
   Boot backend is live, so switching over is a localized change here only.

   Base URL and headers you will use once the backend exists:
   ---------------------------------------------------------
   const BASE_URL = 'http://localhost:8080/api/v1';
   function authHeaders() {
     const session = SavoAuth.getSession();
     return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.token}` };
   }
   ========================================================================== */

const SavoAPI = (() => {

  // POST /api/v1/auth/login
  function login(username, password, role) {
    return SavoAuth.login(username, password, role);
  }

  // GET /api/v1/users?role=EMPLOYEE
  function getEmployees() {
    return SavoDB.load().users;
  }

  // GET /api/v1/users/{id}
  function getEmployeeById(id) {
    return SavoDB.load().users.find(u => u.employeeId === id) || null;
  }

  // POST /api/v1/users
  function createEmployee(employee) {
    const db = SavoDB.load();
    const nextNum = db.users.length + 1;
    employee.employeeId = 'SL-' + String(1000 + nextNum).slice(1);
    employee.status = 'ACTIVE';
    employee.joined = new Date().toISOString().slice(0, 10);
    db.users.push(employee);
    logAudit(db, `Created employee ${employee.employeeId} (${employee.name})`);
    SavoDB.save(db);
    return employee;
  }

  // PUT /api/v1/users/{id}
  function updateEmployee(id, changes) {
    const db = SavoDB.load();
    const idx = db.users.findIndex(u => u.employeeId === id);
    if (idx === -1) return null;
    db.users[idx] = { ...db.users[idx], ...changes };
    logAudit(db, `Updated employee ${id}`);
    SavoDB.save(db);
    return db.users[idx];
  }

  // DELETE /api/v1/users/{id}  (soft delete: block access, keep record)
  function blockEmployee(id) {
    return updateEmployee(id, { status: 'BLOCKED' });
  }
  function unblockEmployee(id) {
    return updateEmployee(id, { status: 'ACTIVE' });
  }
  function removeEmployee(id) {
    const db = SavoDB.load();
    db.users = db.users.filter(u => u.employeeId !== id);
    logAudit(db, `Removed employee ${id} from the system`);
    SavoDB.save(db);
  }

  // GET /api/v1/projects
  function getProjects() { return SavoDB.load().projects; }
  function getProjectsByManager(managerId) {
    return SavoDB.load().projects.filter(p => p.manager === managerId);
  }
  function getProjectsForEmployee(employeeId) {
    return SavoDB.load().projects.filter(p => p.team.includes(employeeId));
  }

  // POST /api/v1/projects
  function createProject(project) {
    const db = SavoDB.load();
    project.id = 'PRJ-' + (100 + db.projects.length + 1);
    project.progress = 0;
    project.status = 'PLANNING';
    db.projects.push(project);
    logAudit(db, `Created project ${project.id} (${project.name})`);
    SavoDB.save(db);
    return project;
  }
  function updateProject(id, changes) {
    const db = SavoDB.load();
    const idx = db.projects.findIndex(p => p.id === id);
    if (idx === -1) return null;
    db.projects[idx] = { ...db.projects[idx], ...changes };
    SavoDB.save(db);
    return db.projects[idx];
  }

  // GET /api/v1/tasks?assignedTo={id}
  function getTasksForEmployee(employeeId) {
    return SavoDB.load().tasks.filter(t => t.assignedTo === employeeId);
  }
  function getTasksByManager(managerId) {
    const db = SavoDB.load();
    const managedProjectIds = db.projects.filter(p => p.manager === managerId).map(p => p.id);
    return db.tasks.filter(t => managedProjectIds.includes(t.projectId));
  }
  function getAllTasks() { return SavoDB.load().tasks; }

  // POST /api/v1/tasks
  function createTask(task) {
    const db = SavoDB.load();
    task.id = 'TSK-' + (1000 + db.tasks.length + 1);
    task.status = task.status || 'TODO';
    db.tasks.push(task);
    logAudit(db, `Assigned task ${task.id} to ${task.assignedTo}`);
    SavoDB.save(db);
    return task;
  }
  // PUT /api/v1/tasks/{id}
  function updateTaskStatus(id, status, actorId) {
    const db = SavoDB.load();
    const idx = db.tasks.findIndex(t => t.id === id);
    if (idx === -1) return null;
    db.tasks[idx].status = status;
    logAudit(db, `${actorId} updated task ${id} to ${status}`);
    SavoDB.save(db);
    return db.tasks[idx];
  }

  // GET /api/v1/attendance?employeeId={id}
  function getAttendanceForTeam(employeeIds) {
    return SavoDB.load().attendance.filter(a => employeeIds.includes(a.employeeId));
  }

  // CRM: GET/POST /api/v1/leads
  function getLeads() { return SavoDB.load().leads; }
  function createLead(lead) {
    const db = SavoDB.load();
    lead.id = 'LEAD-' + (db.leads.length + 1);
    lead.status = 'NEW';
    db.leads.push(lead);
    SavoDB.save(db);
    return lead;
  }
  function updateLeadStatus(id, status) {
    const db = SavoDB.load();
    const idx = db.leads.findIndex(l => l.id === id);
    if (idx === -1) return null;
    db.leads[idx].status = status;
    SavoDB.save(db);
    return db.leads[idx];
  }

  // Support: GET/POST /api/v1/tickets
  function getTickets() { return SavoDB.load().tickets; }
  function updateTicketStatus(id, status) {
    const db = SavoDB.load();
    const idx = db.tickets.findIndex(t => t.id === id);
    if (idx === -1) return null;
    db.tickets[idx].status = status;
    SavoDB.save(db);
    return db.tickets[idx];
  }

  // GET /api/v1/audit-logs
  function getAuditLogs() { return SavoDB.load().auditLogs; }
  function logAudit(db, description) {
    db.auditLogs.unshift({ time: new Date().toISOString().slice(0, 16).replace('T', ' '), user: (SavoAuth.getSession() || {}).username || 'system', action: description });
  }

  // Public forms
  // POST /api/v1/consultations, /api/v1/quotes, /api/v1/contact, /api/v1/careers/apply
  function submitContact(message) {
    const db = SavoDB.load();
    db.contactMessages.push({ ...message, receivedAt: new Date().toISOString() });
    SavoDB.save(db);
  }
  function submitConsultation(payload) {
    const db = SavoDB.load();
    db.consultations.push({ ...payload, status: 'PENDING', receivedAt: new Date().toISOString() });
    SavoDB.save(db);
  }
  function submitQuote(payload) {
    const db = SavoDB.load();
    db.quotes.push({ ...payload, status: 'SUBMITTED', receivedAt: new Date().toISOString() });
    SavoDB.save(db);
  }
  function submitJobApplication(payload) {
    const db = SavoDB.load();
    db.applications.push({ ...payload, status: 'RECEIVED', appliedAt: new Date().toISOString() });
    SavoDB.save(db);
  }

  // Leave requests: POST /api/v1/leave, GET /api/v1/leave?employeeId={id}
  function submitLeaveRequest(payload) {
    const db = SavoDB.load();
    payload.id = 'LV-' + (db.leaveRequests.length + 1);
    payload.status = 'PENDING';
    payload.submittedAt = new Date().toISOString();
    db.leaveRequests.push(payload);
    SavoDB.save(db);
    return payload;
  }
  function getLeaveRequestsForEmployee(employeeId) {
    return SavoDB.load().leaveRequests.filter(l => l.employeeId === employeeId);
  }

  // Roles & permissions (SUPER ADMIN / ADMIN configurable)
  function getRoles() { return SavoDB.load().roles; }
  function updateRolePermissions(roleId, permissions) {
    const db = SavoDB.load();
    const idx = db.roles.findIndex(r => r.id === roleId);
    if (idx === -1) return null;
    db.roles[idx].permissions = permissions;
    logAudit(db, `Updated permissions for role ${roleId}`);
    SavoDB.save(db);
    return db.roles[idx];
  }

  return {
    login, getEmployees, getEmployeeById, createEmployee, updateEmployee, blockEmployee, unblockEmployee, removeEmployee,
    getProjects, getProjectsByManager, getProjectsForEmployee, createProject, updateProject,
    getTasksForEmployee, getTasksByManager, getAllTasks, createTask, updateTaskStatus,
    getAttendanceForTeam, getLeads, createLead, updateLeadStatus, getTickets, updateTicketStatus,
    getAuditLogs, submitContact, submitConsultation, submitQuote, submitJobApplication,
    getRoles, updateRolePermissions, submitLeaveRequest, getLeaveRequestsForEmployee
  };
})();
