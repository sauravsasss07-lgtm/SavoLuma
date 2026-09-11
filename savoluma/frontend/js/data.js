/* ==========================================================================
   SavoLuma — data.js
   DEMO DATA LAYER. Simulates the MySQL database in the browser using
   localStorage so every dashboard is fully clickable without a live
   backend. Every function here has a 1:1 REST endpoint named in the
   comment above it — when the Spring Boot backend is ready, replace the
   body of each function with the matching fetch() call in api.js and
   nothing in the dashboard pages needs to change.
   ========================================================================== */

const SavoDB = (() => {
  const KEY = 'savoluma_db_v1';

  function seed() {
    return {
      users: [
        { employeeId: 'SL-0001', username: 'admin', password: 'Admin@123', name: 'System Administrator', role: 'ADMIN', department: 'Administration', team: 'Platform', manager: null, status: 'ACTIVE', photo: null, email: 'admin@savoluma.com', phone: '+91-9015435450', joined: '2024-01-10' },
        { employeeId: 'SL-0002', username: 'ceo', password: 'Ceo@1234', name: 'Aarav Mehta', role: 'CEO', department: 'Executive', team: 'Leadership', manager: null, status: 'ACTIVE', photo: null, email: 'ceo@savoluma.com', phone: '+91-9015435451', joined: '2022-03-01' },
        { employeeId: 'SL-0003', username: 'hr.priya', password: 'Hr@12345', name: 'Priya Nair', role: 'HR', department: 'Human Resources', team: 'People Ops', manager: 'SL-0002', status: 'ACTIVE', photo: null, email: 'priya.nair@savoluma.com', phone: '+91-9015435452', joined: '2023-02-15' },
        { employeeId: 'SL-0004', username: 'mgr.rohan', password: 'Mgr@12345', name: 'Rohan Kapoor', role: 'MANAGER', department: 'Engineering', team: 'Alpha Squad', manager: 'SL-0002', status: 'ACTIVE', photo: null, email: 'rohan.kapoor@savoluma.com', phone: '+91-9015435453', joined: '2023-04-20' },
        { employeeId: 'SL-0005', username: 'emp.sneha', password: 'Emp@12345', name: 'Sneha Iyer', role: 'EMPLOYEE', department: 'Engineering', team: 'Alpha Squad', manager: 'SL-0004', status: 'ACTIVE', photo: null, email: 'sneha.iyer@savoluma.com', phone: '+91-9015435454', joined: '2024-05-11', title: 'Frontend Developer' },
        { employeeId: 'SL-0006', username: 'emp.arjun', password: 'Emp@12345', name: 'Arjun Verma', role: 'EMPLOYEE', department: 'Engineering', team: 'Alpha Squad', manager: 'SL-0004', status: 'ACTIVE', photo: null, email: 'arjun.verma@savoluma.com', phone: '+91-9015435455', joined: '2024-06-02', title: 'Backend Developer' },
        { employeeId: 'SL-0007', username: 'emp.kavya', password: 'Emp@12345', name: 'Kavya Reddy', role: 'EMPLOYEE', department: 'Engineering', team: 'Beta Squad', manager: 'SL-0004', status: 'ACTIVE', photo: null, email: 'kavya.reddy@savoluma.com', phone: '+91-9015435456', joined: '2024-07-19', title: 'QA Engineer' },
        { employeeId: 'SL-0008', username: 'emp.dev', password: 'Emp@12345', name: 'Devika Shah', role: 'EMPLOYEE', department: 'Engineering', team: 'Beta Squad', manager: 'SL-0004', status: 'BLOCKED', photo: null, email: 'devika.shah@savoluma.com', phone: '+91-9015435457', joined: '2023-11-08', title: 'DevOps Engineer' }
      ],
      roles: [
        { id: 'ADMIN', label: 'Administrator', permissions: ['USER_VIEW','USER_CREATE','USER_UPDATE','USER_DELETE','PROJECT_VIEW','PROJECT_CREATE','LEAD_VIEW','TICKET_VIEW','REPORT_VIEW'] },
        { id: 'CEO', label: 'Chief Executive Officer', permissions: ['*'] },
        { id: 'CFO', label: 'Chief Financial Officer', permissions: ['FINANCE_VIEW','FINANCE_UPDATE','REPORT_VIEW'] },
        { id: 'COO', label: 'Chief Operating Officer', permissions: ['PROJECT_VIEW','PROJECT_UPDATE','REPORT_VIEW'] },
        { id: 'CTO', label: 'Chief Technology Officer', permissions: ['PROJECT_VIEW','PROJECT_UPDATE','TASK_VIEW','REPORT_VIEW'] },
        { id: 'CBO', label: 'Chief Business Officer', permissions: ['LEAD_VIEW','LEAD_UPDATE','REPORT_VIEW'] },
        { id: 'DIRECTOR', label: 'Director', permissions: ['PROJECT_VIEW','PROJECT_UPDATE','TASK_ASSIGN','REPORT_VIEW'] },
        { id: 'ASST_DIRECTOR', label: 'Assistant Director', permissions: ['PROJECT_VIEW','TASK_ASSIGN'] },
        { id: 'MANAGER', label: 'Manager', permissions: ['TEAM_VIEW','TASK_CREATE','TASK_ASSIGN','TASK_UPDATE','ATTENDANCE_VIEW'] },
        { id: 'ASST_MANAGER', label: 'Assistant Manager', permissions: ['TEAM_VIEW','TASK_UPDATE'] },
        { id: 'HR', label: 'Human Resources', permissions: ['EMPLOYEE_VIEW','EMPLOYEE_CREATE','EMPLOYEE_UPDATE','JOB_MANAGE'] },
        { id: 'EMPLOYEE', label: 'Employee', permissions: ['SELF_VIEW','TASK_UPDATE_OWN'] }
      ],
      projects: [
        { id: 'PRJ-101', name: 'Hospital Management System', client: 'MedCare Group (Demo)', manager: 'SL-0004', team: ['SL-0005','SL-0006','SL-0007'], status: 'DEVELOPMENT', progress: 65, startDate: '2025-11-01', endDate: '2026-03-15', stack: ['Spring Boot','MySQL','React'], milestones: [
          { name: 'Requirement Analysis', done: true }, { name: 'UI/UX Design', done: true }, { name: 'Backend Development', done: true },
          { name: 'Frontend Development', done: true }, { name: 'Testing', done: false, inProgress: true }, { name: 'Deployment', done: false }
        ] },
        { id: 'PRJ-102', name: 'Retail Inventory Platform', client: 'BrightMart (Demo)', manager: 'SL-0004', team: ['SL-0006','SL-0008'], status: 'TESTING', progress: 82, startDate: '2025-09-10', endDate: '2026-01-20', stack: ['Spring Boot','MySQL','Vanilla JS'], milestones: [
          { name: 'Requirement Analysis', done: true }, { name: 'UI/UX Design', done: true }, { name: 'Backend Development', done: true },
          { name: 'Frontend Development', done: true }, { name: 'Testing', done: false, inProgress: true }, { name: 'Deployment', done: false }
        ] },
        { id: 'PRJ-103', name: 'AI Support Chatbot', client: 'Internal R&D', manager: 'SL-0004', team: ['SL-0005'], status: 'PLANNING', progress: 15, startDate: '2026-02-01', endDate: '2026-06-30', stack: ['Spring Boot','MySQL','AI/ML'], milestones: [
          { name: 'Requirement Analysis', done: true }, { name: 'UI/UX Design', done: false, inProgress: true }, { name: 'Backend Development', done: false },
          { name: 'Frontend Development', done: false }, { name: 'Testing', done: false }, { name: 'Deployment', done: false }
        ] }
      ],
      tasks: [
        { id: 'TSK-1001', projectId: 'PRJ-101', title: 'Fix patient intake form validation', assignedTo: 'SL-0005', assignedBy: 'SL-0004', priority: 'HIGH', status: 'IN_PROGRESS', dueDate: '2026-09-15' },
        { id: 'TSK-1002', projectId: 'PRJ-101', title: 'Build appointment REST endpoint', assignedTo: 'SL-0006', assignedBy: 'SL-0004', priority: 'HIGH', status: 'REVIEW', dueDate: '2026-09-12' },
        { id: 'TSK-1003', projectId: 'PRJ-101', title: 'Regression test billing module', assignedTo: 'SL-0007', assignedBy: 'SL-0004', priority: 'MEDIUM', status: 'TODO', dueDate: '2026-09-20' },
        { id: 'TSK-1004', projectId: 'PRJ-102', title: 'Optimize inventory search query', assignedTo: 'SL-0006', assignedBy: 'SL-0004', priority: 'MEDIUM', status: 'DONE', dueDate: '2026-09-01' },
        { id: 'TSK-1005', projectId: 'PRJ-102', title: 'Set up CI pipeline', assignedTo: 'SL-0008', assignedBy: 'SL-0004', priority: 'LOW', status: 'BLOCKED', dueDate: '2026-09-25' }
      ],
      attendance: [
        { employeeId: 'SL-0005', date: '2026-09-08', minutesWorked: 452, status: 'PRESENT' },
        { employeeId: 'SL-0006', date: '2026-09-08', minutesWorked: 470, status: 'PRESENT' },
        { employeeId: 'SL-0007', date: '2026-09-08', minutesWorked: 0, status: 'ABSENT' },
        { employeeId: 'SL-0008', date: '2026-09-08', minutesWorked: 210, status: 'HALF_DAY' }
      ],
      leads: [
        { id: 'LEAD-1', name: 'Kabir Malhotra', company: 'FinEdge Pvt Ltd', email: 'kabir@finedge.demo', phone: '+91-9000000001', source: 'WEBSITE', status: 'QUALIFIED', assignedTo: 'SL-0002' },
        { id: 'LEAD-2', name: 'Neha Bansal', company: 'UrbanCart', email: 'neha@urbancart.demo', phone: '+91-9000000002', source: 'REFERRAL', status: 'PROPOSAL', assignedTo: 'SL-0002' },
        { id: 'LEAD-3', name: 'Sameer Joshi', company: 'GreenGrid Energy', email: 'sameer@greengrid.demo', phone: '+91-9000000003', source: 'LINKEDIN', status: 'NEW', assignedTo: 'SL-0002' }
      ],
      tickets: [
        { id: 'TCK-501', client: 'MedCare Group (Demo)', subject: 'Login timeout on staging', priority: 'HIGH', status: 'OPEN' },
        { id: 'TCK-502', client: 'BrightMart (Demo)', subject: 'Export report is slow', priority: 'MEDIUM', status: 'IN_PROGRESS' }
      ],
      clients: [
        { id: 'CLI-1', name: 'MedCare Group (Demo)', logoText: 'MedCare' },
        { id: 'CLI-2', name: 'BrightMart (Demo)', logoText: 'BrightMart' },
        { id: 'CLI-3', name: 'GreenGrid Energy (Demo)', logoText: 'GreenGrid' }
      ],
      testimonials: [
        { quote: 'Placeholder testimonial — replace with a real client quote once available.', author: 'Placeholder Name', title: 'Placeholder Title, Placeholder Company' }
      ],
      jobs: [
        { id: 'JOB-1', title: 'Backend Developer (Spring Boot)', team: 'Engineering', location: 'New Delhi / Remote', type: 'Full-time' },
        { id: 'JOB-2', title: 'Frontend Developer', team: 'Engineering', location: 'New Delhi', type: 'Full-time' },
        { id: 'JOB-3', title: 'QA Engineer', team: 'Engineering', location: 'Remote', type: 'Contract' }
      ],
      applications: [],
      leaveRequests: [],
      auditLogs: [
        { time: '2026-09-08 10:12', user: 'admin', action: 'Created employee SL-0008', },
        { time: '2026-09-07 16:40', user: 'hr.priya', action: 'Updated employee record SL-0007' }
      ],
      contactMessages: [],
      consultations: [],
      quotes: [],
      blogPosts: [
        { id: 'BLG-1', title: 'Why SOA still matters for growing software teams', date: '2026-08-14', excerpt: 'A short look at how service-oriented architecture keeps rapidly growing codebases maintainable.' },
        { id: 'BLG-2', title: 'What good process consulting actually looks like', date: '2026-07-02', excerpt: 'Process consulting is not a slide deck. Here is how we run a requirement discovery engagement.' },
        { id: 'BLG-3', title: 'Securing a Spring Boot API with JWT and role-based access', date: '2026-05-20', excerpt: 'A practical breakdown of the authentication and authorization layers we build into every project.' }
      ],
      faqs: [
        { q: 'What industries does SavoLuma work with?', a: 'We work across healthcare, retail, fintech and internal enterprise tooling — the platform and process are the same regardless of industry.' },
        { q: 'Do you take on freelance or fixed-scope projects?', a: 'Yes. Alongside long-term engagements we take on freelance and fixed-price projects — mention this on the Contact page.' },
        { q: 'What is your typical technology stack?', a: 'Java and Spring Boot on the backend, MySQL for data, and either a vanilla HTML/CSS/JS frontend or a framework of the client\'s choice.' },
        { q: 'How do you handle project security?', a: 'Every project ships with role-based access control, JWT-secured APIs, and audit logging by default — see our Services page for detail.' }
      ]
    };
  }

  function load() {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const initial = seed();
      localStorage.setItem(KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  }

  function save(db) {
    localStorage.setItem(KEY, JSON.stringify(db));
  }

  function reset() {
    localStorage.setItem(KEY, JSON.stringify(seed()));
    return load();
  }

  return { load, save, reset };
})();
