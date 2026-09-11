/* ==========================================================================
   SavoLuma — home.js
   Home-page-only behaviour: render the clients strip and a rotating
   testimonial from the demo data store (managed via Admin Dashboard).
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const db = SavoDB.load();

  const strip = document.getElementById('clientsStrip');
  if (strip) {
    if (db.clients.length === 0) {
      strip.innerHTML = '<p class="field-hint">No clients added yet. Admin can add clients from the Admin Dashboard.</p>';
    } else {
      strip.innerHTML = db.clients.map(c => `<div class="client-chip">${c.logoText}</div>`).join('');
    }
  }

  const testimonialCard = document.getElementById('testimonialCard');
  if (testimonialCard) {
    const t = db.testimonials[0];
    testimonialCard.innerHTML = t
      ? `<p style="font-size:1.1rem;color:var(--ink);margin-bottom:16px;">"${t.quote}"</p><strong>${t.author}</strong><div class="field-hint">${t.title}</div>`
      : `<p class="field-hint">No testimonials yet.</p>`;
  }
});
