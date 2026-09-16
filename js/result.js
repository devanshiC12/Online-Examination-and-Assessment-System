/**
 * Online Examination & Assessment System - Result Scorecard Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const user = Auth.getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  // Update navbar user badge
  Auth.renderNavbarUser(user);

  const urlParams = new URLSearchParams(window.location.search);
  const subId = urlParams.get('submissionId');

  if (!subId) {
    alert('No assessment result specified.');
    window.location.href = user.role === 'teacher' ? 'teacher-dashboard.html' : 'student-dashboard.html';
    return;
  }

  const res = await API.getSubmissionById(subId);
  if (!res || !res.success || !res.submission) {
    alert('Could not locate scorecard.');
    window.location.href = user.role === 'teacher' ? 'teacher-dashboard.html' : 'student-dashboard.html';
    return;
  }

  renderScorecard(res.submission, user);
});

function renderScorecard(sub, currentUser) {
  // Assessment & Candidate Info
  document.getElementById('resExamTitle').textContent = sub.examTitle;
  document.getElementById('resCandidateName').textContent = sub.studentName;
  document.getElementById('resCandidateRoll').textContent = sub.studentRollNo || 'N/A';
  
  const dateFormatted = new Date(sub.submittedAt).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
  document.getElementById('resDate').textContent = dateFormatted;

  const mins = Math.floor((sub.timeTakenSeconds || 0) / 60);
  const secs = (sub.timeTakenSeconds || 0) % 60;
  document.getElementById('resTimeTaken').textContent = `${mins}m ${secs}s`;

  // Score & Metrics
  document.getElementById('resScore').textContent = `${sub.score} / ${sub.totalMarks}`;
  document.getElementById('resPercentage').textContent = `${sub.percentage}%`;

  const statusBadge = document.getElementById('resStatusBadge');
  if (sub.passed) {
    statusBadge.className = 'badge badge-success';
    statusBadge.textContent = 'PASSED';
  } else {
    statusBadge.className = 'badge badge-danger';
    statusBadge.textContent = 'FAILED';
  }

  const strikeBadge = document.getElementById('resStrikeBadge');
  if (strikeBadge) {
    strikeBadge.textContent = `${sub.strikes || 0} strike(s)`;
    strikeBadge.className = sub.strikes > 0 ? 'badge badge-danger' : 'badge badge-primary';
  }

  // Back button destination based on role
  const backBtn = document.getElementById('backDashboardBtn');
  if (backBtn) {
    backBtn.href = currentUser.role === 'teacher' ? 'teacher-dashboard.html' : 'student-dashboard.html';
    backBtn.textContent = currentUser.role === 'teacher' ? '← Back to Teacher Portal' : '← Back to Student Dashboard';
  }

  // Question Breakdown Review
  renderBreakdown(sub.breakdown || []);
}

function renderBreakdown(breakdown) {
  const container = document.getElementById('questionReviewList');
  if (!container) return;

  if (breakdown.length === 0) {
    container.innerHTML = `<p style="color: var(--text-muted);">No question review data available for this assessment.</p>`;
    return;
  }

  container.innerHTML = breakdown.map((item, idx) => {
    const isCorrect = item.correct;
    const isUnanswered = item.userAnswer === undefined || item.userAnswer === null;
    
    let statusPill = `<span class="badge badge-success">✓ Correct (+${item.pointsAwarded} pts)</span>`;
    if (isUnanswered) {
      statusPill = `<span class="badge badge-warning">⚠ Not Attempted (0 pts)</span>`;
    } else if (!isCorrect) {
      statusPill = `<span class="badge badge-danger">✗ Incorrect (0 pts)</span>`;
    }

    return `
      <div style="background: white; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.5rem; margin-bottom: 1.25rem; box-shadow: var(--shadow-sm);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <strong style="font-size: 1.05rem;">Question ${idx + 1}</strong>
          ${statusPill}
        </div>

        <p style="font-size: 1rem; font-weight: 600; color: var(--text-main); margin-bottom: 1.25rem;">
          ${escapeHtml(item.question)}
        </p>

        <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem;">
          ${(item.options || []).map((opt, optIdx) => {
            const isUserChoice = Number(item.userAnswer) === optIdx;
            const isCorrectChoice = Number(item.correctAnswer) === optIdx;

            let optStyle = 'background: #f8fafc; border: 1px solid var(--border-color); color: var(--text-main);';
            let prefix = '• ';

            if (isCorrectChoice) {
              optStyle = 'background: #ecfdf5; border: 1px solid #10b981; color: #065f46; font-weight: 600;';
              prefix = '✓ Correct: ';
            } else if (isUserChoice && !isCorrect) {
              optStyle = 'background: #fef2f2; border: 1px solid #ef4444; color: #991b1b; font-weight: 600;';
              prefix = '✗ Your Answer: ';
            }

            return `
              <div style="padding: 0.65rem 1rem; border-radius: var(--radius-sm); font-size: 0.925rem; ${optStyle}">
                ${prefix} ${escapeHtml(opt)}
              </div>
            `;
          }).join('')}
        </div>

        ${item.explanation ? `
          <div style="background: #eff6ff; border-left: 3px solid var(--primary); padding: 0.85rem 1rem; border-radius: 4px; font-size: 0.875rem; color: #1e3a8a;">
            <strong>Explanation:</strong> ${escapeHtml(item.explanation)}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
