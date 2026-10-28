/* ==========================================================================
   teacher.js — teacher-dashboard.html
   Tabs, stats, exam cards (search + filter), Create Assessment modal with
   dynamic question builder, View Questions modal, delete exam
   ========================================================================== */
(function () {
  'use strict';

  var user = Store.requireRole('teacher');
  if (!user) return;

  var $ = function (id) { return document.getElementById(id); };
  var qCounter = 0;

  $('instructorName').textContent = user.name;

  /* ---------- stats (sirf is teacher ke exams / results) ---------- */
  function myExams() { return Store.getExams().filter(function (e) { return e.createdBy === user.id; }); }

  function renderStats() {
    var s = Store.summarize(Store.resultsForTeacher(user.id));
    $('statTotalExams').textContent = myExams().length;
    $('statTotalSubmissions').textContent = s.count;
    $('statAvgScore').textContent = s.avg + '%';
    $('statPassRate').textContent = s.passRate + '%';
  }

  /* ---------- tabs ---------- */
  function showTab(tab) {
    var exams = tab === 'exams';
    $('viewExamsSection').style.display = exams ? '' : 'none';
    $('viewResultsSection').style.display = exams ? 'none' : '';
    $('examsControls').style.display = exams ? '' : 'none';
    $('resultsControls').style.display = exams ? 'none' : '';
    $('btnTabExams').classList.toggle('active', exams);
    $('btnTabResults').classList.toggle('active', !exams);
  }
  $('btnTabExams').addEventListener('click', function () { showTab('exams'); });
  $('btnTabResults').addEventListener('click', function () { showTab('results'); });

  /* ---------- exam cards ---------- */
  function fillCategories() {
    var current = $('examCategoryFilter').value;
    var cats = [];
    myExams().forEach(function (e) { if (cats.indexOf(e.category) === -1) cats.push(e.category); });
    $('examCategoryFilter').innerHTML = '<option value="">All Categories</option>' +
      cats.map(function (c) { return '<option value="' + UI.esc(c) + '">' + UI.esc(c) + '</option>'; }).join('');
    $('examCategoryFilter').value = cats.indexOf(current) !== -1 ? current : '';
  }

  function renderExams() {
    var q = $('searchExamInput').value.trim().toLowerCase();
    var cat = $('examCategoryFilter').value;
    var exams = myExams().filter(function (e) {
      return (!q || e.title.toLowerCase().indexOf(q) !== -1) && (!cat || e.category === cat);
    });
    var box = $('teacherExamsContainer');

    if (!exams.length) {
      box.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><div class="empty-state-icon">📝</div>' +
        '<h3>No assessments yet</h3><p>"Create New Assessment" dabake pehla exam banao.</p></div>';
      return;
    }

    var results = Store.resultsForTeacher(user.id);
    box.innerHTML = exams.map(function (e) {
      var subs = results.filter(function (r) { return r.examId === e.id; }).length;
      return '<div class="exam-card">' +
        '<div class="exam-card-header"><span class="badge badge-purple">' + UI.esc(e.category) + '</span>' +
        '<span class="badge badge-primary">' + subs + ' submission(s)</span></div>' +
        '<h3 class="exam-title">' + UI.esc(e.title) + '</h3>' +
        '<p class="exam-desc">' + UI.esc(e.description || 'No description provided.') + '</p>' +
        '<div class="exam-meta-grid">' +
          '<div class="meta-item">⏱️ <strong>' + e.duration + ' min</strong></div>' +
          '<div class="meta-item">❓ <strong>' + e.questions.length + ' Qs</strong></div>' +
          '<div class="meta-item">🏆 <strong>' + Store.totalMarks(e) + ' marks</strong></div>' +
          '<div class="meta-item">🎯 <strong>' + e.passingPercent + '% pass</strong></div>' +
        '</div>' +
        '<div class="exam-card-footer">' +
          '<button type="button" class="btn btn-secondary btn-sm" data-view="' + UI.esc(e.id) + '">View Questions</button>' +
          '<button type="button" class="btn btn-outline-danger btn-sm" data-delete="' + UI.esc(e.id) + '">Delete</button>' +
        '</div></div>';
    }).join('');
  }

  function refreshAll() { renderStats(); fillCategories(); renderExams(); }

  $('searchExamInput').addEventListener('input', renderExams);
  $('examCategoryFilter').addEventListener('change', renderExams);

  $('teacherExamsContainer').addEventListener('click', function (e) {
    var viewBtn = e.target.closest('[data-view]');
    var delBtn = e.target.closest('[data-delete]');
    if (viewBtn) openViewModal(viewBtn.getAttribute('data-view'));
    if (delBtn) {
      var exam = Store.getExam(delBtn.getAttribute('data-delete'));
      if (exam && window.confirm('"' + exam.title + '" delete karna hai? Student results safe rahenge.')) {
        Store.deleteExam(exam.id, user);
        UI.toast('Assessment delete ho gaya.', 'success');
        refreshAll();
      }
    }
  });

  /* ---------- view questions modal ---------- */
  function openViewModal(id) {
    var exam = Store.getExam(id);
    if (!exam) return;
    $('viewModalTitle').textContent = exam.title;
    $('viewModalBody').innerHTML = exam.questions.map(function (q, i) {
      var opts = q.options.map(function (o, j) {
        var right = j === q.correct;
        return '<div style="padding:.4rem .7rem;margin-top:.35rem;border-radius:6px;border:1px solid var(--border-color);' +
          (right ? 'background:var(--success-bg);border-color:var(--success);font-weight:600;' : '') + '">' +
          String.fromCharCode(65 + j) + '. ' + UI.esc(o) + (right ? ' ✓' : '') + '</div>';
      }).join('');
      return '<div class="question-item-card"><div class="question-item-header"><strong>Q' + (i + 1) + '. ' + UI.esc(q.text) +
        '</strong><span class="badge badge-primary">' + q.marks + ' mark(s)</span></div>' + opts +
        (q.explanation ? '<p style="margin-top:.6rem;font-size:.85rem;color:var(--text-muted);">💡 ' + UI.esc(q.explanation) + '</p>' : '') +
        '</div>';
    }).join('');
    UI.openModal('viewQuestionsModal');
  }

  /* ---------- create exam: dynamic question builder ---------- */
  function renumber() {
    var cards = $('questionsListContainer').querySelectorAll('[data-q]');
    Array.prototype.forEach.call(cards, function (card, i) {
      card.querySelector('.q-number').textContent = 'Question ' + (i + 1);
    });
  }

  function addQuestion() {
    qCounter++;
    var name = 'correct_' + qCounter;
    var opts = [0, 1, 2, 3].map(function (i) {
      return '<div class="option-row"><input type="radio" name="' + name + '" value="' + i + '" title="Correct answer"' + (i === 0 ? ' checked' : '') + '>' +
        '<input type="text" class="form-input q-opt" placeholder="Option ' + String.fromCharCode(65 + i) + '"></div>';
    }).join('');

    var card = document.createElement('div');
    card.className = 'question-item-card';
    card.setAttribute('data-q', '');
    card.innerHTML =
      '<div class="question-item-header"><strong class="q-number">Question</strong>' +
      '<button type="button" class="btn btn-outline-danger btn-sm" data-remove>Remove</button></div>' +
      '<div class="form-group"><label class="form-label">Question *</label>' +
      '<textarea class="form-textarea q-text" rows="2" placeholder="Question likho..."></textarea></div>' +
      '<label class="form-label">Options * (radio = correct answer)</label>' +
      '<div class="options-builder">' + opts + '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 3fr;gap:1rem;margin-top:.9rem;">' +
        '<div class="form-group"><label class="form-label">Marks</label><input type="number" class="form-input q-marks" value="2" min="1" max="20"></div>' +
        '<div class="form-group"><label class="form-label">Explanation (optional)</label><input type="text" class="form-input q-explain" placeholder="Sahi answer kyun sahi hai"></div>' +
      '</div>';
    $('questionsListContainer').appendChild(card);
    renumber();
  }

  $('addQuestionBtn').addEventListener('click', addQuestion);

  $('questionsListContainer').addEventListener('click', function (e) {
    var rm = e.target.closest('[data-remove]');
    if (!rm) return;
    var cards = $('questionsListContainer').querySelectorAll('[data-q]');
    if (cards.length <= 1) return UI.toast('Kam se kam 1 question zaroori hai.', 'warning');
    rm.closest('[data-q]').remove();
    renumber();
  });

  $('openCreateBtn').addEventListener('click', function () {
    $('createExamForm').reset();
    $('questionsListContainer').innerHTML = '';
    addQuestion();
    UI.openModal('createExamModal');
  });

  $('createExamForm').addEventListener('submit', function (e) {
    e.preventDefault();

    var questions = [];
    var cards = $('questionsListContainer').querySelectorAll('[data-q]');
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      var text = c.querySelector('.q-text').value.trim();
      var options = Array.prototype.map.call(c.querySelectorAll('.q-opt'), function (o) { return o.value.trim(); });
      var checked = c.querySelector('input[type="radio"]:checked');

      if (!text) return UI.toast('Question ' + (i + 1) + ' ka text khaali hai.', 'error');
      if (options.some(function (o) { return !o; })) return UI.toast('Question ' + (i + 1) + ' ke chaaron options bharo.', 'error');
      if (!checked) return UI.toast('Question ' + (i + 1) + ' ka correct answer select karo.', 'error');

      questions.push({
        text: text, options: options, correct: Number(checked.value),
        marks: c.querySelector('.q-marks').value, explanation: c.querySelector('.q-explain').value
      });
    }
    if (!questions.length) return UI.toast('Kam se kam 1 question add karo.', 'error');

    Store.createExam({
      title: $('examTitleInput').value,
      category: $('examCategoryInput').value,
      duration: $('examDurationInput').value,
      passingPercent: $('examPassingInput').value,
      description: $('examDescriptionInput').value,
      questions: questions
    }, user);

    UI.closeModal('createExamModal');
    UI.toast('Assessment publish ho gaya!', 'success');
    refreshAll();
  });

  refreshAll();
})();
