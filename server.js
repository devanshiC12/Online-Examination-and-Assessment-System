/**
 * Online Examination and Assessment System - Backend Server
 * Built with Node.js and JSON Database Persistence.
 * 
 * Works with Express (if installed) or natively with Node.js built-in 'http' & 'fs'
 * for ZERO-DEPENDENCY instant execution out of the box!
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const PUBLIC_DIR = path.join(__dirname, 'public');

// File paths for JSON database
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const EXAMS_FILE = path.join(DATA_DIR, 'exams.json');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');

// Ensure data directory and files exist
function ensureDatabase() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(EXAMS_FILE)) {
    fs.writeFileSync(EXAMS_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(SUBMISSIONS_FILE)) {
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify([], null, 2));
  }
}

ensureDatabase();

// JSON Helper functions
function readJson(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
    return [];
  }
}

function writeJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err.message);
    return false;
  }
}

// MIME types for static asset serving
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Request Parser Helper
function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

// Create HTTP Server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  // ==========================================
  // API ROUTING
  // ==========================================

  // 1. Health Check
  if (pathname === '/api/health' && method === 'GET') {
    return sendJson(res, 200, { status: 'healthy', timestamp: new Date().toISOString() });
  }

  // 2. Authentication: Login
  if (pathname === '/api/auth/login' && method === 'POST') {
    const { email, password } = await parseBody(req);
    const users = readJson(USERS_FILE);
    const user = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase().trim());

    if (!user || user.password !== password) {
      return sendJson(res, 401, { success: false, message: 'Invalid email or password' });
    }

    const { password: _, ...safeUser } = user;
    return sendJson(res, 200, { success: true, user: safeUser });
  }

  // 3. Authentication: Register
  if (pathname === '/api/auth/register' && method === 'POST') {
    const { name, email, password, role, rollNo, department } = await parseBody(req);
    
    if (!name || !email || !password) {
      return sendJson(res, 400, { success: false, message: 'Name, email, and password are required' });
    }

    const users = readJson(USERS_FILE);
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase().trim())) {
      return sendJson(res, 409, { success: false, message: 'User with this email already exists' });
    }

    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: role === 'teacher' ? 'teacher' : 'student',
      rollNo: rollNo ? rollNo.trim() : `STU-${Math.floor(1000 + Math.random() * 9000)}`,
      department: department ? department.trim() : 'General',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    writeJson(USERS_FILE, users);

    const { password: _, ...safeUser } = newUser;
    return sendJson(res, 201, { success: true, user: safeUser, message: 'Account registered successfully' });
  }

  // 4. Exams: List All Exams
  if (pathname === '/api/exams' && method === 'GET') {
    const exams = readJson(EXAMS_FILE);
    const isStudent = parsedUrl.query.role === 'student';

    // If requested by a student, strip answer keys and explanations to prevent cheating
    const processedExams = exams.map(exam => {
      if (isStudent) {
        return {
          ...exam,
          questions: exam.questions.map(q => {
            const { correctAnswer, explanation, ...safeQ } = q;
            return safeQ;
          })
        };
      }
      return exam;
    });

    return sendJson(res, 200, { success: true, exams: processedExams });
  }

  // 5. Exams: Get Single Exam
  if (pathname.startsWith('/api/exams/') && method === 'GET') {
    const parts = pathname.split('/');
    const examId = parts[3];
    const isFullTeacherView = parts[4] === 'full';

    const exams = readJson(EXAMS_FILE);
    const exam = exams.find(e => e.id === examId);

    if (!exam) {
      return sendJson(res, 404, { success: false, message: 'Assessment not found' });
    }

    if (!isFullTeacherView) {
      const sanitized = {
        ...exam,
        questions: exam.questions.map(q => {
          const { correctAnswer, explanation, ...safeQ } = q;
          return safeQ;
        })
      };
      return sendJson(res, 200, { success: true, exam: sanitized });
    }

    return sendJson(res, 200, { success: true, exam });
  }

  // 6. Exams: Create New Exam (Teacher)
  if (pathname === '/api/exams' && method === 'POST') {
    const examData = await parseBody(req);
    if (!examData.title || !Array.isArray(examData.questions) || examData.questions.length === 0) {
      return sendJson(res, 400, { success: false, message: 'Title and at least one question are required' });
    }

    const totalMarks = examData.questions.reduce((sum, q) => sum + (Number(q.points) || 1), 0);

    const newExam = {
      id: `exam_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: examData.title.trim(),
      description: (examData.description || '').trim(),
      category: (examData.category || 'General Assessment').trim(),
      durationMinutes: Number(examData.durationMinutes) || 15,
      passingPercentage: Number(examData.passingPercentage) || 50,
      totalMarks: totalMarks,
      creatorId: examData.creatorId || 'usr_teacher_1',
      creatorName: examData.creatorName || 'Instructor',
      published: examData.published !== false,
      createdAt: new Date().toISOString(),
      questions: examData.questions.map((q, idx) => ({
        id: q.id || `q_${idx + 1}_${Date.now()}`,
        type: q.type || 'single',
        question: q.question.trim(),
        options: Array.isArray(q.options) ? q.options : [],
        correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : 0,
        points: Number(q.points) || 1,
        explanation: (q.explanation || '').trim()
      }))
    };

    const exams = readJson(EXAMS_FILE);
    exams.unshift(newExam);
    writeJson(EXAMS_FILE, exams);

    return sendJson(res, 201, { success: true, exam: newExam, message: 'Exam created successfully' });
  }

  // 7. Exams: Update Exam (Teacher)
  if (pathname.startsWith('/api/exams/') && method === 'PUT') {
    const examId = pathname.split('/')[3];
    const updateData = await parseBody(req);
    const exams = readJson(EXAMS_FILE);
    const index = exams.findIndex(e => e.id === examId);

    if (index === -1) {
      return sendJson(res, 404, { success: false, message: 'Exam not found' });
    }

    exams[index] = {
      ...exams[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    writeJson(EXAMS_FILE, exams);
    return sendJson(res, 200, { success: true, exam: exams[index], message: 'Exam updated' });
  }

  // 8. Exams: Delete Exam (Teacher)
  if (pathname.startsWith('/api/exams/') && method === 'DELETE') {
    const examId = pathname.split('/')[3];
    let exams = readJson(EXAMS_FILE);
    const initialLen = exams.length;
    exams = exams.filter(e => e.id !== examId);

    if (exams.length === initialLen) {
      return sendJson(res, 404, { success: false, message: 'Exam not found' });
    }

    writeJson(EXAMS_FILE, exams);
    return sendJson(res, 200, { success: true, message: 'Exam deleted successfully' });
  }

  // 9. Submissions: Submit Exam & Auto-Grade
  if (pathname === '/api/submissions/submit' && method === 'POST') {
    const submissionData = await parseBody(req);
    const { examId, studentId, studentName, studentRollNo, answers, timeTakenSeconds, strikes } = submissionData;

    const exams = readJson(EXAMS_FILE);
    const exam = exams.find(e => e.id === examId);

    if (!exam) {
      return sendJson(res, 404, { success: false, message: 'Exam not found for submission' });
    }

    // Auto-Grading Engine
    let scoredPoints = 0;
    const breakdown = [];

    exam.questions.forEach(q => {
      const userAns = answers ? answers[q.id] : undefined;
      let isCorrect = false;

      if (q.type === 'single' || q.type === 'boolean') {
        isCorrect = Number(userAns) === Number(q.correctAnswer);
      } else if (q.type === 'multiple' && Array.isArray(q.correctAnswer)) {
        const userArr = Array.isArray(userAns) ? userAns.map(Number).sort() : [];
        const correctArr = q.correctAnswer.map(Number).sort();
        isCorrect = JSON.stringify(userArr) === JSON.stringify(correctArr);
      }

      const pointsAwarded = isCorrect ? (Number(q.points) || 1) : 0;
      scoredPoints += pointsAwarded;

      breakdown.push({
        questionId: q.id,
        question: q.question,
        options: q.options,
        userAnswer: userAns,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        correct: isCorrect,
        pointsAwarded: pointsAwarded,
        totalPoints: Number(q.points) || 1
      });
    });

    const totalMarks = exam.totalMarks || exam.questions.reduce((sum, q) => sum + (Number(q.points) || 1), 0);
    const percentage = Math.round((scoredPoints / (totalMarks || 1)) * 100);
    const passed = percentage >= (exam.passingPercentage || 50);

    const submission = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      examId,
      examTitle: exam.title,
      studentId: studentId || 'anonymous',
      studentName: studentName || 'Candidate',
      studentRollNo: studentRollNo || 'N/A',
      startedAt: submissionData.startedAt || new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      timeTakenSeconds: Number(timeTakenSeconds) || 0,
      answers: answers || {},
      score: scoredPoints,
      totalMarks,
      percentage,
      passed,
      strikes: Number(strikes) || 0,
      breakdown
    };

    const submissions = readJson(SUBMISSIONS_FILE);
    submissions.unshift(submission);
    writeJson(SUBMISSIONS_FILE, submissions);

    return sendJson(res, 201, { success: true, submission, message: 'Assessment submitted successfully' });
  }

  // 10. Submissions: Get All Submissions (with optional filters)
  if (pathname === '/api/submissions' && method === 'GET') {
    const submissions = readJson(SUBMISSIONS_FILE);
    const { studentId, examId } = parsedUrl.query;

    let filtered = submissions;
    if (studentId) {
      filtered = filtered.filter(s => s.studentId === studentId);
    }
    if (examId) {
      filtered = filtered.filter(s => s.examId === examId);
    }

    return sendJson(res, 200, { success: true, submissions: filtered });
  }

  // 11. Submissions: Get Single Submission Details
  if (pathname.startsWith('/api/submissions/') && method === 'GET') {
    const subId = pathname.split('/')[3];
    const submissions = readJson(SUBMISSIONS_FILE);
    const sub = submissions.find(s => s.id === subId);

    if (!sub) {
      return sendJson(res, 404, { success: false, message: 'Submission record not found' });
    }

    return sendJson(res, 200, { success: true, submission: sub });
  }

  // 12. Teacher Analytics Stats
  if (pathname === '/api/stats/teacher' && method === 'GET') {
    const exams = readJson(EXAMS_FILE);
    const submissions = readJson(SUBMISSIONS_FILE);

    const totalExams = exams.length;
    const totalSubmissions = submissions.length;
    const avgScore = totalSubmissions > 0
      ? Math.round(submissions.reduce((acc, s) => acc + s.percentage, 0) / totalSubmissions)
      : 0;
    const passCount = submissions.filter(s => s.passed).length;
    const passRate = totalSubmissions > 0
      ? Math.round((passCount / totalSubmissions) * 100)
      : 0;

    return sendJson(res, 200, {
      success: true,
      stats: {
        totalExams,
        totalSubmissions,
        avgScore,
        passRate,
        passCount,
        failCount: totalSubmissions - passCount
      }
    });
  }

  // ==========================================
  // STATIC FILE SERVING
  // ==========================================
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);

  // If path doesn't have an extension, try appending .html
  if (!path.extname(filePath)) {
    if (fs.existsSync(filePath + '.html')) {
      filePath += '.html';
    }
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<h1>404 Not Found</h1><p>The requested URL ${pathname} was not found on this server.</p><a href="/">Return to Home</a>`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Online Examination & Assessment System is Live!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`📁 Database: JSON storage in ${DATA_DIR}`);
  console.log(`=======================================================`);
});
