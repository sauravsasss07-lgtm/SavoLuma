/* ==========================================================================
   SavoLuma — footer.js
   Injects the shared site footer into any page with <footer id="site-footer">.
   Keeping the footer in one JS file means editing it once updates every page.
   ========================================================================== */

function renderFooter(basePath = '') {
  const el = document.getElementById('site-footer');
  if (!el) return;
  el.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <img src="${basePath}assets/images/logo.jpeg" alt="SavoLuma logo">
          <p>SavoLuma designs, builds and supports secure, scalable software for growing businesses — from process consulting to full-cycle agile delivery.</p>
          <!-- Social links intentionally omitted until real, configured company accounts
               exist — per policy we never publish placeholder/dead social links. Add
               entries here (with real hrefs) once accounts are live, e.g.:
               <a href="https://linkedin.com/company/savoluma" aria-label="LinkedIn" target="_blank" rel="noopener">in</a> -->
        </div>
        <div>
          <h4>Company</h4>
          <ul>
            <li><a href="${basePath}index.html">Home</a></li>
            <li><a href="${basePath}pages/about.html">About Us</a></li>
            <li><a href="${basePath}pages/careers.html">Careers</a></li>
            <li><a href="${basePath}pages/contact.html">Contact Us</a></li>
          </ul>
        </div>
        <div>
          <h4>Services</h4>
          <ul>
            <li><a href="${basePath}pages/services.html#process-consulting">Process Consulting</a></li>
            <li><a href="${basePath}pages/services.html#soa-consulting">SOA Consulting</a></li>
            <li><a href="${basePath}pages/services.html#agile-development">Agile Software Development</a></li>
            <li><a href="${basePath}pages/services.html#ai-innovation-lab">AI Innovation Lab</a></li>
          </ul>
        </div>
        <div>
          <h4>Resources</h4>
          <ul>
            <li><a href="${basePath}pages/clients.html">Clients</a></li>
            <li><a href="${basePath}pages/clients.html#testimonials">Testimonials</a></li>
            <li><a href="${basePath}pages/blog.html">Blog</a></li>
            <li><a href="${basePath}pages/faq.html">FAQ</a></li>
          </ul>
        </div>
        <div>
          <h4>Location</h4>
          <p style="margin-bottom:6px;">SavoLuma Software Pvt. Ltd.<br>151, Rajendra Bhavan, Rajendra Place,<br>New Delhi - 110008</p>
          <p style="margin-bottom:6px;">Mobile: +91-9015435450<br>Email: info@savoluma.com</p>
          <div class="subscribe-row">
            <input type="email" placeholder="Your email">
            <button>Subscribe</button>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2026 SavoLuma Software Pvt. Ltd. All Rights Reserved.</span>
        <div class="legal-links">
          <a href="${basePath}pages/terms.html">Terms &amp; Conditions</a>
          <a href="${basePath}pages/cookies.html">Cookies Policy</a>
          <a href="${basePath}pages/privacy.html">Privacy Statement</a>
        </div>
      </div>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  const depth = document.body.getAttribute('data-path-depth') || '';
  renderFooter(depth);
});
