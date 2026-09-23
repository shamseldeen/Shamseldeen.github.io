'use strict';
const isArabic = document.documentElement.lang === 'ar';
document.documentElement.classList.add('js');
const menuButton = document.getElementById('menuButton');
const navigation = document.getElementById('navigation');
function closeNavigation() {
  if (!menuButton || !navigation) return;
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', isArabic ? 'فتح القائمة' : 'Open navigation');
}
if (menuButton && navigation) {
  menuButton.addEventListener('click', () => {
    const isOpen = navigation.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isArabic ? (isOpen ? 'إغلاق القائمة' : 'فتح القائمة') : (isOpen ? 'Close navigation' : 'Open navigation'));
  });
  navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNavigation));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && navigation.classList.contains('open')) {
      closeNavigation();
      menuButton.focus();
    }
  });
  window.matchMedia('(min-width: 851px)').addEventListener('change', closeNavigation);
}
const today = new Date();
const year = document.getElementById('year');
const dateLabel = document.getElementById('currentDate');
if (year) year.textContent = String(today.getFullYear());
if (dateLabel) dateLabel.textContent = today.toLocaleDateString(isArabic ? 'ar-EG' : 'en-GB', {day: '2-digit', month: 'short', year: 'numeric'});
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
    reportFrame.title = isArabic ? 'تحليلات توزيع الأدوية — تقرير Power BI تفاعلي بالإنجليزية' : 'Saudi Pharma Commercial Intelligence — interactive Power BI report';
    reportFrame.src = reportUrl;
    reportFrame.allowFullscreen = true;
    reportFrame.setAttribute('allow', 'fullscreen');
    reportFrame.referrerPolicy = 'strict-origin-when-cross-origin';
    reportShell.replaceChildren(reportFrame);
    resetReportButton.disabled = false;
    reportStatus.textContent = isArabic ? 'جارٍ فتح التقرير التفاعلي. إذا ظل الإطار فارغًا، استخدم فتح التقرير كاملًا.' : 'Opening the interactive report. It may take a moment; use Open full report if the frame stays blank.';
    reportFrame.focus();
  });
  resetReportButton.addEventListener('click', () => {
    if (!reportFrame) return;
    reportFrame.src = reportUrl;
    reportStatus.textContent = isArabic ? 'جارٍ إعادة تحميل التقرير من صفحة النظرة العامة. راجع الفلاتر قبل بدء مقارنة جديدة.' : 'Reloading the report at Executive Overview. Check the slicers before starting a new comparison.';
  });
}

