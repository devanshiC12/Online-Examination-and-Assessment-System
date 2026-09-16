# Online Examination & Assessment System

A modern, full-featured web-based assessment platform built with **HTML5, CSS3, Vanilla JavaScript** on the frontend and **JSON file database persistence** with a Node.js REST API backend (with seamless zero-setup offline/localStorage fallback).

---

## 🚀 Key Highlights & Features

### 1. Dual Role Authentication & Quick Demo Logins
- **Teacher / Instructor**: Create assessments, manage question banks, review student scores, monitor anti-cheat strikes, and export analytics.
- **Student / Candidate**: Browse active tests, enter timed exams, review instant scorecards and historical performance.
- **1-Click Demo Buttons**: Instant login buttons for **Teacher Demo** and **Student Demo** on the landing page for immediate demonstration.

### 2. Teacher & Assessment Management Suite
- **Interactive Exam Creator**:
  - Title, category (Web Development, Computer Science, General Aptitude, etc.), duration in minutes, passing percentage, instructions.
  - **Dynamic Question Builder**: Single Choice (MCQ), True/False, custom point values, and explanation notes.
- **Publish & Draft Controls**: Toggle exam visibility or delete tests with 1 click.
- **Submissions & Analytics Dashboard**:
  - Real-time statistics: Total Assessments, Total Submissions, Class Average Score, and Pass Percentage.
  - Submissions table showing candidate details, time spent, score bars, pass/fail status, and integrity strikes.
  - **Export to CSV**: Download student performance records in standard CSV format for college reporting.

### 3. Student Examination Portal (Proctored Test Room)
- **Exam Lobby**: Review test rules, anti-cheating guidelines, time limits, and hardware requirements.
- **Live Real-time Countdown Timer**:
  - Persistent sticky clock at the top bar.
  - Visual urgency cues (turns amber under 5 minutes, red pulsating under 1 minute).
  - **Automatic submission** when time expires.
- **Color-Coded Question Palette**:
  - 🟢 **Green**: Answered
  - 🟡 **Orange**: Marked for Review
  - 🟣 **Purple**: Answered & Marked for Review
  - ⚪ **Gray**: Visited but Not Answered
  - ◽ **White**: Not Visited
  - Direct jump navigation to any question.
- **Anti-Cheating & Integrity Guardrails**:
  - **Tab-switch & Window Blur Detection**: Tracks when a candidate leaves the test window.
  - **Strike Counter**: Warning dialog on violation (3 strikes triggers automatic disqualification & submission).
  - **Right-Click & Copy/Paste Restriction**: Blocks developer inspection and cheat shortcuts.
  - **Fullscreen Toggle**: Encourages distraction-free assessment environment.

### 4. Automated Grading & Detailed Scorecards
- Instant scoring calculation upon submission.
- Pass / Fail status badge, percentage, accuracy, and total duration taken.
- **Comprehensive Solution Breakdown**:
  - Highlights correct choice (Green) vs student choice (Red/Green).
  - Detailed explanation notes explaining why an answer is correct.
- **Print / Save as PDF**: Built-in print-ready scorecard stylesheet.

---

## 📂 Project Structure

```
mini project/
├── data/                       # JSON Database Storage
│   ├── users.json              # Teacher & Student account records
│   ├── exams.json              # Pre-seeded & custom assessments
│   └── submissions.json        # Completed test attempts & scorecards
├── public/                     # Frontend Application (HTML, CSS, JS)
│   ├── css/
│   │   ├── style.css           # Design tokens, typography, glassmorphism, forms, modals
│   │   ├── dashboard.css       # Analytics stats, cards grid, tables, dynamic question builder
│   │   └── exam.css            # Proctored test screen, sticky timer, question palette
│   ├── js/
│   │   ├── api.js              # REST API client with dual-mode LocalStorage fallback
│   │   ├── auth.js             # Authentication, session manager, demo logins, route guards
│   │   ├── teacher.js          # Teacher dashboard controller & CSV exporter
│   │   ├── student.js          # Student portal controller & assessment lobby
│   │   ├── exam.js             # Proctored exam engine: timer, strikes, palette, auto-save
│   │   └── result.js           # Scorecard generator & solution breakdown
│   ├── index.html              # Landing page & Authentication modal
│   ├── teacher-dashboard.html  # Teacher management portal
│   ├── student-dashboard.html  # Student assessment portal
│   ├── exam.html               # Dedicated proctored exam room
│   └── result.html             # Performance scorecard & review
├── server.js                   # Lightweight zero-dependency Node.js HTTP & REST API server
├── package.json                # Project scripts
└── README.md                   # Project documentation
```

---

## ⚡ How to Run

### Method 1: Using Node.js (Recommended)
1. Open your terminal in the `mini project` directory:
   ```bash
   cd "mini project"
   ```
2. Start the server (Zero external dependencies required; uses Node's built-in HTTP module):
   ```bash
   node server.js
   ```
3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Method 2: Direct Browser / Live Server
Simply double-click `public/index.html` or open it with VS Code Live Server. The built-in client automatically synchronizes with local storage and includes all seed data!

---

## 🔑 Pre-Seeded Accounts

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Teacher / Admin** | `teacher@exam.com` | `admin123` | Prof. Alan Turing (Computer Science) |
| **Student** | `student@exam.com` | `student123` | Devanshi Patel (Roll: CS-2024-042) |
| **Student 2** | `alex@exam.com` | `alex123` | Alex Johnson (Roll: CS-2024-018) |

> 💡 *You can also click the **Teacher Demo** or **Student Demo** buttons on the landing page for instant 1-click access!*
