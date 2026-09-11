/* ==========================================================================
   SavoLuma — public header
   Injected into every public page. Internal portal links are never shown.
   ========================================================================== */

function renderPublicHeader(basePath = '', active = '') {
  const el = document.getElementById('site-header');
  if (!el) return;

  const is = (key) => (active === key ? ' class="active"' : '');
  const p = (href) => basePath + href;

  el.innerHTML = `
    <div class="container nav-row">
      <a href="${p('index.html')}" class="brand" aria-label="SavoLuma home">
        <img src="${p('assets/images/logo.jpeg')}" alt="SavoLuma — Illuminating Your Business">
      </a>
      <nav class="main-nav" aria-label="Primary">
        <ul>
          <li><a href="${p('index.html')}"${is('home')}>Home</a></li>
          <li class="has-dropdown">
            <a href="${p('pages/solutions.html')}"${is('solutions')}>Solutions</a>
            <div class="dropdown mega-dropdown" role="menu">
              <a href="${p('pages/solutions.html#crm')}">CRM</a>
              <a href="${p('pages/solutions.html#business-applications')}">Business Applications</a>
              <a href="${p('pages/solutions.html#ai-solutions')}">AI Solutions</a>
              <a href="${p('pages/solutions.html#automation')}">Automation</a>
              <a href="${p('pages/solutions.html#data-platforms')}">Data Platforms</a>
            </div>
          </li>
          <li class="has-dropdown">
            <a href="${p('pages/services.html')}"${is('services')}>Services</a>
            <div class="dropdown mega-dropdown" role="menu">
              <a href="${p('pages/services.html#it-services')}">IT Services</a>
              <a href="${p('pages/services.html#it-consultancy')}">IT Consultancy</a>
              <a href="${p('pages/services.html#software-development')}">Software Development</a>
              <a href="${p('pages/services.html#application-development')}">Application Development</a>
              <a href="${p('pages/services.html#ai-innovation-lab')}">AI Innovation Lab</a>
              <a href="${p('pages/services.html#data-services')}">Data Services</a>
              <a href="${p('pages/services.html#workforce-solutions')}">Technology Workforce</a>
            </div>
          </li>
          <li class="has-dropdown">
            <a href="${p('pages/industries.html')}"${is('industries')}>Industries</a>
            <div class="dropdown mega-dropdown" role="menu">
              <a href="${p('pages/industries.html#healthcare')}">Healthcare</a>
              <a href="${p('pages/industries.html#finance')}">Finance</a>
              <a href="${p('pages/industries.html#retail')}">Retail</a>
              <a href="${p('pages/industries.html#education')}">Education</a>
              <a href="${p('pages/industries.html#logistics')}">Logistics</a>
              <a href="${p('pages/industries.html#manufacturing')}">Manufacturing</a>
              <a href="${p('pages/industries.html#real-estate')}">Real Estate</a>
            </div>
          </li>
          <li><a href="${p('pages/projects.html')}"${is('projects')}>Projects</a></li>
          <li><a href="${p('pages/about.html')}"${is('about')}>About</a></li>
          <li><a href="${p('pages/careers.html')}"${is('careers')}>Careers</a></li>
          <li><a href="${p('pages/contact.html')}"${is('contact')}>Contact</a></li>
        </ul>
      </nav>
      <div class="nav-actions">
        <a href="${p('pages/contact.html')}?intent=quote" class="btn btn-outline btn-sm">Request a Quote</a>
      </div>
      <button class="nav-toggle" type="button" aria-label="Toggle menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  const depth = document.body.getAttribute('data-path-depth') || '';
  const active = document.body.getAttribute('data-nav-active') || '';
  renderPublicHeader(depth, active);
  if (typeof initNavToggle === 'function') initNavToggle();
});
