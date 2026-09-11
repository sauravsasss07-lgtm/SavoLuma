/* ==========================================================================
   SavoLuma — contact.js
   Reads ?intent=quote|project|consultation from the URL (linked from the
   homepage CTAs and nav) to preselect the enquiry type, then submits the
   form via SavoAPI. Real backend: POST /api/v1/contact,
   /api/v1/consultations, or /api/v1/quotes depending on intent.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const intent = params.get('intent');
  const select = document.getElementById('cIntent');
  const lead = document.getElementById('intentLead');

  const intentCopy = {
    quote: 'Tell us about the work and budget range — we\'ll follow up with a scoped quote.',
    project: 'Tell us what you\'re building. We\'ll respond with next steps within one business day.',
    consultation: 'Share your availability and requirement — we\'ll confirm a consultation slot by email.',
    freelance: 'Describe the scope of the freelance or fixed-price engagement you have in mind.'
  };

  if (intent && select) {
    select.value = intent;
    if (lead && intentCopy[intent]) lead.textContent = intentCopy[intent];
  }

  const form = document.getElementById('contactForm');
  const status = document.getElementById('contactStatus');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const payload = {
      intent: select.value,
      name: document.getElementById('cName').value.trim(),
      email: document.getElementById('cEmail').value.trim(),
      mobile: document.getElementById('cMobile').value.trim(),
      company: document.getElementById('cCompany').value.trim(),
      query: document.getElementById('cQuery').value.trim()
    };

    if (!payload.name || !payload.email || !payload.mobile || !payload.query) {
      status.textContent = 'Please fill in all required fields.';
      status.style.color = 'var(--danger)';
      return;
    }
    if (!payload.email.includes('@')) {
      status.textContent = 'Enter a valid email address.';
      status.style.color = 'var(--danger)';
      return;
    }

    if (payload.intent === 'consultation') {
      SavoAPI.submitConsultation(payload);
    } else if (payload.intent === 'quote') {
      SavoAPI.submitQuote(payload);
    } else {
      SavoAPI.submitContact(payload);
    }

    form.reset();
    status.textContent = 'Message sent. Our team will get back to you shortly.';
    status.style.color = 'var(--success)';
    showToast('Message sent.', 'success');
  });
});
