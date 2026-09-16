/**
 * Online Examination & Assessment System - Student Dashboard Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const user = Auth.requireAuth('student');
  if (!user) return;

  // Render greeting & details
  const nameElem = document.getElementById('studentName');
  const rollElem = document.getElementById('studentRoll');
  if (nameElem) nameElem.textContent = user.name;
  if (rollElem) rollElem.textContent = `Roll No: ${user.rollNo || 'N/A'}`;

  // Load Assessments & Past History
  await loadAvailableExams();
  await loadStudentHistory(user.id);

  setupFilters();
});

let studentExams = [];
let studentSubmissions = [];

async function loadAvailableExams() {
  const result = await API.getExams('student');
  if (result && result.success && Array.isArray(result.exams)) {
    // Only published exams for students
    studentExams = result.exams.filter(e => e.published !== false);
    renderExamsGrid(studentExams);
    populateCategoryFilter(studentExams);
  }
}

function renderExamsGrid(exams) {
  const container = document.getElementById('studentExamsContainer');
  if (!container) return;

  if (exams.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">🎉</div>
        <h3>No assessments currently available</h3>
        <p>Your instructors have not published any new tests yet. Please check back later.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = exams.map(exam => `
    <div class="exam-card">
      <div class="exam-card-header">
        <span class="badge badge-purple">${escapeHtml(exam.category || 'General')}</span>
        <span class="badge badge-primary">Active</span>
      </div>

      <h3 class="exam-title">${escapeHtml(exam.title)}</h3>
      <p class="exam-desc">${escapeHtml(exam.description || 'Test your knowledge on this subject.')}</p>

      <div class="exam-meta-grid">
        <div class="meta-item">
          <span>⏱️</span>
          <span><strong>${exam.durationMinutes}</strong> Minutes</span>
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
        <button class="btn btn-primary btn-block" onclick="startExamLobby('${exam.id}')">
          Start Assessment →
        </button>
      </div>
    </div>
  `).join('');
}

function populateCategoryFilter(exams) {
  const filter = document.getElementById('examFilterCategory');
  if (!filter) return;
  const categories = [...new Set(exams.map(e => e.category).filter(Boolean))];
  filter.innerHTML = `<option value="all">All Categories</option>` +
    categories.map(cat => `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`).join('');
}

async function loadStudentHistory(studentId) {
  const result = await API.getSubmissions(studentId);
  if (result && result.success && Array.isArray(result.submissions)) {
    studentSubmissions = result.submissions;
    renderHistoryTable(studentSubmissions);
    updateStudentMetrics(studentSubmissions);
  }
}

function updateStudentMetrics(submissions) {
  const totalCompleted = submissions.length;
  const avgScore = totalCompleted > 0
    ? Math.round(submissions.reduce((acc, s) => acc + s.percentage, 0) / totalCompleted)
    : 0;
  const passedCount = submissions.filter(s => s.passed).length;
  const passRate = totalCompleted > 0 ? Math.round((passedCount / totalCompleted) * 100) : 0;

  const totalElem = document.getElementById('metricCompleted');
  const avgElem = document.getElementById('metricAvgScore');
  const passElem = document.getElementById('metricPassRate');

  if (totalElem) totalElem.textContent = totalCompleted;
  if (avgElem) avgElem.textContent = `${avgScore}%`;
  if (passElem) passElem.textContent = `${passRate}%`;
}

function renderHistoryTable(submissions) {
  const tbody = document.getElementById('studentHistoryTableBody');
  if (!tbody) return;

  if (submissions.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">
          You haven't completed any assessments yet. Choose an assessment above to get started!
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = submissions.map(sub => {
    const formattedDate = new Date(sub.submittedAt).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    const mins = Math.floor((sub.timeTakenSeconds || 0) / 60);
    const secs = (sub.timeTakenSeconds || 0) % 60;

    return `
      <tr>
        <td><strong>${escapeHtml(sub.examTitle)}</strong></td>
        <td>${formattedDate}</td>
        <td>${mins}m ${secs}s</td>
        <td>
          <div class="score-progress">
            <span><strong>${sub.score}</strong> / ${sub.totalMarks}</span>
            <div class="progress-bar-bg" style="width: 80px;">
              <div class="progress-bar-fill" style="width: ${sub.percentage}%; background: ${sub.passed ? 'var(--success)' : 'var(--danger)'};"></div>
            </div>
            <span style="font-weight: 700;">${sub.percentage}%</span>
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
          <a href="result.html?submissionId=${sub.id}" class="btn btn-secondary btn-sm">
            View Scorecard ↗
          </a>
        </td>
      </tr>
    `;
  }).join('');
}

// Start Assessment (Lobby Modal / Direct Navigation)
function startExamLobby(examId) {
  const exam = studentExams.find(e => e.id === examId);
  if (!exam) return;

  const modal = document.getElementById('examLobbyModal');
  document.getElementById('lobbyExamTitle').textContent = exam.title;
  document.getElementById('lobbyDuration').textContent = `${exam.durationMinutes} Minutes`;
  document.getElementById('lobbyQuestions').textContent = `${exam.questions.length} Questions`;
  document.getElementById('lobbyTotalMarks').textContent = `${exam.totalMarks} Marks`;
  document.getElementById('lobbyPassing').textContent = `${exam.passingPercentage}% Passing Score`;

  const launchBtn = document.getElementById('launchExamBtn');
  launchBtn.onclick = () => {
    window.location.href = `exam.html?id=${exam.id}`;
  };

  modal.classList.add('active');
}

function closeExamLobbyModal() {
  document.getElementById('examLobbyModal').classList.remove('active');
}

function setupFilters() {
  const searchInput = document.getElementById('examSearchInput');
  const catFilter = document.getElementById('examFilterCategory');

  function applyFilter() {
    const q = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const cat = catFilter ? catFilter.value : 'all';

    const filtered = studentExams.filter(e => {
      const matchQ = e.title.toLowerCase().includes(q) || (e.description && e.description.toLowerCase().includes(q));
      const matchCat = cat === 'all' || e.category === cat;
      return matchQ && matchCat;
    });

    renderExamsGrid(filtered);
  }

  if (searchInput) searchInput.addEventListener('input', applyFilter);
  if (catFilter) catFilter.addEventListener('change', applyFilter);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
