/* ==========================================================================
   SavoLuma — clients.js
   Renders clients and testimonials from the demo DB (managed via Admin
   Dashboard → Clients / Testimonials).
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const db = SavoDB.load();

  const grid = document.getElementById('clientsGrid');
  if (grid) {
    grid.innerHTML = db.clients.length
      ? db.clients.map(c => `<div class="client-tile">${c.logoText}</div>`).join('')
      : '<p class="field-hint">No clients added yet.</p>';
  }

  const tGrid = document.getElementById('testimonialsGrid');
  if (tGrid) {
    tGrid.innerHTML = db.testimonials.length
      ? db.testimonials.map(t => `
          <div class="testimonial-tile">
            <p class="quote">"${t.quote}"</p>
            <strong>${t.author}</strong>
            <div class="field-hint">${t.title}</div>
          </div>
        `).join('')
      : '<p class="field-hint">No testimonials added yet.</p>';
  }
});
