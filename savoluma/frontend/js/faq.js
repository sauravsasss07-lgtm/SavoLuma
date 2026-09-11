/* ==========================================================================
   SavoLuma — faq.js
   Renders the FAQ accordion from the demo DB (db.faqs). Real backend:
   GET /api/v1/faq.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const db = SavoDB.load();
  const list = document.getElementById('faqList');
  if (!list) return;

  list.innerHTML = db.faqs.map((f, i) => `
    <div class="faq-item" id="faq-${i}">
      <button class="faq-q" type="button" data-index="${i}">
        <span>${f.q}</span><span class="chev">▾</span>
      </button>
      <div class="faq-a"><p style="margin:0;">${f.a}</p></div>
    </div>
  `).join('');

  list.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.faq-item').classList.toggle('open');
    });
  });
});
