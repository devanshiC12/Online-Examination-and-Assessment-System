/* ==========================================================================
   teacher-results.js — teacher-dashboard.html ka "Student Results" tab
   Results table + CSV export (teacher.js ke saath load hota hai)
   ========================================================================== */
(function () {
  'use strict';

  var user = Store.currentUser();
  if (!user || user.role !== 'teacher') return;

  var $ = function (id) { return document.getElementById(id); };

  function render() {
    var rows = Store.resultsForTeacher(user.id);
    var body = $('submissionsTableBody');

    if (!rows.length) {
      body.innerHTML = '<tr><td colspan="8"><div class="empty-state"><div class="empty-state-icon">📭</div>' +
        '<h3>No submissions yet</h3><p>Jab students exam denge, results yahan dikhenge.</p></div></td></tr>';
      return;
    }

    body.innerHTML = rows.map(function (r) {
      return '<tr>' +
        '<td><strong>' + UI.esc(r.userName) + '</strong><br><small style="color:var(--text-muted);">' + UI.esc(r.roll || r.userEmail) + '</small></td>' +
        '<td>' + UI.esc(r.examTitle) + '</td>' +
        '<td>' + UI.fmtDateTime(r.submittedAt) + '</td>' +
        '<td>' + UI.fmtDuration(r.timeTaken) + '</td>' +
        '<td>' + r.score + ' / ' + r.total + ' (' + r.percentage + '%)</td>' +
        '<td>' + UI.statusBadge(r.status) + '</td>' +
        '<td>' + r.strikes + '</td>' +
        '<td><a class="btn btn-secondary btn-sm" href="result.html?id=' + encodeURIComponent(r.id) + '">View</a></td>' +
      '</tr>';
    }).join('');
  }

  $('exportCsvBtn').addEventListener('click', function () {
    var rows = Store.resultsForTeacher(user.id);
    if (!rows.length) return UI.toast('Export karne ke liye koi result nahi hai.', 'warning');

    var blob = new Blob(['\ufeff' + Store.toCSV(rows)], { type: 'text/csv;charset=utf-8;' }); // BOM: Excel me sahi khulta hai
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'examify-results-' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    UI.toast('CSV download ho gayi.', 'success');
  });

  $('btnTabResults').addEventListener('click', render); // tab khulte hi fresh data
  render();
})();
