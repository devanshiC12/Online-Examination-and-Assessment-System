/**
 * Online Examination & Assessment System - Teacher Dashboard Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const user = Auth.requireAuth('teacher');
  if (!user) return;

  // Set instructor greeting
  const greetingElem = document.getElementById('instructorName');
  if (greetingElem) greetingElem.textContent = user.name;

  // Initialize data
  await loadDashboardMetrics();
  await loadExamsList();
  await loadSubmissionsList();

  // Setup Event Listeners
  setupEventListeners();
});

let allExams = [];
let allSubmissions = [];

// ==========================================
// METRICS & STATS
// ==========================================
async function loadDashboardMetrics() {
  const result = await API.getTeacherStats();
  if (result && result.success && result.stats) {
    const { totalExams, totalSubmissions, avgScore, passRate } = result.stats;
    document.getElementById('statTotalExams').textContent = totalExams || 0;
    document.getElementById('statTotalSubmissions').textContent = totalSubmissions || 0;
    document.getElementById('statAvgScore').textContent = `${avgScore || 0}%`;
    document.getElementById('statPassRate').textContent = `${passRate || 0}%`;
  }
}

// ==========================================
// EXAMS MANAGEMENT
// ==========================================
async function loadExamsList() {
  const result = await API.getExams();
  if (result && result.success && Array.isArray(result.exams)) {
    allExams = result.exams;
    renderExamsGrid(allExams);
    populateCategoryFilter(allExams);
  }
}

function renderExamsGrid(exams) {
  const container = document.getElementById('teacherExamsContainer');
  if (!container) return;

  if (exams.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">📝</div>
        <h3>No assessments found</h3>
        <p>Click "Create New Assessment" to build your first online exam.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = exams.map(exam => `
    <div class="exam-card" id="card-${exam.id}">
      <div class="exam-card-header">
        <span class="badge badge-purple">${escapeHtml(exam.category || 'General')}</span>
        <span class="badge ${exam.published ? 'badge-success' : 'badge-warning'}">
          ${exam.published ? 'Published' : 'Draft'}
        </span>
      </div>

      <h3 class="exam-title">${escapeHtml(exam.title)}</h3>
      <p class="exam-desc">${escapeHtml(exam.description || 'No description provided.')}</p>

      <div class="exam-meta-grid">
        <div class="meta-item">
          <span>⏱️</span>
          <span><strong>${exam.durationMinutes}</strong> mins</span>
        </div>
        <div class="meta-item">
          <span>❓</span>
          <span><strong>${exam.questions ? exam.questions.length : 0}</strong> Questions</span>
        </div>
        <div class="meta-item">
          <span>🎯</span>
          <span>Pass: <strong>${exam.passingPercentage}%</strong></span>
        </div>
        <div class="meta-item">
          <span>🏆</span>
          <span>Total: <strong>${exam.totalMarks}</strong> pts</span>
        </div>
      </div>

      <div class="exam-card-footer">
        <button class="btn btn-secondary btn-sm" onclick="viewExamDetails('${exam.id}')">
          View Questions
        </button>
        <div style="display: flex; gap: 0.4rem;">
          <button class="btn btn-secondary btn-sm" onclick="togglePublishStatus('${exam.id}', ${!exam.published})">
            ${exam.published ? 'Unpublish' : 'Publish'}
          </button>
          <button class="btn btn-outline-danger btn-sm" onclick="deleteExamPrompt('${exam.id}', '${escapeHtml(exam.title)}')">
            🗑️
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function populateCategoryFilter(exams) {
  const filter = document.getElementById('examCategoryFilter');
  if (!filter) return;
  const categories = [...new Set(exams.map(e => e.category).filter(Boolean))];
  filter.innerHTML = `<option value="all">All Categories</option>` +
    categories.map(cat => `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`).join('');
}

// ==========================================
// SUBMISSIONS & ANALYTICS
// ==========================================
async function loadSubmissionsList() {
  const result = await API.getSubmissions();
  if (result && result.success && Array.isArray(result.submissions)) {
    allSubmissions = result.submissions;
    renderSubmissionsTable(allSubmissions);
  }
}

function renderSubmissionsTable(submissions) {
  const tbody = document.getElementById('submissionsTableBody');
  if (!tbody) return;

  if (submissions.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; padding: 2.5rem; color: var(--text-muted);">
          No student submissions recorded yet.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = submissions.map(sub => {
    const formattedDate = new Date(sub.submittedAt).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    const mins = Math.floor((sub.timeTakenSeconds || 0) / 60);
    const secs = (sub.timeTakenSeconds || 0) % 60;
    const timeFormatted = `${mins}m ${secs}s`;

    return `
      <tr>
        <td>
          <strong>${escapeHtml(sub.studentName)}</strong>
          <div style="font-size: 0.775rem; color: var(--text-muted);">${escapeHtml(sub.studentRollNo || 'N/A')}</div>
        </td>
        <td>${escapeHtml(sub.examTitle)}</td>
        <td>${formattedDate}</td>
        <td>${timeFormatted}</td>
        <td>
          <div class="score-progress">
            <span><strong>${sub.score}</strong> / ${sub.totalMarks}</span>
            <div class="progress-bar-bg" style="width: 80px;">
              <div class="progress-bar-fill" style="width: ${sub.percentage}%; background: ${sub.passed ? 'var(--success)' : 'var(--danger)'};"></div>
            </div>
            <span style="font-weight: 700; font-size: 0.825rem;">${sub.percentage}%</span>
          </div>
        </td>
        <td>
          <span class="badge ${sub.passed ? 'badge-success' : 'badge-danger'}">
            ${sub.passed ? 'PASSED' : 'FAILED'}
          </span>
        </td>
        <td>
          <span class="badge ${sub.strikes > 0 ? 'badge-danger' : 'badge-primary'}">
            ${sub.strikes || 0} strike(s)
          </span>
        </td>
        <td>
          <a href="result.html?submissionId=${sub.id}" class="btn btn-secondary btn-sm" target="_blank">
            Scorecard ↗
          </a>
        </td>
      </tr>
    `;
  }).join('');
}

// ==========================================
// EXAM CREATION (DYNAMIC FORM)
// ==========================================
let questionCount = 0;

function openCreateExamModal() {
  const modal = document.getElementById('createExamModal');
  const form = document.getElementById('createExamForm');
  const container = document.getElementById('questionsListContainer');
  form.reset();
  container.innerHTML = '';
  questionCount = 0;

  // Add 2 initial question templates
  addQuestionField();
  addQuestionField();

  modal.classList.add('active');
}

function closeCreateExamModal() {
  document.getElementById('createExamModal').classList.remove('active');
}

function addQuestionField() {
  questionCount++;
  const container = document.getElementById('questionsListContainer');
  const qId = questionCount;

  const card = document.createElement('div');
  card.className = 'question-item-card';
  card.id = `qCard_${qId}`;

  card.innerHTML = `
    <div class="question-item-header">
      <strong>Question #${qId}</strong>
      <button type="button" class="btn btn-outline-danger btn-sm" onclick="removeQuestionField(${qId})">Remove</button>
    </div>

    <div class="form-group">
      <label class="form-label">Question Text *</label>
      <input type="text" class="form-input q-text" placeholder="e.g., What is the time complexity of quicksort?" required>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
      <div>
        <label class="form-label">Question Type</label>
        <select class="form-select q-type" onchange="handleQuestionTypeChange(${qId}, this.value)">
          <option value="single">Multiple Choice (Single Answer)</option>
          <option value="boolean">True / False</option>
        </select>
      </div>
      <div>
        <label class="form-label">Points (Marks)</label>
        <input type="number" class="form-input q-points" value="2" min="1" max="10" required>
      </div>
    </div>

    <div class="options-wrapper" id="optionsWrap_${qId}">
      <label class="form-label">Options (Select radio for the correct answer) *</label>
      <div class="options-builder">
        <div class="option-row">
          <input type="radio" name="correct_${qId}" value="0" checked>
          <input type="text" class="form-input opt-val" placeholder="Option 1" required>
        </div>
        <div class="option-row">
          <input type="radio" name="correct_${qId}" value="1">
          <input type="text" class="form-input opt-val" placeholder="Option 2" required>
        </div>
        <div class="option-row">
          <input type="radio" name="correct_${qId}" value="2">
          <input type="text" class="form-input opt-val" placeholder="Option 3">
        </div>
        <div class="option-row">
          <input type="radio" name="correct_${qId}" value="3">
          <input type="text" class="form-input opt-val" placeholder="Option 4">
        </div>
      </div>
    </div>

    <div class="form-group" style="margin-top: 1rem;">
      <label class="form-label">Explanation / Solution Note (Shown after test)</label>
      <textarea class="form-textarea q-explanation" rows="2" placeholder="Explain why this answer is correct..."></textarea>
    </div>
  `;

  container.appendChild(card);
}

function removeQuestionField(qId) {
  const card = document.getElementById(`qCard_${qId}`);
  if (card) card.remove();
}

function handleQuestionTypeChange(qId, type) {
  const wrap = document.getElementById(`optionsWrap_${qId}`);
  if (type === 'boolean') {
    wrap.innerHTML = `
      <label class="form-label">Select Correct Option *</label>
      <div class="options-builder">
        <div class="option-row">
          <input type="radio" name="correct_${qId}" value="0" checked>
          <input type="text" class="form-input opt-val" value="True" readonly>
        </div>
        <div class="option-row">
          <input type="radio" name="correct_${qId}" value="1">
          <input type="text" class="form-input opt-val" value="False" readonly>
        </div>
      </div>
    `;
  } else {
    wrap.innerHTML = `
      <label class="form-label">Options (Select radio for the correct answer) *</label>
      <div class="options-builder">
        <div class="option-row">
          <input type="radio" name="correct_${qId}" value="0" checked>
          <input type="text" class="form-input opt-val" placeholder="Option 1" required>
        </div>
        <div class="option-row">
          <input type="radio" name="correct_${qId}" value="1">
          <input type="text" class="form-input opt-val" placeholder="Option 2" required>
        </div>
        <div class="option-row">
          <input type="radio" name="correct_${qId}" value="2">
          <input type="text" class="form-input opt-val" placeholder="Option 3">
        </div>
        <div class="option-row">
          <input type="radio" name="correct_${qId}" value="3">
          <input type="text" class="form-input opt-val" placeholder="Option 4">
        </div>
      </div>
    `;
  }
}

// Handle Form Submission
async function handleCreateExamSubmit(e) {
  e.preventDefault();
  const user = Auth.getCurrentUser();

  const title = document.getElementById('examTitleInput').value.trim();
  const category = document.getElementById('examCategoryInput').value.trim();
  const duration = parseInt(document.getElementById('examDurationInput').value, 10);
  const passingPercentage = parseInt(document.getElementById('examPassingInput').value, 10);
  const description = document.getElementById('examDescriptionInput').value.trim();

  // Gather questions
  const qCards = document.querySelectorAll('.question-item-card');
  if (qCards.length === 0) {
    showToast('Please add at least one question to the exam', 'error');
    return;
  }

  const questions = [];
  for (let card of qCards) {
    const text = card.querySelector('.q-text').value.trim();
    const type = card.querySelector('.q-type').value;
    const points = parseInt(card.querySelector('.q-points').value, 10) || 1;
    const explanation = card.querySelector('.q-explanation').value.trim();

    const optInputs = card.querySelectorAll('.opt-val');
    const options = Array.from(optInputs).map(inp => inp.value.trim()).filter(Boolean);

    if (options.length < 2) {
      showToast('Each question must have at least 2 options', 'warning');
      return;
    }

    const checkedRadio = card.querySelector('input[type="radio"]:checked');
    const correctAnswer = checkedRadio ? parseInt(checkedRadio.value, 10) : 0;

    questions.push({
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type,
      question: text,
      options,
      correctAnswer,
      points,
      explanation
    });
  }

  const payload = {
    title,
    category,
    durationMinutes: duration,
    passingPercentage,
    description,
    creatorId: user.id,
    creatorName: user.name,
    published: true,
    questions
  };

  const res = await API.createExam(payload);
  if (res && res.success) {
    showToast('Exam created and published successfully!', 'success');
    closeCreateExamModal();
    await loadExamsList();
    await loadDashboardMetrics();
  } else {
    showToast(res.message || 'Failed to create exam', 'error');
  }
}

// ==========================================
// ACTIONS: VIEW QUESTIONS, PUBLISH, DELETE
// ==========================================
async function viewExamDetails(examId) {
  const result = await API.getExamById(examId, true);
  if (!result || !result.success || !result.exam) {
    showToast('Could not load exam details', 'error');
    return;
  }

  const exam = result.exam;
  const modal = document.getElementById('viewQuestionsModal');
  document.getElementById('viewModalTitle').textContent = exam.title;

  const body = document.getElementById('viewModalBody');
  body.innerHTML = `
    <div style="margin-bottom: 1.25rem; display: flex; gap: 1rem; flex-wrap: wrap;">
      <span class="badge badge-purple">${escapeHtml(exam.category)}</span>
      <span class="badge badge-primary">⏱️ ${exam.durationMinutes} mins</span>
      <span class="badge badge-success">🎯 Pass: ${exam.passingPercentage}%</span>
      <span class="badge badge-warning">🏆 Total: ${exam.totalMarks} Marks</span>
    </div>
    <div style="display: flex; flex-direction: column; gap: 1.25rem;">
      ${exam.questions.map((q, i) => `
        <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <strong>Q${i + 1}. ${escapeHtml(q.question)}</strong>
            <span class="badge badge-primary">${q.points} pt(s)</span>
          </div>
          <div style="margin: 0.5rem 0; display: flex; flex-direction: column; gap: 0.35rem;">
            ${q.options.map((opt, optIdx) => `
              <div style="font-size: 0.9rem; padding: 0.35rem 0.6rem; border-radius: 4px; ${optIdx === q.correctAnswer ? 'background: #dcfce7; color: #166534; font-weight: 600;' : ''}">
                ${optIdx === q.correctAnswer ? '✓ ' : '• '} ${escapeHtml(opt)}
              </div>
            `).join('')}
          </div>
          ${q.explanation ? `<div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.4rem; border-top: 1px dashed var(--border-color); padding-top: 0.4rem;">💡 <em>${escapeHtml(q.explanation)}</em></div>` : ''}
        </div>
      `).join('')}
    </div>
  `;

  modal.classList.add('active');
}

function closeViewQuestionsModal() {
  document.getElementById('viewQuestionsModal').classList.remove('active');
}

async function togglePublishStatus(examId, newStatus) {
  const res = await API.updateExam(examId, { published: newStatus });
  if (res && res.success) {
    showToast(`Exam ${newStatus ? 'Published' : 'set to Draft'}`, 'success');
    await loadExamsList();
  }
}

async function deleteExamPrompt(examId, examTitle) {
  if (confirm(`Are you sure you want to delete the exam "${examTitle}"? This cannot be undone.`)) {
    const res = await API.deleteExam(examId);
    if (res && res.success) {
      showToast('Exam deleted successfully', 'success');
      await loadExamsList();
      await loadDashboardMetrics();
    }
  }
}

// ==========================================
// EXPORT TO CSV
// ==========================================
function exportSubmissionsToCSV() {
  if (allSubmissions.length === 0) {
    showToast('No submissions to export', 'warning');
    return;
  }

  const headers = ['Submission ID', 'Student Name', 'Roll Number', 'Exam Title', 'Score', 'Total Marks', 'Percentage', 'Status', 'Strikes', 'Time (seconds)', 'Date'];
  
  const rows = allSubmissions.map(s => [
    `"${s.id}"`,
    `"${s.studentName.replace(/"/g, '""')}"`,
    `"${(s.studentRollNo || '').replace(/"/g, '""')}"`,
    `"${s.examTitle.replace(/"/g, '""')}"`,
    s.score,
    s.totalMarks,
    `${s.percentage}%`,
    s.passed ? 'PASSED' : 'FAILED',
    s.strikes || 0,
    s.timeTakenSeconds || 0,
    `"${new Date(s.submittedAt).toISOString()}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `assessment_results_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  showToast('Results exported as CSV file', 'success');
}

// ==========================================
// FILTER & SEARCH
// ==========================================
function setupEventListeners() {
  const searchInput = document.getElementById('searchExamInput');
  const catFilter = document.getElementById('examCategoryFilter');
  const form = document.getElementById('createExamForm');

  if (form) {
    form.addEventListener('submit', handleCreateExamSubmit);
  }

  function applyFilters() {
    const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const cat = catFilter ? catFilter.value : 'all';

    const filtered = allExams.filter(e => {
      const matchQuery = e.title.toLowerCase().includes(query) || (e.description && e.description.toLowerCase().includes(query));
      const matchCat = cat === 'all' || e.category === cat;
      return matchQuery && matchCat;
    });

    renderExamsGrid(filtered);
  }

  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (catFilter) catFilter.addEventListener('change', applyFilters);
}

// Utility
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
