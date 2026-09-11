/* ==========================================================================
   SavoLuma — main.js
   Shared behaviour for every public-facing page: mobile nav, footer
   subscribe form, and toast helper used across the site.
   ========================================================================== */

function initNavToggle() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
  });
}

function initSubscribeForm() {
  const form = document.querySelector('.subscribe-row');
  if (!form) return;
  const btn = form.querySelector('button');
  const input = form.querySelector('input');
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    if (!input.value || !input.value.includes('@')) {
      showToast('Enter a valid email address.', 'error');
      return;
    }
    showToast('Subscribed. Thank you.', 'success');
    input.value = '';
  });
}

function showToast(message, type = '') {
  let stack = document.querySelector('.toast-stack');
  if (!stack) {
    stack = document.createElement('div');
    stack.className = 'toast-stack';
    document.body.appendChild(stack);
  }
  const toast = document.createElement('div');
  toast.className = 'toast' + (type ? ' ' + type : '');
  toast.textContent = message;
  stack.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

document.addEventListener('DOMContentLoaded', () => {
  initNavToggle();
  initSubscribeForm();
});
