'use strict';
// Static language links also work without JavaScript. Preserve the current section.
const languageLink = document.querySelector('[data-language-switch]');
if (languageLink) {
  const destination = new URL(languageLink.href);
  const syncLanguageLink = () => {
    destination.hash = window.location.hash;
    destination.search = window.location.search;
    languageLink.href = destination.href;
  };
  syncLanguageLink();
  window.addEventListener('hashchange', syncLanguageLink);
}
// Make wide data tables reachable and scrollable with a keyboard.
document.querySelectorAll('.table-scroll').forEach(container => {
  container.tabIndex = 0;
  if (!container.hasAttribute('aria-label')) {
    container.setAttribute('aria-label', document.documentElement.lang === 'ar'
      ? 'جدول بيانات؛ مرّر أفقيًا لعرض جميع الأعمدة'
      : 'Data table; scroll horizontally to view all columns');
  }
});
