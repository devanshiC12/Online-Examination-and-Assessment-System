/* ==========================================================================
   student.js — student-dashboard.html
   Metrics, available exams (search + category filter), lobby modal, history
   ========================================================================== */
(function () {
  'use strict';

  var user = Store.requireRole('student');
  if (!user) return;

  var $ = function (id) { return document.getElementById(id); };
  var selectedExamId = null;

  $('studentName').textContent = user.name;
  $('studentRoll').textContent = 'Roll No: ' + (user.roll || 'N/A');

  /* ---------- metrics ---------- */
  function renderMetrics() {
    var s = Store.summarize(Store.resultsForUser(user.id));
    $('metricCompleted').textContent = s.count;
    $('metricAvgScore').textContent = s.avg + '%';
    $('metricPassRate').textContent = s.passRate + '%';
  }

  /* ---------- category filter ---------- */
  function fillCategories() {
    var cats = [];
    Store.getExams().forEach(function (e) { if (cats.indexOf(e.category) === -1) cats.push(e.category); });
    $('examFilterCategory').innerHTML = '<option value="">All Categories</option>' +
      cats.map(function (c) { return '<option value="' + UI.esc(c) + '">' + UI.esc(c) + '</option>'; }).join('');
  }

  /* ---------- available exams ---------- */
  function renderExams() {
    var q = $('examSearchInput').value.trim().toLowerCase();
    var cat = $('examFilterCategory').value;
    var exams = Store.getExams().filter(function (e) {
      var matchText = !q || e.title.toLowerCase().indexOf(q) !== -1 || e.description.toLowerCase().indexOf(q) !== -1;
      return matchText && (!cat || e.category === cat);
    });

    var box = $('studentExamsContainer');
    if (!exams.length) {
      box.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><div class="empty-state-icon">📭</div>' +
        '<h3>No assessments found</h3><p>Koi exam match nahi hua. Search ya filter badal ke dekho.</p></div>';
      return;
    }

    box.innerHTML = exams.map(function (e) {
      var done = Store.hasAttempted(user.id, e.id);
      var action = done
        ? '<span class="badge badge-success">Attempted ✓</span>'
        : '<button type="button" class="btn btn-primary btn-sm" data-start="' + UI.esc(e.id) + '">Start →</button>';
      return '<div class="exam-card">' +
        '<div class="exam-card-header"><span class="badge badge-purple">' + UI.esc(e.category) + '</span></div>' +
        '<h3 class="exam-title">' + UI.esc(e.title) + '</h3>' +
        '<p class="exam-desc">' + UI.esc(e.description || 'No description provided.') + '</p>' +
        '<div class="exam-meta-grid">' +
          '<div class="meta-item">⏱️ <strong>' + e.duration + ' min</strong></div>' +
          '<div class="meta-item">❓ <strong>' + e.questions.length + ' Qs</strong></div>' +
          '<div class="meta-item">🏆 <strong>' + Store.totalMarks(e) + ' marks</strong></div>' +
          '<div class="meta-item">🎯 <strong>' + e.passingPercent + '% pass</strong></div>' +
        '</div>' +
        '<div class="exam-card-footer"><small style="color:var(--text-muted);">By ' + UI.esc(e.createdByName) + '</small>' + action + '</div>' +
      '</div>';
    }).join('');
  }

  $('studentExamsContainer').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-start]');
    if (!btn) return;
    var exam = Store.getExam(btn.getAttribute('data-start'));
    if (!exam) return;
    selectedExamId = exam.id;
    $('lobbyExamTitle').textContent = exam.title;
    $('lobbyDuration').textContent = exam.duration + ' Mins';
    $('lobbyQuestions').textContent = exam.questions.length + ' Questions';
    $('lobbyTotalMarks').textContent = Store.totalMarks(exam) + ' Marks';
    $('lobbyPassing').textContent = exam.passingPercent + '%';
    UI.openModal('examLobbyModal');
  });

  $('launchExamBtn').addEventListener('click', function () {
    var exam = Store.getExam(selectedExamId);
    if (!exam) return UI.toast('Exam ab available nahi hai.', 'error');
    if (Store.hasAttempted(user.id, exam.id)) return UI.toast('Aap ye exam pehle de chuke ho.', 'warning');

    // Kisi aur exam ka adhura attempt ho to naya shuru (same exam ho to resume)
    var existing = Store.getAttempt(user.id);
    if (!existing || existing.examId !== exam.id) Store.startAttempt(exam, user);
    Store.go('exam.html?id=' + encodeURIComponent(exam.id));
  });

  /* ---------- history ---------- */
  function renderHistory() {
    var rows = Store.resultsForUser(user.id);
    var body = $('studentHistoryTableBody');
    if (!rows.length) {
      body.innerHTML = '<tr><td colspan="7"><div class="empty-state"><div class="empty-state-icon">🗂️</div>' +
        '<h3>No history yet</h3><p>Pehla exam dene ke baad scorecard yahan dikhega.</p></div></td></tr>';
      return;
    }
    body.innerHTML = rows.map(function (r) {
      return '<tr>' +
        '<td><strong>' + UI.esc(r.examTitle) + '</strong></td>' +
        '<td>' + UI.fmtDateTime(r.submittedAt) + '</td>' +
        '<td>' + UI.fmtDuration(r.timeTaken) + '</td>' +
        '<td>' + r.score + ' / ' + r.total + ' (' + r.percentage + '%)</td>' +
        '<td>' + UI.statusBadge(r.status) + '</td>' +
        '<td>' + r.strikes + '</td>' +
        '<td><a class="btn btn-secondary btn-sm" href="result.html?id=' + encodeURIComponent(r.id) + '">View Scorecard</a></td>' +
      '</tr>';
    }).join('');
  }

  $('examSearchInput').addEventListener('input', renderExams);
  $('examFilterCategory').addEventListener('change', renderExams);

  fillCategories();
  renderMetrics();
  renderExams();
  renderHistory();
})();
