/* ==========================================================================
   SavoLuma — careers.js
   Renders open jobs from the demo DB and handles the job application
   form. On submit this calls SavoAPI.submitJobApplication(), which will
   become POST /api/v1/careers/apply on the real backend.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const db = SavoDB.load();

  const jobsList = document.getElementById('jobsList');
  const roleSelect = document.getElementById('applyRole');

  if (jobsList) {
    if (db.jobs.length === 0) {
      jobsList.innerHTML = '<p class="field-hint">No open roles right now. Admin can post new job openings from the Admin Dashboard.</p>';
    } else {
      jobsList.innerHTML = db.jobs.map(j => `
        <div class="job-row">
          <div>
            <h4>${j.title}</h4>
            <div class="job-meta"><span>${j.team}</span><span>${j.location}</span><span>${j.type}</span></div>
          </div>
          <a href="#apply" class="btn btn-outline btn-sm" data-job="${j.title}">Apply</a>
        </div>
      `).join('');
    }
  }

  if (roleSelect) {
    roleSelect.innerHTML = db.jobs.map(j => `<option value="${j.title}">${j.title}</option>`).join('')
      || '<option value="General Application">General Application</option>';
  }

  document.querySelectorAll('[data-job]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (roleSelect) roleSelect.value = btn.getAttribute('data-job');
    });
  });

  const form = document.getElementById('applyForm');
  const status = document.getElementById('applyStatus');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('applyName').value.trim();
      const email = document.getElementById('applyEmail').value.trim();
      const phone = document.getElementById('applyPhone').value.trim();
      const role = roleSelect.value;
      const message = document.getElementById('applyMessage').value.trim();

      if (!name || !email || !phone || !role) {
        status.textContent = 'Please fill in all required fields.';
        status.style.color = 'var(--danger)';
        return;
      }

      SavoAPI.submitJobApplication({ name, email, phone, role, message });
      form.reset();
      status.textContent = `Application received for ${role}. HR will review and contact you by email.`;
      status.style.color = 'var(--success)';
      showToast('Application submitted.', 'success');
    });
  }
});
