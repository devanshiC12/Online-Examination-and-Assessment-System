/* ==========================================================================
   result.js — result.html (scorecard + question-by-question review)
   Student sirf apna result dekh sakta hai, teacher sirf apne exams ke results.
   ========================================================================== */
(function () {
  'use strict';

  var user = Store.requireRole(); // koi bhi logged-in role
  if (!user) return;

  var $ = function (id) { return document.getElementById(id); };
  var id = new URLSearchParams(window.location.search).get('id');
  var r = Store.getResult(id);

  var allowed = r && ((user.role === 'student' && r.userId === user.id) ||
                      (user.role === 'teacher' && r.teacherId === user.id));
  if (!allowed) {
    UI.toast('Result nahi mila ya access allowed nahi hai.', 'error');
    setTimeout(function () { Store.go(Store.homeFor(user)); }, 900);
    return;
  }

  // Back button role ke hisaab se
  var back = $('backDashboardBtn');
  back.href = Store.homeFor(user);
  back.textContent = user.role === 'teacher' ? '← Back to Teacher Dashboard' : '← Back to Student Dashboard';

  /* ---------- scorecard ---------- */
  $('resExamTitle').textContent = r.examTitle;
  $('resCandidateName').textContent = r.userName;
  $('resCandidateRoll').textContent = r.roll || 'N/A';
  $('resScore').textContent = r.score + ' / ' + r.total;
  $('resPercentage').textContent = r.percentage + '%';
  $('resTimeTaken').textContent = UI.fmtDuration(r.timeTaken);
  $('resDate').textContent = UI.fmtDateTime(r.submittedAt);

  var status = $('resStatusBadge');
  status.textContent = r.status;
  status.className = 'badge ' + (r.status === 'PASSED' ? 'badge-success' : (r.status === 'DISQUALIFIED' ? 'badge-danger' : 'badge-warning'));

  var strike = $('resStrikeBadge');
  strike.textContent = r.strikes + ' strike(s)';
  strike.className = 'badge ' + (r.strikes === 0 ? 'badge-success' : (r.strikes < 3 ? 'badge-warning' : 'badge-danger'));

  /* ---------- detailed review ---------- */
  var list = r.questions.map(function (q, i) {
    var picked = r.answers[i];
    var skipped = picked === undefined;
    var correct = !skipped && picked === q.correct;
    var verdict = skipped ? '<span class="badge badge-warning">Skipped</span>'
      : (correct ? '<span class="badge badge-success">Correct +' + q.marks + '</span>' : '<span class="badge badge-danger">Wrong</span>');

    var opts = q.options.map(function (o, j) {
      var style = 'padding:.55rem .8rem;margin-top:.4rem;border-radius:8px;border:1px solid var(--border-color);';
      var tag = '';
      if (j === q.correct) { style += 'background:var(--success-bg);border-color:var(--success);font-weight:600;'; tag = ' ✓ Correct answer'; }
      else if (j === picked) { style += 'background:var(--danger-bg);border-color:var(--danger);'; tag = ' ✗ Your answer'; }
      if (j === q.correct && j === picked) tag = ' ✓ Your answer (correct)';
      return '<div style="' + style + '">' + String.fromCharCode(65 + j) + '. ' + UI.esc(o) + '<small>' + tag + '</small></div>';
    }).join('');

    return '<div class="card" style="margin-bottom:1rem;">' +
      '<div style="display:flex;justify-content:space-between;gap:1rem;align-items:flex-start;">' +
        '<strong>Q' + (i + 1) + '. ' + UI.esc(q.text) + '</strong>' + verdict + '</div>' + opts +
      (q.explanation ? '<p style="margin-top:.8rem;font-size:.875rem;color:var(--text-muted);">💡 <strong>Explanation:</strong> ' + UI.esc(q.explanation) + '</p>' : '') +
    '</div>';
  }).join('');
  $('questionReviewList').innerHTML = list;

  $('printBtn').addEventListener('click', function () { window.print(); });
})();
