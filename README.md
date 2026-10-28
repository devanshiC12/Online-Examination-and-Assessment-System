# Online Examination & Assessment System (Examify)

Ek complete front-end web app jisme **Teacher** exams banata hai aur **Student** timed, proctored exam deta hai.
Data browser ke `localStorage` me save hota hai, isliye alag backend/database ki zarurat nahi.

## Features
- 🔐 Register / Login (Student & Teacher roles, page guards)
- 👩‍🏫 Teacher: exam create (MCQ builder), view/delete, student results table, analytics, **CSV export**
- 🎓 Student: available exams, lobby/instructions, history & scorecards
- ⏱️ Exam room: countdown timer, question palette, mark-for-review, auto-save, auto-submit
- 🛡️ Anti-cheat: tab-switch/blur strikes (3 strikes = disqualified), copy/paste & right-click blocked
- 📊 Auto evaluation + detailed scorecard with explanations, print/save as PDF

## Run karna
```bash
git clone https://github.com/devanshiC12/Online-Examination-and-Assessment-System.git
cd Online-Examination-and-Assessment-System
# VS Code "Live Server" se index.html kholo  (ya)
npx serve .        # / python -m http.server 5500
```

**Demo accounts**

| Role    | Email             | Password     |
|---------|-------------------|--------------|
| Teacher | teacher@demo.com  | teacher123   |
| Student | student@demo.com  | student123   |

## Project structure
```
index.html              Landing page
login.html              Login + Register
student-dashboard.html  Student portal
teacher-dashboard.html  Teacher portal
exam.html               Proctored exam room
result.html             Scorecard & review
style.css / dashboard.css / exam.css / result.css
js/
  store.js              Data layer (localStorage) + evaluation   [dev]
  ui.js                 Toast, modal, navbar helpers              [dev]
  auth.js               Login/Register logic                      [feature/login]
  student.js            Student dashboard logic                   [feature/login]
  teacher.js            Teacher dashboard (create/list exams)     [feature/teacher-dashboard-ui]
  exam.js               Exam room logic                           [feature/examDashboard]
  result.js             Scorecard logic                           [feature/result-page]
  teacher-results.js    Teacher results tab + CSV                 [feature/result-page]
```
Team ka branch-wise kaam: **TEAM_PLAN.md** dekho.
