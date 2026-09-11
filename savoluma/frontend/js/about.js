/* ==========================================================================
   SavoLuma — about.js
   Renders leadership cards from the demo employee data (executive-level
   roles). Admin can add real leadership bios/photos from the dashboard.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('leadershipGrid');
  if (!grid) return;
  const db = SavoDB.load();
  const leaders = db.users.filter(u => ['CEO'].includes(u.role));

  if (leaders.length === 0) {
    grid.innerHTML = '<p class="field-hint">Leadership profiles will appear here once added by Admin.</p>';
    return;
  }

  grid.innerHTML = leaders.map(l => `
    <div class="card leader-card">
      <div class="leader-photo">${l.name.split(' ').map(n => n[0]).join('')}</div>
      <h4 style="margin-bottom:2px;">${l.name}</h4>
      <div class="field-hint">${l.role}</div>
    </div>
  `).join('');
});
