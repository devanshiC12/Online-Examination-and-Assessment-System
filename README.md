# Online Examination & Assessment System (Examify)

A complete front-end web app where **Teachers** create exams and **Students** take timed, proctored assessments.
Data is stored in the browser's `localStorage`. This project does not currently have a separate backend or database, so only the frontend folder is included.

## Features
- 🔐 Register / Login (Student & Teacher roles, page guards)
- 👩‍🏫 Teacher: create exams (MCQ builder), view/delete exams, student results table, analytics, **CSV export**
- 🎓 Student: available exams, lobby/instructions, history & scorecards
- ⏱️ Exam room: countdown timer, question palette, mark-for-review, auto-save, auto-submit
- 🛡️ Anti-cheat: tab-switch/blur strikes (3 strikes = disqualified), copy/paste & right-click blocked
- 📊 Automatic evaluation + detailed scorecard with explanations, print/save as PDF

## Contributors

| Contributor |
|-------------|
| Dhruv Agrawal |
| Deepti |
| Devanshi Chauhan |
| Devraj Rana |

## Running the app
```bash
git clone https://github.com/devanshiC12/Online-Examination-and-Assessment-System.git
cd Online-Examination-and-Assessment-System/frontend
# Open index.html with VS Code Live Server (or)
npx serve .        # / python -m http.server 5500
```

**Demo accounts**

| Role    | Email             | Password     |
|---------|-------------------|--------------|
| Teacher | teacher@demo.com  | teacher123   |
| Student | student@demo.com  | student123   |

## Project structure
```
README.md               Project overview and setup
TEAM_PLAN.md            Branch-by-branch team workflow
frontend/
  index.html              Landing page
  login.html              Login + Register
  student-dashboard.html  Student portal
  teacher-dashboard.html Teacher portal
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
For the branch-by-branch team workflow, see **TEAM_PLAN.md**.
