'use strict';
document.documentElement.classList.add('js');
const menuButton = document.getElementById('menuButton');
const navigation = document.getElementById('navigation');
function closeNavigation() {
  if (!menuButton || !navigation) return;
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
}
if (menuButton && navigation) {
  menuButton.addEventListener('click', () => {
    const isOpen = navigation.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  });
  navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNavigation));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && navigation.classList.contains('open')) {
      closeNavigation();
      menuButton.focus();
    }
  });
  window.matchMedia('(min-width: 721px)').addEventListener('change', closeNavigation);
}
const today = new Date();
const year = document.getElementById('year');
const dateLabel = document.getElementById('currentDate');
if (year) year.textContent = String(today.getFullYear());
if (dateLabel) dateLabel.textContent = today.toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'});
const reportShell = document.getElementById('reportShell');
const loadReportButton = document.getElementById('loadReport');
const resetReportButton = document.getElementById('resetReport');
const reportStatus = document.getElementById('reportStatus');
let reportFrame;
if (reportShell && loadReportButton && resetReportButton && reportStatus) {
  const reportUrl = reportShell.dataset.reportUrl;
  loadReportButton.addEventListener('click', () => {
    if (reportFrame) return;
    reportFrame = document.createElement('iframe');
    reportFrame.title = 'Saudi Pharma Commercial Intelligence — interactive Power BI report';
    reportFrame.src = reportUrl;
    reportFrame.allowFullscreen = true;
    reportFrame.setAttribute('allow', 'fullscreen');
    reportFrame.referrerPolicy = 'strict-origin-when-cross-origin';
    reportShell.replaceChildren(reportFrame);
    resetReportButton.disabled = false;
    reportStatus.textContent = 'Opening the interactive report. It may take a moment; use Open full report if the frame stays blank.';
    reportFrame.focus();
  });
  resetReportButton.addEventListener('click', () => {
    if (!reportFrame) return;
    reportFrame.src = reportUrl;
    reportStatus.textContent = 'Reloading the report at Executive Overview. Check the slicers before starting a new comparison.';
  });
}
