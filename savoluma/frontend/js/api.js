/* ==========================================================================
   SavoLuma — api.js
   Central REST client for the Spring Boot API at /api/v1.
   Auth, users, projects, and tasks talk to the backend.
   Modules without a controller yet (leads, tickets, leave, jobs, …)
   still use the local demo store so those screens keep working.
   ========================================================================== */

const SavoAPI = (() => {
  const BASE_URL = (typeof window !== 'undefined' && window.SAVOLUMA_API_BASE)
    ? window.SAVOLUMA_API_BASE
    : 'http://localhost:8080/api/v1';

  function authHeaders(includeJson) {
    const headers = {};
    if (includeJson !== false) headers['Content-Type'] = 'application/json';
    const session = SavoAuth.getSession();
    if (session && session.token) headers['Authorization'] = 'Bearer ' + session.token;
    return headers;
  }

  function isAuthPage() {
    const path = (window.location.pathname || '').toLowerCase();
    return /(?:^|\/)(?:[a-z-]+-)?login\.html$/.test(path)
      || path.endsWith('/portal/index.html')
      || path.endsWith('/portal/register.html');
  }

  function loginPageForRole(role) {
    const map = {
      ADMIN: 'admin-login.html',
      CEO: 'ceo-login.html',
      HR: 'hr-login.html',
      MANAGER: 'manager-login.html',
      EMPLOYEE: 'employee-login.html',
      SUPER_ADMIN: 'admin-login.html'
    };
    return map[role] || 'index.html';
  }

  function handleUnauthorized() {
    const role = (SavoAuth.getSession() || {}).role;
    SavoAuth.clearSession();
    if (!isAuthPage()) {
      window.location.href = loginPageForRole(role);
    }
  }

  async function parseBody(res) {
    const text = await res.text();
    if (!text) return null;
    try { return JSON.parse(text); } catch (_) { return { message: text }; }
  }

  async function request(path, options = {}) {
    const opts = {
      method: options.method || 'GET',
      headers: { ...authHeaders(options.body !== undefined), ...(options.headers || {}) },
      credentials: 'omit'
    };
    if (options.body !== undefined && options.body !== null) {
      opts.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
    }

    let res;
    try {
      res = await fetch(BASE_URL + path, opts);
    } catch (err) {
      const error = new Error('Cannot reach the SavoLuma API. Confirm the backend is running on ' + BASE_URL + '.');
      error.status = 0;
      throw error;
    }

    if (res.status === 401) {
      if (!options.skipAuthRedirect) handleUnauthorized();
      const error = new Error('Your session has expired. Please sign in again.');
      error.status = 401;
      throw error;
    }
    if (res.status === 403) {
      const body = await parseBody(res);
      const error = new Error((body && body.message) || 'You do not have permission to do that.');
      error.status = 403;
      throw error;
    }
    if (res.status === 204) return null;
    const body = await parseBody(res);
    if (!res.ok) {
      const message = (body && (body.message || (body.fieldErrors && Object.values(body.fieldErrors)[0]))) || 'Request failed.';
      const error = new Error(message);
      error.status = res.status;
      error.body = body;
      throw error;
    }
    return body;
  }

  function mapUser(dto) {
    if (!dto) return null;
    return {
      id: dto.id,
      employeeId: dto.employeeId,
      username: dto.username,
      name: dto.fullName,
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      role: dto.role,
      department: dto.department,
      team: dto.team,
      manager: dto.managerId,
      managerId: dto.managerId,
      title: dto.title,
      status: dto.status,
      photo: dto.photoUrl,
      photoUrl: dto.photoUrl
    };
  }

  function mapProject(dto) {
    if (!dto) return null;
    return {
      id: dto.id,
      projectCode: dto.projectCode,
      name: dto.name,
      client: dto.clientId != null ? String(dto.clientId) : '—',
      manager: dto.managerId,
      managerName: dto.managerName,
      team: [],
      status: dto.status,
      priority: dto.priority,
      progress: dto.progress != null ? dto.progress : 0,
      startDate: dto.startDate || '',
      endDate: dto.endDate || '',
      stack: dto.techStack ? String(dto.techStack).split(',').map(s => s.trim()).filter(Boolean) : [],
      milestones: []
    };
  }

  function mapTask(dto) {
    if (!dto) return null;
    return {
      id: dto.id,
      taskCode: dto.taskCode,
      projectId: dto.projectId,
      projectName: dto.projectName,
      title: dto.title,
      assignedTo: dto.assignedToId,
      assignedToName: dto.assignedToName,
      priority: dto.priority,
      status: dto.status,
      dueDate: dto.dueDate || ''
    };
  }

  async function login(username, password) {
    return request('/auth/login', {
      method: 'POST',
      body: { username, password },
      skipAuthRedirect: true,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  async function verifyTwoFactor(username, challengeId, code) {
    return request('/auth/verify-2fa', {
      method: 'POST',
      body: { username, challengeId, code },
      skipAuthRedirect: true,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  async function getMe() {
    return mapUser(await request('/auth/me'));
  }

  async function logout() {
    try {
      const session = SavoAuth.getSession();
      if (session && session.token) {
        await request('/auth/logout', { method: 'POST', skipAuthRedirect: true });
      }
    } catch (_) {
      /* client still clears the session */
    }
    SavoAuth.clearSession();
  }

  async function getEmployees() {
    const list = await request('/users');
    return Array.isArray(list) ? list.map(mapUser) : [];
  }

  async function getEmployeeById(id) {
    return mapUser(await request('/users/' + encodeURIComponent(id)));
  }

  async function getDirectReports(employeeId) {
    const list = await request('/users/' + encodeURIComponent(employeeId) + '/direct-reports');
    return Array.isArray(list) ? list.map(mapUser) : [];
  }

  async function createEmployee(employee) {
    const created = await request('/users', {
      method: 'POST',
      body: {
        fullName: employee.fullName || employee.name,
        email: employee.email,
        phone: employee.phone || null,
        role: employee.role,
        department: employee.department || null,
        team: employee.team || null,
        managerId: employee.managerId || employee.manager || null,
        username: employee.username,
        temporaryPassword: employee.temporaryPassword || employee.password
      }
    });
    return mapUser(created);
  }

  async function updateEmployee(id, changes) {
    const body = {};
    if (changes.fullName != null || changes.name != null) body.fullName = changes.fullName || changes.name;
    if (changes.email != null) body.email = changes.email;
    if (changes.phone != null) body.phone = changes.phone;
    if (changes.department != null) body.department = changes.department;
    if (changes.team != null) body.team = changes.team;
    if (changes.title != null) body.title = changes.title;
    if (changes.managerId != null || changes.manager != null) body.managerId = changes.managerId || changes.manager;
    return mapUser(await request('/users/' + encodeURIComponent(id), { method: 'PUT', body }));
  }

  async function blockEmployee(id) {
    return mapUser(await request('/users/' + encodeURIComponent(id) + '/status', {
      method: 'PATCH',
      body: { status: 'BLOCKED' }
    }));
  }

  async function unblockEmployee(id) {
    return mapUser(await request('/users/' + encodeURIComponent(id) + '/status', {
      method: 'PATCH',
      body: { status: 'ACTIVE' }
    }));
  }

  async function removeEmployee(id) {
    await request('/users/' + encodeURIComponent(id), { method: 'DELETE' });
  }

  async function getProjects() {
    const list = await request('/projects');
    return Array.isArray(list) ? list.map(mapProject) : [];
  }

  async function getMyProjects() {
    const list = await request('/projects/my');
    return Array.isArray(list) ? list.map(mapProject) : [];
  }

  function getProjectsByManager() { return getMyProjects(); }
  function getProjectsForEmployee() { return getMyProjects(); }

  async function createProject(project) {
    return mapProject(await request('/projects', {
      method: 'POST',
      body: {
        name: project.name,
        managerId: project.managerId || project.manager || null
      }
    }));
  }

  async function updateProject(id, changes) {
    return mapProject(await request('/projects/' + encodeURIComponent(id), { method: 'PUT', body: changes }));
  }

  async function getTasksForEmployee() {
    const list = await request('/tasks/my');
    return Array.isArray(list) ? list.map(mapTask) : [];
  }

  async function getTasksByManager() {
    const list = await request('/tasks/managed');
    return Array.isArray(list) ? list.map(mapTask) : [];
  }

  async function createTask(task) {
    const body = {
      projectId: String(task.projectId),
      title: task.title,
      assignedTo: task.assignedTo,
      priority: task.priority || 'MEDIUM'
    };
    if (task.dueDate) body.dueDate = task.dueDate;
    return mapTask(await request('/tasks', { method: 'POST', body }));
  }

  async function updateTaskStatus(id, status) {
    return mapTask(await request('/tasks/' + encodeURIComponent(id) + '/status', {
      method: 'PATCH',
      body: { status }
    }));
  }

  /* ----- local demo adapters (no backend controller yet) ----- */

  function getAttendanceForTeam(employeeIds) {
    return SavoDB.load().attendance.filter(a => employeeIds.includes(a.employeeId));
  }
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
  function getTickets() { return SavoDB.load().tickets; }
  function updateTicketStatus(id, status) {
    const db = SavoDB.load();
    const idx = db.tickets.findIndex(t => t.id === id);
    if (idx === -1) return null;
    db.tickets[idx].status = status;
    SavoDB.save(db);
    return db.tickets[idx];
  }
  function getAuditLogs() { return SavoDB.load().auditLogs; }
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
  function getRoles() { return SavoDB.load().roles; }
  function updateRolePermissions(roleId, permissions) {
    const db = SavoDB.load();
    const idx = db.roles.findIndex(r => r.id === roleId);
    if (idx === -1) return null;
    db.roles[idx].permissions = permissions;
    db.auditLogs.unshift({
      time: new Date().toISOString().slice(0, 16).replace('T', ' '),
      user: (SavoAuth.getSession() || {}).username || 'system',
      action: 'Updated permissions for role ' + roleId
    });
    SavoDB.save(db);
    return db.roles[idx];
  }

  return {
    BASE_URL, request,
    login, verifyTwoFactor, getMe, logout,
    getEmployees, getEmployeeById, getDirectReports, createEmployee, updateEmployee, blockEmployee, unblockEmployee, removeEmployee,
    getProjects, getMyProjects, getProjectsByManager, getProjectsForEmployee, createProject, updateProject,
    getTasksForEmployee, getTasksByManager, createTask, updateTaskStatus,
    getAttendanceForTeam, getLeads, createLead, updateLeadStatus, getTickets, updateTicketStatus,
    getAuditLogs, submitContact, submitConsultation, submitQuote, submitJobApplication,
    getRoles, updateRolePermissions, submitLeaveRequest, getLeaveRequestsForEmployee
  };
})();
