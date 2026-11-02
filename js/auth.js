/* ==========================================================================
   auth.js — login.html: Login / Register tabs, validation, role redirect
   ========================================================================== */
(function () {
  'use strict';

  // Redirect to the dashboard if the user is already logged in.
  var existing = Store.currentUser();
  if (existing) { Store.go(Store.homeFor(existing)); return; }

  var $ = function (id) { return document.getElementById(id); };
  var loginForm = $('loginForm'), registerForm = $('registerForm');
  var tabLogin = $('tabLogin'), tabRegister = $('tabRegister');
  var errorBox = $('authError');

  function showError(msg) { errorBox.textContent = msg; errorBox.style.display = 'block'; }
  function clearError() { errorBox.style.display = 'none'; errorBox.textContent = ''; }

  function showTab(tab) {
    var isLogin = tab === 'login';
    loginForm.style.display = isLogin ? '' : 'none';
    registerForm.style.display = isLogin ? 'none' : '';
    tabLogin.className = 'btn btn-block ' + (isLogin ? 'btn-primary' : 'btn-secondary');
    tabRegister.className = 'btn btn-block ' + (isLogin ? 'btn-secondary' : 'btn-primary');
    clearError();
  }

  tabLogin.addEventListener('click', function () { showTab('login'); });
  tabRegister.addEventListener('click', function () { showTab('register'); });
  if (new URLSearchParams(window.location.search).get('mode') === 'register') showTab('register');

  // Demo accounts auto-fill
  $('fillStudent').addEventListener('click', function () {
    $('loginEmail').value = 'student@demo.com'; $('loginPassword').value = 'student123'; clearError();
  });
  $('fillTeacher').addEventListener('click', function () {
    $('loginEmail').value = 'teacher@demo.com'; $('loginPassword').value = 'teacher123'; clearError();
  });

  // Teachers do not need a roll number.
  function toggleRoll() { $('rollGroup').style.display = $('regRole').value === 'student' ? '' : 'none'; }
  $('regRole').addEventListener('change', toggleRoll);
  toggleRoll();

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    clearError();
    var email = $('loginEmail').value.trim();
    var password = $('loginPassword').value;
    if (!email || !password) return showError('Enter both your email and password.');

    var res = Store.login(email, password);
    if (!res.ok) return showError(res.error);
    UI.toast('Welcome back, ' + res.user.name + '!', 'success');
    Store.go(Store.homeFor(res.user));
  });

  registerForm.addEventListener('submit', function (e) {
    e.preventDefault();
    clearError();
    var res = Store.register({
      name: $('regName').value,
      email: $('regEmail').value,
      role: $('regRole').value,
      roll: $('regRoll').value,
      password: $('regPassword').value
    });
    if (!res.ok) return showError(res.error);
    UI.toast('Account created successfully!', 'success');
    Store.go(Store.homeFor(res.user));
  });
})();
