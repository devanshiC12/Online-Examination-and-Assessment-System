/**
 * Online Examination & Assessment System - Proctored Examination Engine
 */

let currentExam = null;
let currentUser = null;
let currentQuestionIndex = 0;
let answers = {}; // { [qId]: selectedOptionIndex }
let questionStatuses = {}; // { [qId]: 'not_visited' | 'not_answered' | 'answered' | 'review' | 'answered_and_review' }
let strikes = 0;
const MAX_STRIKES = 3;
let timerInterval = null;
let timeRemaining = 0;
let totalDurationSeconds = 0;
let examStartTime = Date.now();
let isSubmitting = false;

document.addEventListener('DOMContentLoaded', async () => {
  currentUser = Auth.requireAuth('student');
  if (!currentUser) return;

  const urlParams = new URLSearchParams(window.location.search);
  const examId = urlParams.get('id');

  if (!examId) {
    alert('No assessment specified.');
    window.location.href = 'student-dashboard.html';
    return;
  }

  // Load Exam
  const result = await API.getExamById(examId);
  if (!result || !result.success || !result.exam) {
    alert('Failed to load examination. Returning to dashboard.');
    window.location.href = 'student-dashboard.html';
    return;
  }

  currentExam = result.exam;
  initializeExam();
});

function initializeExam() {
  // Set Candidate & Exam Header Info
  document.getElementById('examTopTitle').textContent = currentExam.title;
  document.getElementById('examCategoryBadge').textContent = currentExam.category || 'General';
  document.getElementById('studentDisplayName').textContent = currentUser.name;
  document.getElementById('studentDisplayRoll').textContent = currentUser.rollNo || 'Candidate';

  // Initialize Questions State
  currentExam.questions.forEach((q, idx) => {
    questionStatuses[q.id] = idx === 0 ? 'not_answered' : 'not_visited';
  });

  // Setup Timer
  totalDurationSeconds = (currentExam.durationMinutes || 15) * 60;
  timeRemaining = totalDurationSeconds;
  examStartTime = Date.now();
  startTimer();

  // Setup Anti-Cheat / Proctoring Listeners
  setupProctoring();

  // Render First Question and Palette
  renderPalette();
  displayQuestion(0);
}

// ==========================================
// TIMER ENGINE
// ==========================================
function startTimer() {
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      showToast('Time has expired! Automatically submitting your test...', 'warning');
      submitExam(true, 'Time Expired');
    }
  }, 1000);
}

function updateTimerDisplay() {
  const timerElem = document.getElementById('examTimer');
  const timerWrap = document.getElementById('timerWrap');
  if (!timerElem) return;

  const mins = Math.floor(Math.max(0, timeRemaining) / 60);
  const secs = Math.max(0, timeRemaining) % 60;
  timerElem.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // Visual cues
  if (timeRemaining <= 60) {
    timerWrap.className = 'exam-timer-wrap timer-danger';
  } else if (timeRemaining <= 300) {
    timerWrap.className = 'exam-timer-wrap timer-warning';
  } else {
    timerWrap.className = 'exam-timer-wrap';
  }
}

// ==========================================
// ANTI-CHEATING & INTEGRITY SYSTEM
// ==========================================
function setupProctoring() {
  // Prevent context menu (right-click inspect)
  document.addEventListener('contextmenu', e => {
    e.preventDefault();
    recordStrike('Right-click context menu is restricted during the exam.');
  });

  // Prevent keyboard copy/paste/inspection shortcuts
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'u', 's', 'p'].includes(e.key.toLowerCase())) {
      e.preventDefault();
      recordStrike('Copy, paste, and developer inspection shortcuts are prohibited.');
    }
  });

  // Tab switch & minimize detection
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && !isSubmitting) {
      recordStrike('Tab switch or window minimization detected!');
    }
  });
}

function recordStrike(reason) {
  if (isSubmitting) return;

  strikes++;
  const strikeBadge = document.getElementById('strikeCounterBadge');
  if (strikeBadge) {
    strikeBadge.innerHTML = `🛡️ Strikes: <strong>${strikes}/${MAX_STRIKES}</strong>`;
  }

  const modal = document.getElementById('strikeWarningModal');
  const reasonElem = document.getElementById('strikeWarningReason');
  const countElem = document.getElementById('strikeWarningCount');

  if (reasonElem) reasonElem.textContent = reason;
  if (countElem) countElem.textContent = `${strikes} of ${MAX_STRIKES}`;

  if (modal) modal.classList.add('active');

  if (strikes >= MAX_STRIKES) {
    setTimeout(() => {
      alert('Maximum anti-cheating violation strikes reached (3/3). Your exam is being submitted immediately.');
      submitExam(true, 'Disqualified due to anti-cheating violations');
    }, 500);
  }
}

function closeStrikeModal() {
  const modal = document.getElementById('strikeWarningModal');
  if (modal) modal.classList.remove('active');
}

// Toggle Fullscreen Mode
function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.warn('Fullscreen request denied:', err);
    });
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

// ==========================================
// QUESTION DISPLAY & NAVIGATION
// ==========================================
function displayQuestion(index) {
  if (index < 0 || index >= currentExam.questions.length) return;

  currentQuestionIndex = index;
  const q = currentExam.questions[index];

  // Mark visited
  if (questionStatuses[q.id] === 'not_visited') {
    questionStatuses[q.id] = 'not_answered';
  }

  // Update question header
  document.getElementById('questionIndexText').textContent = `Question ${index + 1} of ${currentExam.questions.length}`;
  document.getElementById('questionPointsBadge').textContent = `${q.points || 1} Marks`;
  document.getElementById('questionBodyText').textContent = q.question;

  // Render Options
  const optionsContainer = document.getElementById('questionOptionsContainer');
  optionsContainer.innerHTML = '';

  const selectedAnswer = answers[q.id];

  q.options.forEach((opt, optIdx) => {
    const isChecked = selectedAnswer !== undefined && Number(selectedAnswer) === optIdx;
    const optionRow = document.createElement('div');
    optionRow.className = `option-item ${isChecked ? 'selected' : ''}`;
    optionRow.onclick = () => selectOption(q.id, optIdx);

    const letter = String.fromCharCode(65 + optIdx); // A, B, C, D

    optionRow.innerHTML = `
      <div class="option-indicator">${letter}</div>
      <div class="option-label-text">${escapeHtml(opt)}</div>
    `;

    optionsContainer.appendChild(optionRow);
  });

  // Update Nav Buttons State
  const prevBtn = document.getElementById('prevQuestionBtn');
  const nextBtn = document.getElementById('nextQuestionBtn');
  prevBtn.disabled = index === 0;
  nextBtn.textContent = index === currentExam.questions.length - 1 ? 'Review & Submit' : 'Next Question →';

  updatePaletteHighlight();
  updatePaletteSummary();
}

function selectOption(qId, optIdx) {
  answers[qId] = optIdx;

  // Update status
  if (questionStatuses[qId] === 'review' || questionStatuses[qId] === 'answered_and_review') {
    questionStatuses[qId] = 'answered_and_review';
  } else {
    questionStatuses[qId] = 'answered';
  }

  // Refresh current view & palette
  displayQuestion(currentQuestionIndex);
  renderPalette();
}

function clearResponse() {
  const q = currentExam.questions[currentQuestionIndex];
  delete answers[q.id];

  if (questionStatuses[q.id] === 'answered_and_review') {
    questionStatuses[q.id] = 'review';
  } else {
    questionStatuses[q.id] = 'not_answered';
  }

  displayQuestion(currentQuestionIndex);
  renderPalette();
}

function markForReview() {
  const q = currentExam.questions[currentQuestionIndex];
  const isAnswered = answers[q.id] !== undefined;

  if (questionStatuses[q.id] === 'review' || questionStatuses[q.id] === 'answered_and_review') {
    // Unmark
    questionStatuses[q.id] = isAnswered ? 'answered' : 'not_answered';
    showToast('Unmarked question from review', 'info');
  } else {
    // Mark
    questionStatuses[q.id] = isAnswered ? 'answered_and_review' : 'review';
    showToast('Marked question for review', 'warning');
  }

  renderPalette();
  updatePaletteHighlight();
}

function nextQuestion() {
  if (currentQuestionIndex === currentExam.questions.length - 1) {
    openSubmitConfirmationModal();
  } else {
    displayQuestion(currentQuestionIndex + 1);
  }
}

function prevQuestion() {
  if (currentQuestionIndex > 0) {
    displayQuestion(currentQuestionIndex - 1);
  }
}

// ==========================================
// QUESTION PALETTE
// ==========================================
function renderPalette() {
  const grid = document.getElementById('questionPaletteGrid');
  if (!grid) return;

  grid.innerHTML = currentExam.questions.map((q, idx) => {
    const status = questionStatuses[q.id] || 'not_visited';
    let statusClass = 'status-not-visited';

    if (status === 'answered') statusClass = 'status-answered';
    else if (status === 'review') statusClass = 'status-review';
    else if (status === 'answered_and_review') statusClass = 'status-ans-review';
    else if (status === 'not_answered') statusClass = 'status-not-answered';

    const isActive = idx === currentQuestionIndex;

    return `
      <button 
        type="button" 
        class="palette-btn ${statusClass} ${isActive ? 'active' : ''}" 
        id="pal_btn_${idx}"
        onclick="displayQuestion(${idx})"
        title="Question ${idx + 1}: ${status.replace('_', ' ')}">
        ${idx + 1}
      </button>
    `;
  }).join('');

  updatePaletteSummary();
}

function updatePaletteHighlight() {
  document.querySelectorAll('.palette-btn').forEach((btn, idx) => {
    if (idx === currentQuestionIndex) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function updatePaletteSummary() {
  let answered = 0;
  let review = 0;
  let ansReview = 0;
  let notAnswered = 0;
  let notVisited = 0;

  currentExam.questions.forEach(q => {
    const s = questionStatuses[q.id];
    if (s === 'answered') answered++;
    else if (s === 'review') review++;
    else if (s === 'answered_and_review') ansReview++;
    else if (s === 'not_answered') notAnswered++;
    else notVisited++;
  });

  const ansElem = document.getElementById('sumAnswered');
  const revElem = document.getElementById('sumReview');
  const unansElem = document.getElementById('sumUnanswered');

  if (ansElem) ansElem.textContent = answered + ansReview;
  if (revElem) revElem.textContent = review + ansReview;
  if (unansElem) unansElem.textContent = notAnswered + notVisited;
}

// ==========================================
// SUBMISSION FLOW
// ==========================================
function openSubmitConfirmationModal() {
  let answeredCount = Object.keys(answers).length;
  let totalCount = currentExam.questions.length;
  let unansweredCount = totalCount - answeredCount;

  document.getElementById('confirmTotalQuestions').textContent = totalCount;
  document.getElementById('confirmAnsweredQuestions').textContent = answeredCount;
  document.getElementById('confirmUnansweredQuestions').textContent = unansweredCount;

  const modal = document.getElementById('submitConfirmModal');
  if (modal) modal.classList.add('active');
}

function closeSubmitConfirmModal() {
  const modal = document.getElementById('submitConfirmModal');
  if (modal) modal.classList.remove('active');
}

async function submitExam(forced = false, forcedReason = '') {
  if (isSubmitting) return;
  isSubmitting = true;

  if (timerInterval) clearInterval(timerInterval);

  const timeTakenSeconds = Math.max(1, Math.round((Date.now() - examStartTime) / 1000));

  const payload = {
    examId: currentExam.id,
    studentId: currentUser.id,
    studentName: currentUser.name,
    studentRollNo: currentUser.rollNo,
    answers,
    timeTakenSeconds,
    strikes,
    submittedReason: forced ? forcedReason : 'Normal Submission'
  };

  try {
    const res = await API.submitExam(payload);
    if (res && res.success && res.submission) {
      // Redirect to Result Scorecard
      window.location.href = `result.html?submissionId=${res.submission.id}`;
    } else {
      alert('Could not submit assessment: ' + (res.message || 'Unknown error'));
      isSubmitting = false;
    }
  } catch (err) {
    console.error('Submission error:', err);
    alert('An error occurred while submitting. Please try again.');
    isSubmitting = false;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
