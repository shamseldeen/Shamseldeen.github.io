'use strict';
// Renders the "Latest on GitHub" section from github-activity.json.
// The JSON is refreshed daily by .github/workflows/update-github-activity.yml.
// The section stays hidden when there is nothing to show or the file can't load.
(function () {
  const section = document.getElementById('github-activity');
  const grid = document.getElementById('githubActivityGrid');
  if (!section || !grid) return;
  const ar = document.documentElement.lang === 'ar';
  const t = ar
    ? {updated: 'آخر تحديث', code: 'الكود على GitHub ↗', site: 'الموقع ↗'}
    : {updated: 'Updated', code: 'View code on GitHub ↗', site: 'Live site ↗'};

  const ACRONYMS = {sql: 'SQL', bi: 'BI', etl: 'ETL', ai: 'AI', ml: 'ML', api: 'API', kpi: 'KPI', dw: 'DW', io: 'IO'};
  const prettyName = name => name.split(/[-_]+/).filter(Boolean)
    .map(w => ACRONYMS[w.toLowerCase()] || w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const formatDate = iso => new Date(iso).toLocaleDateString(ar ? 'ar-EG' : 'en-GB', {day: 'numeric', month: 'short', year: 'numeric'});

  function el(tag, attrs, text) {
    const node = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => node.setAttribute(k, v));
    if (text) node.textContent = text;
    return node;
  }

  function card(repo) {
    const article = el('article', {class: 'project-card gh-card'});
    const meta = el('div', {class: 'project-meta'});
    if (repo.language) meta.append(el('span', {class: 'badge active'}, repo.language));
    if (repo.pushed_at) meta.append(el('span', {}, `${t.updated} ${formatDate(repo.pushed_at)}`));
    article.append(meta, el('h3', {dir: 'ltr'}, prettyName(repo.name)));
    if (repo.description) article.append(el('p', {dir: 'ltr', class: 'gh-desc'}, repo.description));
    if (repo.topics && repo.topics.length) {
      const tags = el('ul', {class: 'gh-topics', dir: 'ltr'});
      repo.topics.slice(0, 5).forEach(topic => tags.append(el('li', {}, topic)));
      article.append(tags);
    }
    const links = el('div', {class: 'card-links'});
    links.append(el('a', {class: 'text-link', href: repo.url, target: '_blank', rel: 'noopener'}, t.code));
    if (repo.homepage) links.append(el('a', {class: 'text-link', href: repo.homepage, target: '_blank', rel: 'noopener'}, t.site));
    article.append(links);
    return article;
  }

  fetch('github-activity.json', {cache: 'no-cache'})
    .then(r => (r.ok ? r.json() : null))
    .then(data => {
      const repos = (data && data.repos) || [];
      if (!repos.length) return;
      grid.replaceChildren(...repos.map(card));
      section.hidden = false;
    })
    .catch(() => {});
})();
