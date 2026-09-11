/* ==========================================================================
   SavoLuma — blog.js
   Renders blog posts from the demo DB (db.blogPosts). Real backend:
   GET /api/v1/blog.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const db = SavoDB.load();
  const list = document.getElementById('blogList');
  if (!list) return;

  list.innerHTML = db.blogPosts.length
    ? db.blogPosts.map(p => `
        <article class="blog-item">
          <div class="blog-date">${p.date}</div>
          <h3 style="margin:6px 0 8px;">${p.title}</h3>
          <p style="margin:0;">${p.excerpt}</p>
        </article>
      `).join('')
    : '<p class="field-hint">No posts published yet.</p>';
});
