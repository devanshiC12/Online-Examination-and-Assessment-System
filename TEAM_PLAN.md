# 👥 TEAM PLAN — Branch-wise Work Allocation

The repository has 5 branches for 5 team members. **Each branch has its own files, so there should be no merge conflicts between team members.**

| # | Branch | Owner | Files (work only on these) |
|---|--------|-------|----------------------------|
| 1 | `dev` | Team Lead / Member 1 | `js/store.js`, `js/ui.js`, `README.md`, `.gitignore` |
| 2 | `feature/login` | Member 2 | `index.html`, `login.html`, `student-dashboard.html`, `js/auth.js`, `js/student.js`, `style.css`, `dashboard.css` |
| 3 | `feature/teacher-dashboard-ui` | Member 3 | `teacher-dashboard.html`, `js/teacher.js`, `dashboard.css` |
| 4 | `feature/examDashboard` | Member 4 | `exam.html`, `exam.css`, `js/exam.js` |
| 5 | `feature/result-page` | Member 5 | `result.html`, `result.css`, `js/result.js`, `js/teacher-results.js` |

> ⚠️ **Do not change** `style.css` / `dashboard.css` / `exam.css` / `result.css` (or discuss it with the group first) — otherwise, conflicts may occur.

---

## Work details (what each branch includes)

### 1) `dev` — Data layer (merge this first)
- `js/store.js`: localStorage database for users, exams, and results; registration/login/session; `requireRole()` page guard; create/delete exams; **automatic evaluation (`submitAttempt`)**; CSV generator; demo seed data.
- `js/ui.js`: toast notifications, modal open/close, navbar (name + role + logout), date/time formatters.
- `README.md`, `.gitignore`.

### 2) `feature/login`
- `index.html`: landing page (fixed links + Login/Dashboard button).
- `login.html` + `js/auth.js`: Login / Register tabs, role selection (students provide a roll number), demo-fill buttons, validation errors.
- `student-dashboard.html` + `js/student.js`: metrics, available exams (search + category filter), lobby modal, history table.

### 3) `feature/teacher-dashboard-ui`
- `teacher-dashboard.html` + `js/teacher.js`: tabs, exam cards, search/filter, **Create Assessment modal + dynamic question builder** (4 options, correct answer, marks, explanation), View Questions modal, delete exam.

### 4) `feature/examDashboard`
- `exam.html` + `js/exam.js`: countdown timer (does not reset on refresh), question palette (5 statuses), mark-for-review, clear response, auto-save, confirm-submit modal, **anti-cheat strikes (tab switch / blur, 3 strikes = disqualification)**, copy/paste/right-click blocking, fullscreen, auto-submit when time expires.

### 5) `feature/result-page`
- `result.html` + `js/result.js`: scorecard (score, %, time, strikes, status), question-by-question review (correct / wrong / skipped + explanation), print / save PDF, access check.
- `js/teacher-results.js`: teacher's **Results & Analytics tab** — table, average score, pass rate, **CSV export**.

---

## ▶️ Git steps (for each team member)

**Order:** push `dev` first → the other 4 members merge `dev` into their own branches, then push their work → create PRs to `dev` → finally create a PR from `dev` to `main`.

### Member 1 (`dev`)
```bash
git clone https://github.com/devanshiC12/Online-Examination-and-Assessment-System.git
cd Online-Examination-and-Assessment-System
git checkout dev
# Copy your files from `branches/dev/`, then:
git add js/store.js        && git commit -m "feat(store): add localStorage data layer with seed data"
git add js/ui.js           && git commit -m "feat(ui): add toast, modal and navbar helpers"
git add README.md .gitignore && git commit -m "docs: add README and gitignore"
git push origin dev
```
After pushing, let the group know: **"dev ready ✅"**

### Members 2–5 (use your branch name)
```bash
git clone https://github.com/devanshiC12/Online-Examination-and-Assessment-System.git
cd Online-Examination-and-Assessment-System
git checkout feature/login            # <- your branch
git merge origin/dev                  # store.js + ui.js will be included
# Copy your files from `branches/<your-branch>/` (preserving the same folder structure)
git add <file>  &&  git commit -m "<message>"     # see the suggested commits below
git push origin feature/login
```
Then create a **Pull Request → base: `dev`** on GitHub. After all PRs are merged, create a PR from `dev` to `main`.

> If your branch has older files (e.g. a `README.md` conflict), keep the **README from `dev`** after merging `origin/dev`.

---

## 📝 Suggested commits (to give everyone their own commit history)

**Member 2 — `feature/login`**
1. `feat(landing): fix links and add login button` → `index.html`
2. `feat(auth): add login and register page` → `login.html`
3. `feat(auth): add auth logic with validation and role redirect` → `js/auth.js`
4. `feat(student): wire student dashboard with scripts` → `student-dashboard.html`
5. `feat(student): add dashboard logic - exams, lobby, history` → `js/student.js`

**Member 3 — `feature/teacher-dashboard-ui`**
1. `feat(teacher): wire dashboard ids and scripts` → `teacher-dashboard.html`
2. `feat(teacher): tabs, exam cards, search and category filter` → `js/teacher.js`
   *(You can also split teacher.js into 2–3 commits: list/filter, question builder, save/delete.)*

**Member 4 — `feature/examDashboard`**
1. `feat(exam): add ids, data-attrs and scripts to exam room` → `exam.html`
2. `feat(exam): timer, palette, answers, review, auto-save` → `js/exam.js`
3. *(optional split)* `feat(exam): anti-cheat strikes and auto-disqualify`

**Member 5 — `feature/result-page`**
1. `feat(result): wire scorecard page` → `result.html`
2. `feat(result): scorecard and detailed review logic` → `js/result.js`
3. `feat(teacher): results table, analytics and CSV export` → `js/teacher-results.js`

---

## ✅ Final check (after everything is merged)
1. Log in with `teacher@demo.com / teacher123` → create a new exam.
2. Register a new student → take the exam (also test a strike by switching tabs).
3. Open the results page → log in as a teacher and check the Results tab + CSV export.
