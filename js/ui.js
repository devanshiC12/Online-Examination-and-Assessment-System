/* ==========================================================================
   ui.js — Toast, modal, navbar (name + role + logout), formatters
   Page load par modals wire ho jate hain aur #navUserSection bhar jata hai.
   ========================================================================== */
var UI = (function () {
  'use strict';

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- toast ---------- */
  function toast(message, type) {
    type = type || 'info'; // success | error | warning | info
    var box = document.querySelector('.toast-container');
    if (!box) {
      box = document.createElement('div');
      box.className = 'toast-container';
      document.body.appendChild(box);
    }
    var icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    var el = document.createElement('div');
    el.className = 'toast toast-' + type;
    el.innerHTML = '<span>' + (icons[type] || '') + '</span><span>' + esc(message) + '</span>';
    box.appendChild(el);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 3500);
  }

  /* ---------- modal ---------- */
  function openModal(id) {
    var el = document.getElementById(id);
    if (el) el.classList.add('active');
  }
  function closeModal(id) {
    var el = document.getElementById(id);
    if (el) el.classList.remove('active');
  }
  function wireModals() {
    document.addEventListener('click', function (e) {
      var closeBtn = e.target.closest ? e.target.closest('.modal-close, [data-close]') : null;
      if (closeBtn) {
        var m = closeBtn.closest('.modal-backdrop');
        if (m) m.classList.remove('active');
        return;
      }
      // backdrop par click -> band (data-static wale modal band nahi honge)
      if (e.target.classList && e.target.classList.contains('modal-backdrop') && !e.target.hasAttribute('data-static')) {
        e.target.classList.remove('active');
      }
    });
  }

  /* ---------- navbar ---------- */
  function renderNavbar() {
    var holder = document.getElementById('navUserSection');
    if (!holder) return;
    var user = Store.currentUser();
    if (!user) {
      holder.innerHTML = '<a href="login.html" class="btn btn-secondary btn-sm">Login</a>';
      return;
    }
    holder.innerHTML =
      '<div class="nav-user">' +
        '<div class="user-badge"><span>' + esc(user.name) + '</span>' +
        '<span class="role-tag role-' + esc(user.role) + '">' + esc(user.role) + '</span></div>' +
        '<button type="button" class="btn btn-outline-danger btn-sm" id="logoutBtn">Logout</button>' +
      '</div>';
    document.getElementById('logoutBtn').addEventListener('click', function () {
      Store.logout();
      Store.go('login.html');
    });
  }

  /* ---------- formatters ---------- */
  function fmtDate(iso) {
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  function fmtDateTime(iso) {
    return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  function fmtDuration(seconds) {
    seconds = Math.max(0, Math.round(seconds));
    return Math.floor(seconds / 60) + 'm ' + (seconds % 60) + 's';
  }
  function statusBadge(status) {
    var cls = status === 'PASSED' ? 'badge-success' : (status === 'DISQUALIFIED' ? 'badge-danger' : 'badge-warning');
    return '<span class="badge ' + cls + '">' + esc(status) + '</span>';
  }

  function init() { wireModals(); renderNavbar(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  return {
    esc: esc, toast: toast, openModal: openModal, closeModal: closeModal,
    renderNavbar: renderNavbar, fmtDate: fmtDate, fmtDateTime: fmtDateTime,
    fmtDuration: fmtDuration, statusBadge: statusBadge
  };
})();
