// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Prescription pad date, styled like a lab date stamp
const padDate = document.getElementById('padDate');
if (padDate) {
  const today = new Date();
  const formatted = today.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: '2-digit'
  });
  padDate.textContent = `Date: ${formatted}`;
}

// Reveal sections on scroll
const revealTargets = document.querySelectorAll('.section, .hero .pad');
revealTargets.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealTargets.forEach(el => observer.observe(el));

// Animate dosage bars when the skills section enters view
const doseSection = document.getElementById('skills');
if (doseSection) {
  const doseObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.dose-bar span').forEach(bar => {
          const target = bar.getAttribute('data-width');
          if (target) bar.style.width = target;
        });
        doseObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  doseObserver.observe(doseSection);
}
