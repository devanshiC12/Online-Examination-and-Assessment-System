# 👥 TEAM PLAN — Branch-wise kaam ka batwara

Repo me 5 branches hain, to 5 log. **Har branch ke apne files hain, isliye kisi ka kisi se merge-conflict nahi aayega.**

| # | Branch | Kaun karega | Files (sirf yehi touch karna) |
|---|--------|-------------|-------------------------------|
| 1 | `dev` | Team Lead / Member 1 | `js/store.js`, `js/ui.js`, `README.md`, `.gitignore` |
| 2 | `feature/login` | Member 2 | `index.html`, `login.html`, `student-dashboard.html`, `js/auth.js`, `js/student.js`, `style.css`, `dashboard.css` |
| 3 | `feature/teacher-dashboard-ui` | Member 3 | `teacher-dashboard.html`, `js/teacher.js`, `dashboard.css` |
| 4 | `feature/examDashboard` | Member 4 | `exam.html`, `exam.css`, `js/exam.js` |
| 5 | `feature/result-page` | Member 5 | `result.html`, `result.css`, `js/result.js`, `js/teacher-results.js` |

> ⚠️ `style.css` / `dashboard.css` / `exam.css` / `result.css` me **koi change mat karna** (ya karna ho to pehle group me batao) — warna conflict aayega.

---

## Kaam ka vivaran (kis branch me kya hai)

### 1) `dev` — Data layer (sabse pehle ye merge hoga)
- `js/store.js`: users, exams, results ka localStorage database, register/login/session, `requireRole()` page-guard, exam create/delete, **auto evaluation (`submitAttempt`)**, CSV generator, demo seed data.
- `js/ui.js`: toast, modal open/close, navbar (name + role + logout), date/time formatters.
- `README.md`, `.gitignore`.

### 2) `feature/login`
- `index.html`: landing page (fixed links + Login/Dashboard button).
- `login.html` + `js/auth.js`: Login / Register tabs, role select (student ke liye roll no.), demo-fill buttons, validation errors.
- `student-dashboard.html` + `js/student.js`: metrics, available exams (search + category filter), lobby modal, history table.

### 3) `feature/teacher-dashboard-ui`
- `teacher-dashboard.html` + `js/teacher.js`: tabs, exam cards, search/filter, **Create Assessment modal + dynamic question builder** (4 options, correct answer, marks, explanation), View Questions modal, delete exam.

### 4) `feature/examDashboard`
- `exam.html` + `js/exam.js`: countdown timer (refresh par reset nahi hota), question palette (5 statuses), mark-for-review, clear response, auto-save, confirm-submit modal, **anti-cheat strikes (tab switch / blur, 3 strikes = disqualify)**, copy/paste/right-click block, fullscreen, auto-submit on time-up.

### 5) `feature/result-page`
- `result.html` + `js/result.js`: scorecard (score, %, time, strikes, status), question-by-question review (correct / wrong / skipped + explanation), print / save PDF, access check.
- `js/teacher-results.js`: teacher ka **Results & Analytics tab** — table, avg score, pass rate, **CSV export**.

---

## ▶️ Git steps (har member ke liye)

**Order:** pehle `dev` push hoga → phir baaki 4 log apni branch me `dev` merge karke kaam push karenge → PR to `dev` → last me `dev` → `main`.

### Member 1 (dev)
```bash
git clone https://github.com/devanshiC12/Online-Examination-and-Assessment-System.git
cd Online-Examination-and-Assessment-System
git checkout dev
# apne files `branches/dev/` se copy karo, phir:
git add js/store.js        && git commit -m "feat(store): add localStorage data layer with seed data"
git add js/ui.js           && git commit -m "feat(ui): add toast, modal and navbar helpers"
git add README.md .gitignore && git commit -m "docs: add README and gitignore"
git push origin dev
```
Push hone ke baad group me bol do: **"dev ready ✅"**

### Member 2–5 (apni branch ke naam se)
```bash
git clone https://github.com/devanshiC12/Online-Examination-and-Assessment-System.git
cd Online-Examination-and-Assessment-System
git checkout feature/login            # <- apni branch
git merge origin/dev                  # store.js + ui.js aa jayenge
# apne files `branches/<apni-branch>/` se copy karo (same folder structure me)
git add <file>  &&  git commit -m "<message>"     # neeche suggested commits dekho
git push origin feature/login
```
Phir GitHub par **Pull Request → base: `dev`** banao. Sab ke PR merge hone ke baad `dev → main` ka PR.

> Agar branch purani files rakhe (e.g. `README.md` conflict), to `git merge origin/dev` ke baad conflict aaye to **dev wala README rakho**.

---

## 📝 Suggested commits (taaki sabka apna-apna commit history bane)

**Member 2 — `feature/login`**
1. `feat(landing): fix links and add login button` → `index.html`
2. `feat(auth): add login and register page` → `login.html`
3. `feat(auth): add auth logic with validation and role redirect` → `js/auth.js`
4. `feat(student): wire student dashboard with scripts` → `student-dashboard.html`
5. `feat(student): add dashboard logic - exams, lobby, history` → `js/student.js`

**Member 3 — `feature/teacher-dashboard-ui`**
1. `feat(teacher): wire dashboard ids and scripts` → `teacher-dashboard.html`
2. `feat(teacher): tabs, exam cards, search and category filter` → `js/teacher.js`
   *(chaho to teacher.js ko 2–3 hisson me todke alag commits bhi kar sakte ho: list/filter, question builder, save/delete)*

**Member 4 — `feature/examDashboard`**
1. `feat(exam): add ids, data-attrs and scripts to exam room` → `exam.html`
2. `feat(exam): timer, palette, answers, review, auto-save` → `js/exam.js`
3. *(optional split)* `feat(exam): anti-cheat strikes and auto-disqualify`

**Member 5 — `feature/result-page`**
1. `feat(result): wire scorecard page` → `result.html`
2. `feat(result): scorecard and detailed review logic` → `js/result.js`
3. `feat(teacher): results table, analytics and CSV export` → `js/teacher-results.js`

---

## ✅ Final check (sab merge hone ke baad)
1. `teacher@demo.com / teacher123` se login → naya exam banao.
2. Naya student register karo → exam do (tab switch karke strike bhi check karo).
3. Result page dekho → teacher login karke Results tab + CSV export check karo.
