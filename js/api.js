/**
 * Online Examination & Assessment System - Standalone API & Data Layer
 * 
 * Works 100% natively in any web browser without needing Node.js installed!
 * Persists data to LocalStorage and synchronizes automatically.
 * If a Node.js server happens to be running on port 3000, it can seamlessly sync with it too.
 */

const API_BASE = '/api';

const FALLBACK_USERS_KEY = 'exam_app_users';
const FALLBACK_EXAMS_KEY = 'exam_app_exams';
const FALLBACK_SUBMISSIONS_KEY = 'exam_app_submissions';

function initDatabase() {
  if (!localStorage.getItem(FALLBACK_USERS_KEY)) {
    const defaultUsers = [
      {
        id: "usr_teacher_1",
        name: "Prof. Alan Turing",
        email: "teacher@exam.com",
        password: "admin123",
        role: "teacher",
        department: "Computer Science & Engineering",
        createdAt: "2026-09-01T10:00:00.000Z"
      },
      {
        id: "usr_student_1",
        name: "Devanshi Patel",
        email: "student@exam.com",
        password: "student123",
        role: "student",
        rollNo: "CS-2024-042",
        createdAt: "2026-09-02T11:00:00.000Z"
      },
      {
        id: "usr_student_2",
        name: "Alex Johnson",
        email: "alex@exam.com",
        password: "alex123",
        role: "student",
        rollNo: "CS-2024-018",
        createdAt: "2026-09-03T09:30:00.000Z"
      }
    ];
    localStorage.setItem(FALLBACK_USERS_KEY, JSON.stringify(defaultUsers));
  }

  if (!localStorage.getItem(FALLBACK_EXAMS_KEY)) {
    const defaultExams = [
      {
        id: "exam_web_dev_101",
        title: "Web Development & JavaScript Essentials",
        description: "Comprehensive assessment covering HTML5 semantics, CSS3 layouts, ES6+ JavaScript features, asynchronous programming, and DOM manipulation.",
        category: "Web Development",
        durationMinutes: 10,
        passingPercentage: 60,
        totalMarks: 10,
        creatorId: "usr_teacher_1",
        creatorName: "Prof. Alan Turing",
        published: true,
        createdAt: "2026-09-10T08:00:00.000Z",
        questions: [
          {
            id: "q1",
            type: "single",
            question: "Which of the following is NOT a JavaScript primitive data type?",
            options: ["Boolean", "Symbol", "Object", "Undefined"],
            correctAnswer: 2,
            points: 2,
            explanation: "In JavaScript, primitive types are String, Number, BigInt, Boolean, Undefined, Symbol, and Null. Objects, Arrays, and Functions are non-primitive (reference) types."
          },
          {
            id: "q2",
            type: "single",
            question: "What will be the output of `console.log(typeof NaN)` in modern JavaScript?",
            options: ["\"undefined\"", "\"number\"", "\"NaN\"", "\"object\""],
            correctAnswer: 1,
            points: 2,
            explanation: "Despite standing for 'Not-a-Number', the ECMAScript specification defines NaN as a numeric data type (`typeof NaN === 'number'`)."
          },
          {
            id: "q3",
            type: "single",
            question: "Which CSS property is used to align flex items along the cross axis inside a flex container?",
            options: ["justify-content", "align-items", "flex-direction", "grid-template-columns"],
            correctAnswer: 1,
            points: 2,
            explanation: "`justify-content` aligns items along the main axis, while `align-items` aligns items along the cross axis in CSS Flexbox."
          },
          {
            id: "q4",
            type: "boolean",
            question: "The Promise.all() method rejects immediately upon any of the input promises rejecting.",
            options: ["True", "False"],
            correctAnswer: 0,
            points: 2,
            explanation: "True. Promise.all has fail-fast behavior; if any promise in the array rejects, the whole returned promise immediately rejects with that error."
          },
          {
            id: "q5",
            type: "single",
            question: "Which HTML5 semantic element represents a self-contained composition in a document, such as a blog post or news story?",
            options: ["<section>", "<article>", "<aside>", "<div>"],
            correctAnswer: 1,
            points: 2,
            explanation: "The <article> tag specifies independent, self-contained content that makes sense on its own and could be distributed independently."
          }
        ]
      },
      {
        id: "exam_dsa_201",
        title: "Data Structures & Algorithms Primer",
        description: "Test your grasp on time complexity, stacks, queues, trees, hash maps, and sorting algorithms.",
        category: "Computer Science",
        durationMinutes: 12,
        passingPercentage: 60,
        totalMarks: 10,
        creatorId: "usr_teacher_1",
        creatorName: "Prof. Alan Turing",
        published: true,
        createdAt: "2026-09-11T09:30:00.000Z",
        questions: [
          {
            id: "dsa_q1",
            type: "single",
            question: "What is the worst-case time complexity of searching for an element in a balanced Binary Search Tree (AVL / Red-Black Tree)?",
            options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
            correctAnswer: 1,
            points: 2,
            explanation: "In a self-balancing BST, the tree height is strictly bounded by O(log N), so search, insertion, and deletion are all O(log N) in the worst case."
          },
          {
            id: "dsa_q2",
            type: "single",
            question: "Which data structure operates on a Last-In, First-Out (LIFO) principle?",
            options: ["Queue", "Stack", "Binary Heap", "Circular Buffer"],
            correctAnswer: 1,
            points: 2,
            explanation: "A Stack works on the LIFO principle (elements pushed last are popped first). A Queue works on FIFO."
          },
          {
            id: "dsa_q3",
            type: "single",
            question: "What is the average case time complexity of QuickSort?",
            options: ["O(N)", "O(N log N)", "O(N^2)", "O(log N)"],
            correctAnswer: 1,
            points: 2,
            explanation: "QuickSort has an average and best time complexity of O(N log N). Its worst case is O(N^2) when bad pivots are chosen."
          },
          {
            id: "dsa_q4",
            type: "boolean",
            question: "A hash table using separate chaining can degrade to O(N) lookup time if all keys hash to the same bucket.",
            options: ["True", "False"],
            correctAnswer: 0,
            points: 2,
            explanation: "True. If all keys collide into a single bucket linked-list, searching through it requires traversing all N elements."
          },
          {
            id: "dsa_q5",
            type: "single",
            question: "Which algorithm is commonly used to find the shortest path in an unweighted graph?",
            options: ["Breadth-First Search (BFS)", "Depth-First Search (DFS)", "Prim's Algorithm", "Kruskal's Algorithm"],
            correctAnswer: 0,
            points: 2,
            explanation: "BFS explores vertices level by level, making it the standard optimal algorithm for finding shortest paths in unweighted graphs."
          }
        ]
      },
      {
        id: "exam_aptitude_301",
        title: "Logical Reasoning & General Aptitude",
        description: "Standard quantitative and verbal aptitude test evaluating problem solving speed and analytical thinking.",
        category: "General Aptitude",
        durationMinutes: 8,
        passingPercentage: 50,
        totalMarks: 10,
        creatorId: "usr_teacher_1",
        creatorName: "Prof. Alan Turing",
        published: true,
        createdAt: "2026-09-12T14:15:00.000Z",
        questions: [
          {
            id: "apt_q1",
            type: "single",
            question: "Find the missing number in the sequence: 2, 6, 12, 20, 30, ?",
            options: ["40", "42", "44", "48"],
            correctAnswer: 1,
            points: 2,
            explanation: "Differences between consecutive terms are +4, +6, +8, +10, +12. Therefore, 30 + 12 = 42. Alternatively, n*(n+1): 1*2, 2*3, 3*4, 4*5, 5*6, 6*7 = 42."
          },
          {
            id: "apt_q2",
            type: "single",
            question: "A train running at 72 km/h crosses a 200m long platform in 25 seconds. What is the length of the train?",
            options: ["250 meters", "300 meters", "350 meters", "400 meters"],
            correctAnswer: 1,
            points: 2,
            explanation: "Speed = 72 * (5/18) = 20 m/s. Total distance covered in 25s = 20 * 25 = 500m. Length of train = 500 - 200 = 300 meters."
          },
          {
            id: "apt_q3",
            type: "single",
            question: "If 'APPLE' is coded as 'EQTPI', what is the code for 'ORANGE'?",
            options: ["SVETKI", "STERKI", "SVERKI", "SVESKI"],
            correctAnswer: 2,
            points: 2,
            explanation: "Pattern: Each letter is shifted forward by +4 in the alphabet. O(+4)=S, R(+4)=V, A(+4)=E, N(+4)=R, G(+4)=K, E(+4)=I => SVERKI."
          },
          {
            id: "apt_q4",
            type: "boolean",
            question: "A leap year has exactly 52 weeks and 2 odd days.",
            options: ["True", "False"],
            correctAnswer: 0,
            points: 2,
            explanation: "True. A leap year has 366 days. 366 / 7 = 52 weeks and 2 remaining days (odd days)."
          },
          {
            id: "apt_q5",
            type: "single",
            question: "Two coins are tossed simultaneously. What is the probability of getting at least one head?",
            options: ["1/4", "1/2", "3/4", "1"],
            correctAnswer: 2,
            points: 2,
            explanation: "Sample space: {HH, HT, TH, TT} = 4 outcomes. Favorable outcomes for at least one head: {HH, HT, TH} = 3 outcomes. Probability = 3/4."
          }
        ]
      }
    ];
    localStorage.setItem(FALLBACK_EXAMS_KEY, JSON.stringify(defaultExams));
  }

  if (!localStorage.getItem(FALLBACK_SUBMISSIONS_KEY)) {
    const defaultSubmissions = [
      {
        id: "sub_1726001000",
        examId: "exam_web_dev_101",
        examTitle: "Web Development & JavaScript Essentials",
        studentId: "usr_student_2",
        studentName: "Alex Johnson",
        studentRollNo: "CS-2024-018",
        startedAt: "2026-09-14T10:00:00.000Z",
        submittedAt: "2026-09-14T10:07:30.000Z",
        timeTakenSeconds: 450,
        score: 8,
        totalMarks: 10,
        percentage: 80,
        passed: true,
        strikes: 0,
        breakdown: [
          { questionId: "q1", correct: true, pointsAwarded: 2, userAnswer: 2, correctAnswer: 2, question: "Which of the following is NOT a JavaScript primitive data type?", options: ["Boolean", "Symbol", "Object", "Undefined"], explanation: "Objects are non-primitive." },
          { questionId: "q2", correct: true, pointsAwarded: 2, userAnswer: 1, correctAnswer: 1, question: "What will be the output of typeof NaN?", options: ["undefined", "number", "NaN", "object"], explanation: "typeof NaN is number." },
          { questionId: "q3", correct: false, pointsAwarded: 0, userAnswer: 0, correctAnswer: 1, question: "Which CSS property aligns items along the cross axis?", options: ["justify-content", "align-items", "flex-direction", "grid-template-columns"], explanation: "align-items is cross axis." },
          { questionId: "q4", correct: true, pointsAwarded: 2, userAnswer: 0, correctAnswer: 0, question: "Promise.all rejects immediately upon any rejection.", options: ["True", "False"], explanation: "Promise.all has fail-fast behavior." },
          { questionId: "q5", correct: true, pointsAwarded: 2, userAnswer: 1, correctAnswer: 1, question: "Which HTML5 element represents self-contained content?", options: ["<section>", "<article>", "<aside>", "<div>"], explanation: "<article> is self-contained." }
        ]
      },
      {
        id: "sub_1726002000",
        examId: "exam_dsa_201",
        examTitle: "Data Structures & Algorithms Primer",
        studentId: "usr_student_1",
        studentName: "Devanshi Patel",
        studentRollNo: "CS-2024-042",
        startedAt: "2026-09-15T11:10:00.000Z",
        submittedAt: "2026-09-15T11:18:45.000Z",
        timeTakenSeconds: 525,
        score: 10,
        totalMarks: 10,
        percentage: 100,
        passed: true,
        strikes: 0,
        breakdown: [
          { questionId: "dsa_q1", correct: true, pointsAwarded: 2, userAnswer: 1, correctAnswer: 1, question: "Worst-case search time in balanced BST?", options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"], explanation: "Tree height bounded by O(log N)." },
          { questionId: "dsa_q2", correct: true, pointsAwarded: 2, userAnswer: 1, correctAnswer: 1, question: "LIFO principle data structure?", options: ["Queue", "Stack", "Binary Heap", "Circular Buffer"], explanation: "Stack is LIFO." },
          { questionId: "dsa_q3", correct: true, pointsAwarded: 2, userAnswer: 1, correctAnswer: 1, question: "Average case of QuickSort?", options: ["O(N)", "O(N log N)", "O(N^2)", "O(log N)"], explanation: "QuickSort averages O(N log N)." },
          { questionId: "dsa_q4", correct: true, pointsAwarded: 2, userAnswer: 0, correctAnswer: 0, question: "Hash table can degrade to O(N) if all collide?", options: ["True", "False"], explanation: "True due to single bucket chaining." },
          { questionId: "dsa_q5", correct: true, pointsAwarded: 2, userAnswer: 0, correctAnswer: 0, question: "Shortest path in unweighted graph?", options: ["BFS", "DFS", "Prim's", "Kruskal's"], explanation: "BFS explores level by level." }
        ]
      }
    ];
    localStorage.setItem(FALLBACK_SUBMISSIONS_KEY, JSON.stringify(defaultSubmissions));
  }
}

initDatabase();

// API Client Object
const API = {
  async request(endpoint, options = {}) {
    // If running on a local Node.js server on port 3000
    if (window.location.protocol.startsWith('http') && window.location.port === '3000') {
      try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
          headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
          ...options
        });
        if (response.ok) {
          return await response.json();
        }
      } catch (err) {
        // Fall back to localStorage directly
      }
    }
    
    // Standalone native browser execution (Pure HTML/CSS/JS/JSON)
    return this.fallbackHandler(endpoint, options);
  },

  fallbackHandler(endpoint, options = {}) {
    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body) : {};

    // 1. Auth Login
    if (endpoint === '/auth/login' && method === 'POST') {
      const users = JSON.parse(localStorage.getItem(FALLBACK_USERS_KEY) || '[]');
      const user = users.find(u => u.email.toLowerCase() === (body.email || '').toLowerCase().trim());
      if (user && user.password === body.password) {
        const { password, ...safeUser } = user;
        return { success: true, user: safeUser };
      }
      return { success: false, message: 'Invalid credentials. Please check your email and password.' };
    }

    // 2. Auth Register
    if (endpoint === '/auth/register' && method === 'POST') {
      const users = JSON.parse(localStorage.getItem(FALLBACK_USERS_KEY) || '[]');
      if (users.some(u => u.email.toLowerCase() === body.email.toLowerCase().trim())) {
        return { success: false, message: 'An account with this email already exists.' };
      }
      const newUser = {
        id: `usr_${Date.now()}`,
        name: body.name,
        email: body.email.toLowerCase().trim(),
        password: body.password,
        role: body.role || 'student',
        rollNo: body.rollNo || `CS-2024-${Math.floor(100 + Math.random() * 900)}`,
        department: body.department || 'Computer Science'
      };
      users.push(newUser);
      localStorage.setItem(FALLBACK_USERS_KEY, JSON.stringify(users));
      const { password, ...safeUser } = newUser;
      return { success: true, user: safeUser };
    }

    // 3. Get Exams
    if (endpoint.startsWith('/exams') && method === 'GET') {
      const exams = JSON.parse(localStorage.getItem(FALLBACK_EXAMS_KEY) || '[]');
      const cleanPath = endpoint.split('?')[0];
      const parts = cleanPath.split('/');
      
      if (parts.length > 2 && parts[2]) {
        const examId = parts[2];
        const isFull = parts[3] === 'full';
        const exam = exams.find(e => e.id === examId);
        if (!exam) return { success: false, message: 'Exam not found' };
        if (!isFull) {
          const sanitized = {
            ...exam,
            questions: exam.questions.map(q => {
              const { correctAnswer, explanation, ...safeQ } = q;
              return safeQ;
            })
          };
          return { success: true, exam: sanitized };
        }
        return { success: true, exam };
      }

      return { success: true, exams };
    }

    // 4. Create Exam
    if (endpoint === '/exams' && method === 'POST') {
      const exams = JSON.parse(localStorage.getItem(FALLBACK_EXAMS_KEY) || '[]');
      const totalMarks = body.questions.reduce((sum, q) => sum + (Number(q.points) || 1), 0);
      const newExam = {
        id: `exam_${Date.now()}`,
        title: body.title,
        description: body.description || '',
        category: body.category || 'General',
        durationMinutes: Number(body.durationMinutes) || 15,
        passingPercentage: Number(body.passingPercentage) || 50,
        totalMarks: totalMarks,
        creatorId: body.creatorId || 'usr_teacher_1',
        creatorName: body.creatorName || 'Instructor',
        published: true,
        createdAt: new Date().toISOString(),
        questions: body.questions
      };
      exams.unshift(newExam);
      localStorage.setItem(FALLBACK_EXAMS_KEY, JSON.stringify(exams));
      return { success: true, exam: newExam };
    }

    // 5. Update Exam
    if (endpoint.startsWith('/exams/') && method === 'PUT') {
      const examId = endpoint.split('/')[2];
      let exams = JSON.parse(localStorage.getItem(FALLBACK_EXAMS_KEY) || '[]');
      const idx = exams.findIndex(e => e.id === examId);
      if (idx !== -1) {
        exams[idx] = { ...exams[idx], ...body };
        localStorage.setItem(FALLBACK_EXAMS_KEY, JSON.stringify(exams));
        return { success: true, exam: exams[idx] };
      }
      return { success: false, message: 'Exam not found' };
    }

    // 6. Delete Exam
    if (endpoint.startsWith('/exams/') && method === 'DELETE') {
      const examId = endpoint.split('/')[2];
      let exams = JSON.parse(localStorage.getItem(FALLBACK_EXAMS_KEY) || '[]');
      exams = exams.filter(e => e.id !== examId);
      localStorage.setItem(FALLBACK_EXAMS_KEY, JSON.stringify(exams));
      return { success: true };
    }

    // 7. Submissions Submit & Auto-Grading
    if (endpoint === '/submissions/submit' && method === 'POST') {
      const exams = JSON.parse(localStorage.getItem(FALLBACK_EXAMS_KEY) || '[]');
      const exam = exams.find(e => e.id === body.examId);
      if (!exam) return { success: false, message: 'Exam not found' };

      let scoredPoints = 0;
      const breakdown = [];

      exam.questions.forEach(q => {
        const userAns = body.answers ? body.answers[q.id] : undefined;
        const isCorrect = userAns !== undefined && Number(userAns) === Number(q.correctAnswer);
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
        id: `sub_${Date.now()}`,
        examId: body.examId,
        examTitle: exam.title,
        studentId: body.studentId,
        studentName: body.studentName,
        studentRollNo: body.studentRollNo,
        submittedAt: new Date().toISOString(),
        timeTakenSeconds: body.timeTakenSeconds || 0,
        score: scoredPoints,
        totalMarks,
        percentage,
        passed,
        strikes: body.strikes || 0,
        breakdown
      };

      const submissions = JSON.parse(localStorage.getItem(FALLBACK_SUBMISSIONS_KEY) || '[]');
      submissions.unshift(submission);
      localStorage.setItem(FALLBACK_SUBMISSIONS_KEY, JSON.stringify(submissions));

      return { success: true, submission };
    }

    // 8. Get Submissions
    if (endpoint.startsWith('/submissions') && method === 'GET') {
      const submissions = JSON.parse(localStorage.getItem(FALLBACK_SUBMISSIONS_KEY) || '[]');
      const cleanPath = endpoint.split('?')[0];
      const parts = cleanPath.split('/');
      
      if (parts.length > 2 && parts[2]) {
        const sub = submissions.find(s => s.id === parts[2]);
        return { success: true, submission: sub };
      }

      const urlParams = new URLSearchParams(endpoint.includes('?') ? endpoint.split('?')[1] : '');
      const studentId = urlParams.get('studentId');
      const examId = urlParams.get('examId');

      let filtered = submissions;
      if (studentId) filtered = filtered.filter(s => s.studentId === studentId);
      if (examId) filtered = filtered.filter(s => s.examId === examId);

      return { success: true, submissions: filtered };
    }

    // 9. Teacher Stats
    if (endpoint === '/stats/teacher' && method === 'GET') {
      const exams = JSON.parse(localStorage.getItem(FALLBACK_EXAMS_KEY) || '[]');
      const submissions = JSON.parse(localStorage.getItem(FALLBACK_SUBMISSIONS_KEY) || '[]');
      const totalExams = exams.length;
      const totalSubmissions = submissions.length;
      const avgScore = totalSubmissions > 0
        ? Math.round(submissions.reduce((a, b) => a + b.percentage, 0) / totalSubmissions)
        : 0;
      const passCount = submissions.filter(s => s.passed).length;
      const passRate = totalSubmissions > 0 ? Math.round((passCount / totalSubmissions) * 100) : 0;

      return {
        success: true,
        stats: { totalExams, totalSubmissions, avgScore, passRate, passCount, failCount: totalSubmissions - passCount }
      };
    }

    return { success: true };
  },

  // Auth Methods
  login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  // Exams Methods
  getExams(role = '') {
    return this.request(`/exams${role ? '?role=' + role : ''}`);
  },

  getExamById(id, isFull = false) {
    return this.request(`/exams/${id}${isFull ? '/full' : ''}`);
  },

  createExam(examData) {
    return this.request('/exams', {
      method: 'POST',
      body: JSON.stringify(examData)
    });
  },

  updateExam(id, updateData) {
    return this.request(`/exams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  },

  deleteExam(id) {
    return this.request(`/exams/${id}`, {
      method: 'DELETE'
    });
  },

  // Submissions Methods
  submitExam(payload) {
    return this.request('/submissions/submit', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  getSubmissions(studentId = '', examId = '') {
    let query = [];
    if (studentId) query.push(`studentId=${encodeURIComponent(studentId)}`);
    if (examId) query.push(`examId=${encodeURIComponent(examId)}`);
    const qStr = query.length ? `?${query.join('&')}` : '';
    return this.request(`/submissions${qStr}`);
  },

  getSubmissionById(id) {
    return this.request(`/submissions/${id}`);
  },

  // Teacher Stats
  getTeacherStats() {
    return this.request('/stats/teacher');
  }
};
