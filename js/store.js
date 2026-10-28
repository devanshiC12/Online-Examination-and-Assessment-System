/* ==========================================================================
   store.js — Data layer (browser localStorage)
   Users, exams, results, session, in-progress attempt, auto-evaluation, CSV.
   NOTE: Ye demo project hai. Password ka hash sirf obfuscation hai, real
   security nahi — real project me backend + bcrypt use hoga.
   ========================================================================== */
var Store = (function () {
  'use strict';

  var KEY = {
    users: 'ex_users',
    exams: 'ex_exams',
    results: 'ex_results',
    session: 'ex_session',
    attempt: 'ex_attempt_' // + userId
  };

  /* ---------- low level helpers ---------- */
  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function write(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  function uid(prefix) { return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function hash(str) {
    var h = 5381;
    for (var i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
    return String(h);
  }
  function go(url) { window.location.replace(url); } // tests me override ho sakta hai

  /* ---------- seed (pehli baar demo data) ---------- */
  function seed() {
    if (read(KEY.users, null)) return;
    write(KEY.users, [
      { id: 'u_teacher_demo', name: 'Demo Teacher', email: 'teacher@demo.com', role: 'teacher', roll: '', password: hash('teacher123') },
      { id: 'u_student_demo', name: 'Demo Student', email: 'student@demo.com', role: 'student', roll: 'CS2024001', password: hash('student123') }
    ]);
    write(KEY.exams, [
      {
        id: 'ex_html_css', title: 'HTML & CSS Fundamentals', category: 'Web Development',
        duration: 10, passingPercent: 60,
        description: 'Basic HTML tags and CSS properties.',
        createdBy: 'u_teacher_demo', createdByName: 'Demo Teacher', createdAt: new Date().toISOString(),
        questions: [
          { text: 'Which tag is used for the largest heading?', options: ['<h6>', '<head>', '<h1>', '<heading>'], correct: 2, marks: 2, explanation: '<h1> sabse bada heading level hai.' },
          { text: 'CSS stands for?', options: ['Creative Style System', 'Cascading Style Sheets', 'Computer Style Sheets', 'Colorful Style Syntax'], correct: 1, marks: 2, explanation: 'CSS = Cascading Style Sheets.' },
          { text: 'Which CSS property changes the text color?', options: ['font-color', 'text-style', 'color', 'fg-color'], correct: 2, marks: 2, explanation: 'Text ka color `color` property se badalta hai.' },
          { text: 'Which attribute gives an image its alternative text?', options: ['title', 'alt', 'src', 'caption'], correct: 1, marks: 2, explanation: '`alt` screen readers aur broken image ke liye hota hai.' },
          { text: 'Which value of `display` makes an element a flex container?', options: ['block', 'inline', 'flex', 'grid-flex'], correct: 2, marks: 2, explanation: 'display: flex; se flex container banta hai.' }
        ]
      },
      {
        id: 'ex_js_basics', title: 'JavaScript Basics', category: 'Programming',
        duration: 10, passingPercent: 60,
        description: 'Variables, operators, arrays and browser storage.',
        createdBy: 'u_teacher_demo', createdByName: 'Demo Teacher', createdAt: new Date().toISOString(),
        questions: [
          { text: 'Which keyword declares a block-scoped variable?', options: ['var', 'let', 'define', 'dim'], correct: 1, marks: 2, explanation: '`let` (aur `const`) block-scoped hote hain.' },
          { text: 'What does `typeof null` return?', options: ['null', 'undefined', 'object', 'number'], correct: 2, marks: 2, explanation: 'JS ka famous quirk: typeof null === "object".' },
          { text: 'Which method adds an element to the END of an array?', options: ['push()', 'pop()', 'shift()', 'unshift()'], correct: 0, marks: 2, explanation: 'push() end me add karta hai, pop() end se hatata hai.' },
          { text: 'What does the `===` operator check?', options: ['Value only', 'Type only', 'Value and type', 'Reference only'], correct: 2, marks: 2, explanation: '=== strict equality: value + type dono.' },
          { text: 'Which API keeps key-value data even after the browser is closed?', options: ['sessionStorage', 'localStorage', 'document.write', 'prompt()'], correct: 1, marks: 2, explanation: 'localStorage tab/browser band hone par bhi data rakhta hai.' }
        ]
      }
    ]);
    write(KEY.results, []);
  }

  /* ---------- users & session ---------- */
  function publicUser(u) {
    return u ? { id: u.id, name: u.name, email: u.email, role: u.role, roll: u.roll } : null;
  }
  function getUsers() { return read(KEY.users, []); }

  function register(data) {
    var name = (data.name || '').trim();
    var email = (data.email || '').trim().toLowerCase();
    var role = data.role === 'teacher' ? 'teacher' : 'student';
    var roll = (data.roll || '').trim();
    var password = data.password || '';

    if (!name) return { ok: false, error: 'Full name required hai.' };
    if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: 'Valid email daalo.' };
    if (role === 'student' && !roll) return { ok: false, error: 'Student ke liye Roll Number required hai.' };
    if (password.length < 6) return { ok: false, error: 'Password kam se kam 6 characters ka hona chahiye.' };

    var users = getUsers();
    if (users.some(function (u) { return u.email === email; })) {
      return { ok: false, error: 'Is email se account pehle se hai. Login karo.' };
    }
    var user = { id: uid('u'), name: name, email: email, role: role, roll: role === 'student' ? roll : '', password: hash(password) };
    users.push(user);
    write(KEY.users, users);
    localStorage.setItem(KEY.session, user.id);
    return { ok: true, user: publicUser(user) };
  }

  function login(email, password) {
    email = (email || '').trim().toLowerCase();
    var user = getUsers().filter(function (u) { return u.email === email && u.password === hash(password || ''); })[0];
    if (!user) return { ok: false, error: 'Email ya password galat hai.' };
    localStorage.setItem(KEY.session, user.id);
    return { ok: true, user: publicUser(user) };
  }

  function logout() { localStorage.removeItem(KEY.session); }

  function currentUser() {
    var id = localStorage.getItem(KEY.session);
    if (!id) return null;
    var user = getUsers().filter(function (u) { return u.id === id; })[0];
    return publicUser(user);
  }

  function homeFor(user) {
    return user && user.role === 'teacher' ? 'teacher-dashboard.html' : 'student-dashboard.html';
  }

  // Page guard: login nahi hai -> login page; galat role -> apna dashboard
  function requireRole(role) {
    var user = currentUser();
    if (!user) { api.go('login.html'); return null; }
    if (role && user.role !== role) { api.go(homeFor(user)); return null; }
    return user;
  }

  /* ---------- exams ---------- */
  function getExams() { return read(KEY.exams, []); }
  function getExam(id) { return getExams().filter(function (e) { return e.id === id; })[0] || null; }

  function totalMarks(exam) {
    return exam.questions.reduce(function (sum, q) { return sum + (Number(q.marks) || 1); }, 0);
  }

  function createExam(data, user) {
    var exam = {
      id: uid('ex'),
      title: data.title.trim(),
      category: data.category.trim(),
      duration: Number(data.duration),
      passingPercent: Number(data.passingPercent),
      description: (data.description || '').trim(),
      createdBy: user.id,
      createdByName: user.name,
      createdAt: new Date().toISOString(),
      questions: data.questions.map(function (q) {
        return {
          text: q.text.trim(),
          options: q.options.map(function (o) { return o.trim(); }),
          correct: Number(q.correct),
          marks: Number(q.marks) || 1,
          explanation: (q.explanation || '').trim()
        };
      })
    };
    var exams = getExams();
    exams.unshift(exam);
    write(KEY.exams, exams);
    return exam;
  }

  function deleteExam(id, user) {
    var exams = getExams();
    var exam = exams.filter(function (e) { return e.id === id; })[0];
    if (!exam || exam.createdBy !== user.id) return false;
    write(KEY.exams, exams.filter(function (e) { return e.id !== id; }));
    return true;
  }

  /* ---------- in-progress attempt (refresh par timer reset nahi hota) ---------- */
  function getAttempt(userId) { return read(KEY.attempt + userId, null); }
  function saveAttempt(attempt) { write(KEY.attempt + attempt.userId, attempt); }
  function clearAttempt(userId) { localStorage.removeItem(KEY.attempt + userId); }

  function startAttempt(exam, user) {
    var attempt = {
      examId: exam.id, userId: user.id, startedAt: Date.now(),
      answers: {}, review: {}, visited: { 0: true }, current: 0, strikes: 0
    };
    saveAttempt(attempt);
    return attempt;
  }

  /* ---------- results & auto evaluation ---------- */
  function getResults() { return read(KEY.results, []); }
  function getResult(id) { return getResults().filter(function (r) { return r.id === id; })[0] || null; }
  function resultsForUser(userId) {
    return getResults().filter(function (r) { return r.userId === userId; })
      .sort(function (a, b) { return new Date(b.submittedAt) - new Date(a.submittedAt); });
  }
  function resultsForTeacher(teacherId) {
    return getResults().filter(function (r) { return r.teacherId === teacherId; })
      .sort(function (a, b) { return new Date(b.submittedAt) - new Date(a.submittedAt); });
  }
  function hasAttempted(userId, examId) {
    return getResults().some(function (r) { return r.userId === userId && r.examId === examId; });
  }

  // reason: 'manual' | 'time' | 'disqualified'
  function submitAttempt(attempt, reason) {
    var exam = getExam(attempt.examId);
    var user = getUsers().filter(function (u) { return u.id === attempt.userId; })[0];
    var score = 0, total = 0;

    exam.questions.forEach(function (q, i) {
      var marks = Number(q.marks) || 1;
      total += marks;
      if (attempt.answers[i] === q.correct) score += marks;
    });

    var pct = total ? Math.round((score / total) * 1000) / 10 : 0;
    var status = reason === 'disqualified' ? 'DISQUALIFIED' : (pct >= exam.passingPercent ? 'PASSED' : 'FAILED');
    var endedAt = Math.min(Date.now(), attempt.startedAt + exam.duration * 60000);

    var result = {
      id: uid('r'),
      examId: exam.id, examTitle: exam.title, category: exam.category,
      teacherId: exam.createdBy, passingPercent: exam.passingPercent,
      userId: user.id, userName: user.name, userEmail: user.email, roll: user.roll,
      answers: attempt.answers,
      questions: exam.questions, // snapshot: exam delete ho jaye tab bhi scorecard dikhe
      score: score, total: total, percentage: pct,
      passed: status === 'PASSED', status: status,
      timeTaken: Math.max(0, Math.round((endedAt - attempt.startedAt) / 1000)),
      strikes: attempt.strikes || 0,
      submittedAt: new Date().toISOString()
    };

    var results = getResults();
    results.push(result);
    write(KEY.results, results);
    clearAttempt(user.id);
    return result;
  }

  /* ---------- stats & CSV ---------- */
  function summarize(list) {
    if (!list.length) return { count: 0, avg: 0, passRate: 0 };
    var sum = list.reduce(function (s, r) { return s + r.percentage; }, 0);
    var passed = list.filter(function (r) { return r.passed; }).length;
    return {
      count: list.length,
      avg: Math.round(sum / list.length),
      passRate: Math.round((passed / list.length) * 100)
    };
  }

  function toCSV(results) {
    function cell(v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; }
    var rows = [['Student', 'Roll No', 'Email', 'Assessment', 'Category', 'Submitted At', 'Time Taken (sec)', 'Score', 'Total', 'Percentage', 'Status', 'Strikes']];
    results.forEach(function (r) {
      rows.push([r.userName, r.roll, r.userEmail, r.examTitle, r.category, r.submittedAt, r.timeTaken, r.score, r.total, r.percentage, r.status, r.strikes]);
    });
    return rows.map(function (row) { return row.map(cell).join(','); }).join('\r\n');
  }

  seed();

  var api = {
    go: go, register: register, login: login, logout: logout,
    currentUser: currentUser, homeFor: homeFor, requireRole: requireRole,
    getExams: getExams, getExam: getExam, totalMarks: totalMarks,
    createExam: createExam, deleteExam: deleteExam,
    getAttempt: getAttempt, saveAttempt: saveAttempt, startAttempt: startAttempt, clearAttempt: clearAttempt,
    getResults: getResults, getResult: getResult, resultsForUser: resultsForUser,
    resultsForTeacher: resultsForTeacher, hasAttempted: hasAttempted, submitAttempt: submitAttempt,
    summarize: summarize, toCSV: toCSV
  };
  return api;
})();
