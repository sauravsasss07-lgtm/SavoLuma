/* ==========================================================================
   SavoLuma — hr-dashboard.js
   Employee directory loads from the User API. Recruitment still uses the
   local store until jobs/applications have controllers.
   ========================================================================== */

let hrEmployees = [];

document.addEventListener('DOMContentLoaded', async () => {
  const session = SavoAuth.guard('HR', 'hr-login.html');
  if (!session) return;
  initDashboardShell(session);

  renderHrJobs();
  renderHrApplications();
  wireHr();
  await loadHrEmployees();
  document.getElementById('empSearch').addEventListener('input', (e) => renderDirectory(e.target.value));
});

function hrDb() { return SavoDB.load(); }

async function loadHrEmployees() {
  try {
    hrEmployees = await SavoAPI.getEmployees();
    renderDirectory(document.getElementById('empSearch').value);
    renderTeams();
  } catch (err) {
    showApiError(err, 'Could not load the employee directory.');
    document.getElementById('empGrid').innerHTML = '<p class="field-hint">Unable to load employees from the API.</p>';
  }
}

function renderDirectory(query) {
  const q = (query || '').toLowerCase().trim();
  const list = hrEmployees.filter(u => !q || [u.name, u.employeeId, u.role, u.department, u.team].join(' ').toLowerCase().includes(q));

  document.getElementById('empGrid').innerHTML = list.length ? list.map(u => `
    <div class="emp-card" onclick="openEmpDetail('${u.employeeId}')">
      <div class="emp-photo">${u.photo ? `<img src="${u.photo}" alt="${u.name}">` : initials(u.name)}</div>
      <h4>${u.name}</h4>
      <div class="emp-sub">${u.employeeId} · ${u.role}</div>
      <div class="emp-sub">${u.department || ''}${u.team ? ' / ' + u.team : ''}</div>
    </div>
  `).join('') : '<p class="field-hint">No employees match that search.</p>';
}

function renderTeams() {
  const teams = [...new Set(hrEmployees.map(u => u.team).filter(Boolean))];
  document.getElementById('teamsList').innerHTML = teams.map(t => {
    const members = hrEmployees.filter(u => u.team === t);
    const manager = members.find(m => m.role === 'MANAGER');
    return `
      <div class="team-block">
        <h4>${t} ${manager ? `<span class="field-hint">— managed by ${manager.name}</span>` : ''}</h4>
        <div class="team-members">
          ${members.map(m => `<span class="team-member-chip">${m.name} (${m.role})</span>`).join('')}
        </div>
      </div>
    `;
  }).join('') || '<p class="field-hint">No teams found.</p>';
}

function openEmpDetail(id) {
  const u = hrEmployees.find(x => x.employeeId === id);
  if (!u) return;
  document.getElementById('empDetailBody').innerHTML = `
    <div style="text-align:center;margin-bottom:18px;">
      <div class="emp-photo" style="width:88px;height:88px;margin:0 auto 12px;font-size:1.4rem;">${u.photo ? `<img src="${u.photo}" alt="${u.name}">` : initials(u.name)}</div>
      <h3 style="margin-bottom:2px;">${u.name}</h3>
      <div class="field-hint">${u.employeeId} · ${u.role} · ${u.department || ''}${u.team ? ' / ' + u.team : ''}</div>
    </div>
    <div class="field"><label>Email</label><input id="edEmail" value="${u.email || ''}"></div>
    <div class="field"><label>Phone</label><input id="edPhone" value="${u.phone || ''}"></div>
    <p class="field-hint">Photo upload is stored on the server in a later phase. Email and phone save through the User API now.</p>
    <button class="btn btn-primary btn-block" onclick="saveEmpDetail('${u.employeeId}')">Save Changes</button>
  `;
  document.getElementById('empDetailModal').classList.add('open');
}

async function saveEmpDetail(id) {
  const email = document.getElementById('edEmail').value.trim();
  const phone = document.getElementById('edPhone').value.trim();
  try {
    await SavoAPI.updateEmployee(id, { email, phone });
    document.getElementById('empDetailModal').classList.remove('open');
    showToast('Employee record updated.', 'success');
    await loadHrEmployees();
  } catch (err) { showApiError(err); }
}

function renderHrJobs() {
  const d = hrDb();
  document.getElementById('hrJobsTable').innerHTML = `
    <tr><th>Title</th><th>Team</th><th>Location</th><th>Type</th><th>Actions</th></tr>
    ${d.jobs.map(j => `<tr><td>${j.title}</td><td>${j.team}</td><td>${j.location}</td><td>${j.type}</td><td><button class="btn btn-danger btn-sm" onclick="hrRemoveJob('${j.id}')">Remove</button></td></tr>`).join('')}
  `;
}
function hrRemoveJob(id) {
  const d = hrDb(); d.jobs = d.jobs.filter(j => j.id !== id); SavoDB.save(d);
  renderHrJobs(); showToast('Job posting removed.', 'success');
}
function renderHrApplications() {
  const d = hrDb();
  document.getElementById('hrApplicationsTable').innerHTML = d.applications.length ? `
    <tr><th>Name</th><th>Role</th><th>Email</th><th>Status</th></tr>
    ${d.applications.map(a => `<tr><td>${a.name}</td><td>${a.role}</td><td>${a.email}</td><td><span class="badge badge-amber">${a.status}</span></td></tr>`).join('')}
  ` : `<tr><td class="empty-state">No applications received yet.</td></tr>`;
}

function wireHr() {
  document.getElementById('hrJobForm').addEventListener('submit', e => {
    e.preventDefault();
    const d = hrDb();
    d.jobs.push({
      id: 'JOB-' + (d.jobs.length + 1),
      title: document.getElementById('hjTitle').value.trim(),
      team: document.getElementById('hjTeam').value.trim(),
      location: document.getElementById('hjLocation').value.trim(),
      type: document.getElementById('hjType').value
    });
    SavoDB.save(d);
    document.getElementById('hrJobModal').classList.remove('open');
    renderHrJobs();
    showToast('Job posted.', 'success');
    e.target.reset();
  });
}
