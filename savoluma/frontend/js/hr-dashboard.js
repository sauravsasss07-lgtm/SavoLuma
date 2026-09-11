/* ==========================================================================
   SavoLuma — hr-dashboard.js
   HR can view/update employee records and manage recruitment, but never
   touches CRM, client data, source code, or financials (spec section 24).
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const session = SavoAuth.guard('HR', 'hr-login.html');
  if (!session) return;
  initDashboardShell(session);

  renderDirectory();
  renderTeams();
  renderHrJobs();
  renderHrApplications();
  wireHr();

  document.getElementById('empSearch').addEventListener('input', (e) => renderDirectory(e.target.value));
});

function hrDb() { return SavoDB.load(); }

function renderDirectory(query) {
  const d = hrDb();
  const q = (query || '').toLowerCase().trim();
  const list = d.users.filter(u => !q || [u.name, u.employeeId, u.role, u.department, u.team].join(' ').toLowerCase().includes(q));

  document.getElementById('empGrid').innerHTML = list.length ? list.map(u => `
    <div class="emp-card" onclick="openEmpDetail('${u.employeeId}')">
      <div class="emp-photo">${u.photo ? `<img src="${u.photo}" alt="${u.name}">` : initials(u.name)}</div>
      <h4>${u.name}</h4>
      <div class="emp-sub">${u.employeeId} · ${u.role}</div>
      <div class="emp-sub">${u.department}${u.team ? ' / ' + u.team : ''}</div>
    </div>
  `).join('') : '<p class="field-hint">No employees match that search.</p>';
}

function renderTeams() {
  const d = hrDb();
  const teams = [...new Set(d.users.map(u => u.team).filter(Boolean))];
  document.getElementById('teamsList').innerHTML = teams.map(t => {
    const members = d.users.filter(u => u.team === t);
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
  const d = hrDb();
  const u = d.users.find(x => x.employeeId === id);
  if (!u) return;
  document.getElementById('empDetailBody').innerHTML = `
    <div style="text-align:center;margin-bottom:18px;">
      <div class="emp-photo" style="width:88px;height:88px;margin:0 auto 12px;font-size:1.4rem;">${u.photo ? `<img src="${u.photo}" alt="${u.name}">` : initials(u.name)}</div>
      <h3 style="margin-bottom:2px;">${u.name}</h3>
      <div class="field-hint">${u.employeeId} · ${u.role} · ${u.department}${u.team ? ' / ' + u.team : ''}</div>
    </div>
    <div class="field"><label>Email</label><input id="edEmail" value="${u.email || ''}"></div>
    <div class="field"><label>Phone</label><input id="edPhone" value="${u.phone || ''}"></div>
    <div class="field"><label>Upload / replace photo</label><input type="file" id="edPhoto" accept="image/*"></div>
    <button class="btn btn-primary btn-block" onclick="saveEmpDetail('${u.employeeId}')">Save Changes</button>
  `;
  document.getElementById('empDetailModal').classList.add('open');
}

function saveEmpDetail(id) {
  const email = document.getElementById('edEmail').value.trim();
  const phone = document.getElementById('edPhone').value.trim();
  const fileInput = document.getElementById('edPhoto');
  const file = fileInput.files[0];

  const finish = (photoDataUrl) => {
    const changes = { email, phone };
    if (photoDataUrl) changes.photo = photoDataUrl;
    SavoAPI.updateEmployee(id, changes);
    document.getElementById('empDetailModal').classList.remove('open');
    renderDirectory(document.getElementById('empSearch').value);
    showToast('Employee record updated.', 'success');
  };

  if (file) {
    const reader = new FileReader();
    reader.onload = () => finish(reader.result);
    reader.readAsDataURL(file);
  } else {
    finish(null);
  }
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
