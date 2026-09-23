'use strict';
const normalizeSearch = value => value.normalize('NFKD').toLowerCase()
  .replace(/[\u064b-\u065f\u0670\u0640]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي');
document.querySelectorAll('[data-filter]').forEach(input => {
  const table = document.getElementById(input.dataset.filter);
  if (!table || !table.tBodies.length) return;
  const rows = [...table.tBodies[0].rows];
  const entries = rows.map(row => ({row, text: normalizeSearch(row.textContent)}));
  const arabic = document.documentElement.lang === 'ar';
  const courses = input.id === 'courseSearch';
  const label = courses ? 'courses' : 'projects';
  const countLabel = document.getElementById(input.id + 'Count');
  const update = () => {
    const query = normalizeSearch(input.value).trim();
    const terms = query.split(/\s+/).filter(Boolean);
    let count = 0;
    entries.forEach(({row, text}) => {
      row.hidden = !terms.every(term => text.includes(term));
      if (!row.hidden) count++;
    });
    if (countLabel) countLabel.textContent = arabic
      ? (count === 0 ? 'لا توجد نتائج مطابقة. جرّب كلمة أخرى.' : (courses ? 'الدورات: ' : 'المشروعات: ') + count + (query ? ' — تطابق بحثك' : ''))
      : count + ' ' + label + (query ? ' matching your search' : '');
  };
  input.addEventListener('input', update);
  if (input.value) update();
});
