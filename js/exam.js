/* ==========================================================================
   exam.js — exam.html (proctored exam room)
   Timer (refresh par reset nahi), question palette, mark-for-review,
   auto-save, anti-cheat strikes, auto-submit
   ========================================================================== */
(function () {
  'use strict';

  var MAX_STRIKES = 3;

  var user = Store.requireRole('student');
  if (!user) return;

  var $ = function (id) { return document.getElementById(id); };

  var examId = new URLSearchParams(window.location.search).get('id');
  var exam = Store.getExam(examId);
  if (!exam) {
    UI.toast('Exam nahi mila.', 'error');
    setTimeout(function () { Store.go('student-dashboard.html'); }, 800);
    return;
  }
  if (Store.hasAttempted(user.id, exam.id)) { Store.go('student-dashboard.html'); return; }

  // Adhura attempt ho to resume, warna naya
  var attempt = Store.getAttempt(user.id);
  if (!attempt || attempt.examId !== exam.id) attempt = Store.startAttempt(exam, user);

  var endTime = attempt.startedAt + exam.duration * 60000;
  var current = Math.min(attempt.current || 0, exam.questions.length - 1);
  var finished = false;
  var timerId = null;
  var lastStrikeAt = 0;
  var total = exam.questions.length;

  /* ---------- header ---------- */
  $('examTopTitle').textContent = exam.title;
  $('examCategoryBadge').textContent = exam.category;
  $('studentDisplayName').textContent = user.name;
  $('studentDisplayRoll').textContent = user.roll || 'N/A';

  function save() { attempt.current = current; Store.saveAttempt(attempt); }

  /* ---------- palette status ---------- */
  function isAnswered(i) { return attempt.answers[i] !== undefined; }
  function statusClass(i) {
    var ans = isAnswered(i), rev = !!attempt.review[i];
    if (ans && rev) return 'status-ans-review';
    if (rev) return 'status-review';
    if (ans) return 'status-answered';
    if (attempt.visited[i]) return 'status-not-answered';
    return 'status-not-visited';
  }

  function renderPalette() {
    $('questionPaletteGrid').innerHTML = exam.questions.map(function (q, i) {
      return '<button type="button" class="palette-btn ' + statusClass(i) + (i === current ? ' active' : '') +
        '" data-goto="' + i + '">' + (i + 1) + '</button>';
    }).join('');

    var answered = 0, review = 0;
    for (var i = 0; i < total; i++) {
      if (isAnswered(i)) answered++;
      if (attempt.review[i]) review++;
    }
    $('sumAnswered').textContent = answered;
    $('sumReview').textContent = review;
    $('sumUnanswered').textContent = total - answered;
  }

  /* ---------- question ---------- */
  function renderQuestion() {
    var q = exam.questions[current];
    attempt.visited[current] = true;

    $('questionIndexText').textContent = 'Question ' + (current + 1) + ' of ' + total;
    $('questionPointsBadge').textContent = q.marks + (Number(q.marks) === 1 ? ' Mark' : ' Marks');
    $('questionBodyText').textContent = q.text;

    $('questionOptionsContainer').innerHTML = q.options.map(function (opt, i) {
      var sel = attempt.answers[current] === i;
      return '<div class="option-item' + (sel ? ' selected' : '') + '" data-opt="' + i + '">' +
        '<div class="option-indicator">' + String.fromCharCode(65 + i) + '</div>' +
        '<div class="option-label-text">' + UI.esc(opt) + '</div></div>';
    }).join('');

    $('prevQuestionBtn').disabled = current === 0;
    $('nextQuestionBtn').textContent = current === total - 1 ? 'Review & Submit' : 'Next Question →';
    $('reviewBtn').textContent = attempt.review[current] ? '✓ Marked (click to unmark)' : '⭐ Mark for Review';

    renderPalette();
    save();
  }

  function goTo(i) {
    if (i < 0 || i >= total) return;
    current = i;
    renderQuestion();
  }

  $('questionOptionsContainer').addEventListener('click', function (e) {
    var item = e.target.closest('[data-opt]');
    if (!item) return;
    attempt.answers[current] = Number(item.getAttribute('data-opt')); // auto-save
    renderQuestion();
  });
  $('questionPaletteGrid').addEventListener('click', function (e) {
    var b = e.target.closest('[data-goto]');
    if (b) goTo(Number(b.getAttribute('data-goto')));
  });
  $('prevQuestionBtn').addEventListener('click', function () { goTo(current - 1); });
  $('nextQuestionBtn').addEventListener('click', function () {
    if (current === total - 1) openConfirm(); else goTo(current + 1);
  });
  $('clearBtn').addEventListener('click', function () { delete attempt.answers[current]; renderQuestion(); });
  $('reviewBtn').addEventListener('click', function () {
    if (attempt.review[current]) delete attempt.review[current]; else attempt.review[current] = true;
    renderQuestion();
  });

  /* ---------- timer ---------- */
  function pad(n) { return n < 10 ? '0' + n : String(n); }
  function tick() {
    var remaining = Math.max(0, endTime - Date.now());
    var s = Math.ceil(remaining / 1000);
    var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    $('examTimer').textContent = (h ? pad(h) + ':' : '') + pad(m) + ':' + pad(sec);

    var wrap = $('timerWrap');
    wrap.classList.toggle('timer-danger', s <= 60);
    wrap.classList.toggle('timer-warning', s > 60 && s <= 300);

    if (remaining <= 0) {
      UI.toast('Time khatam! Exam auto-submit ho raha hai.', 'warning');
      finish('time');
    }
  }

  /* ---------- submit ---------- */
  function finish(reason) {
    if (finished) return;
    finished = true;
    clearInterval(timerId);
    var result = Store.submitAttempt(attempt, reason);
    Store.go('result.html?id=' + encodeURIComponent(result.id));
  }

  function openConfirm() {
    var answered = 0;
    for (var i = 0; i < total; i++) if (isAnswered(i)) answered++;
    $('confirmTotalQuestions').textContent = total;
    $('confirmAnsweredQuestions').textContent = answered;
    $('confirmUnansweredQuestions').textContent = total - answered;
    UI.openModal('submitConfirmModal');
  }
  $('finishBtn').addEventListener('click', openConfirm);
  $('submitBtn').addEventListener('click', openConfirm);
  $('confirmSubmitBtn').addEventListener('click', function () { finish('manual'); });

  /* ---------- anti-cheat: tab switch / blur = strike ---------- */
  function updateStrikeBadge() {
    $('strikeCounterBadge').innerHTML = '🛡️ Strikes: <strong>' + attempt.strikes + '/' + MAX_STRIKES + '</strong>';
  }

  function strike(reason) {
    if (finished) return;
    var now = Date.now();
    if (now - lastStrikeAt < 1500) return; // tab switch par blur + visibilitychange dono fire hote hain
    lastStrikeAt = now;

    attempt.strikes++;
    save();
    updateStrikeBadge();

    if (attempt.strikes >= MAX_STRIKES) {
      UI.toast('3 strikes! Aap disqualify ho gaye.', 'error');
      finish('disqualified');
      return;
    }
    $('strikeWarningReason').textContent = reason;
    $('strikeWarningCount').textContent = attempt.strikes + ' of ' + MAX_STRIKES;
    UI.openModal('strikeWarningModal');
  }

  document.addEventListener('visibilitychange', function () { if (document.hidden) strike('Tab switch detected!'); });
  window.addEventListener('blur', function () { strike('Exam window ka focus chala gaya!'); });
  $('strikeAckBtn').addEventListener('click', function () { UI.closeModal('strikeWarningModal'); });

  // Copy / paste / right-click block
  ['copy', 'cut', 'paste'].forEach(function (type) {
    document.addEventListener(type, function (e) { e.preventDefault(); UI.toast('Copy/Paste exam me allowed nahi hai.', 'warning'); });
  });
  document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'u', 's', 'p'].indexOf(e.key.toLowerCase()) !== -1) e.preventDefault();
  });

  /* ---------- fullscreen ---------- */
  $('fullscreenBtn').addEventListener('click', function () {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(function () {});
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  });

  /* ---------- start ---------- */
  updateStrikeBadge();
  renderQuestion();
  tick();
  timerId = setInterval(tick, 500);
})();
