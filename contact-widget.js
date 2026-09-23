'use strict';

(() => {
  if (document.getElementById('contactWidget')) return;

  const arabic = document.documentElement.lang === 'ar';
  const copy = arabic ? {
    contact: 'تواصل معي', close: 'إغلاق التواصل', title: 'يسعدني تواصلك',
    intro: 'اختر وسيلة التواصل المناسبة لك.', whatsapp: 'واتساب',
    call: 'اتصال هاتفي', email: 'البريد المهني', linkedin: 'LinkedIn',
    profile: 'الملف المهني', options: 'خيارات التواصل'
  } : {
    contact: 'Contact', close: 'Close contact options', title: 'Let’s connect',
    intro: 'Choose how you would like to get in touch.', whatsapp: 'WhatsApp',
    call: 'Phone call', email: 'Email', linkedin: 'LinkedIn',
    profile: 'Professional profile', options: 'Contact options'
  };
  const number = '+966595396073';
  const email = 'shams@shamsinsights.com';
  const icons = {
    chat: '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"/><path d="M8 11.5h8M8 8h5"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.8 2.1Z"/>',
    whatsapp: '<path d="M20.5 3.5A11.8 11.8 0 0 0 12 .1C5.5.1.2 5.4.2 11.9c0 2.1.5 4.1 1.6 5.9L.1 24l6.3-1.7c1.7.9 3.6 1.4 5.6 1.4h.1c6.5 0 11.8-5.3 11.8-11.8 0-3.2-1.2-6.1-3.4-8.4ZM12 21.7c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4a9.8 9.8 0 1 1 8.3 4.6Zm5.4-7.3c-.3-.1-1.7-.8-1.9-.9-.3-.1-.4-.1-.6.2-.2.3-.7.9-.9 1-.1.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.4.1-.5l.4-.5.3-.4c.1-.2 0-.4 0-.5L9.5 7c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5 0-.8.3-.3.3-1 1-1 2.4 0 1.3 1 2.6 1.2 2.8.1.2 2 3 4.8 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.7-.7 1.9-1.3.2-.7.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3Z" fill="currentColor" stroke="none"/>',
    email: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    linkedin: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7.5 10v7M11 17v-7M11 13a3 3 0 0 1 6 0v4"/><circle cx="7.5" cy="7" r=".6" fill="currentColor" stroke="none"/>'
  };
  const icon = (name, className = '') => `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${icons[name]}</svg>`;
  const options = [
    { label: copy.whatsapp, detail: number, href: 'https://wa.me/966595396073', icon: 'whatsapp', external: true, ltr: true },
    { label: copy.call, detail: number, href: `tel:${number}`, icon: 'phone', ltr: true },
    { label: copy.email, detail: email, href: `mailto:${email}`, icon: 'email', ltr: true },
    { label: copy.linkedin, detail: copy.profile, href: 'https://www.linkedin.com/in/shamseldeen-ismaiil-53186097', icon: 'linkedin', external: true }
  ];

  const widget = document.createElement('div');
  widget.id = 'contactWidget';
  widget.className = 'contact-widget';
  widget.hidden = true;
  widget.innerHTML = `
    <button class="contact-widget__toggle" type="button" aria-expanded="false" aria-controls="contactOptions" aria-label="${copy.contact}">
      ${icon('chat', 'contact-widget__chat-icon')}${icon('close', 'contact-widget__close-icon')}
      <span>${copy.contact}</span>
    </button>
    <div class="contact-widget__panel" id="contactOptions" hidden>
      <h2 class="contact-widget__heading">${copy.title}</h2>
      <p class="contact-widget__intro">${copy.intro}</p>
      <nav class="contact-widget__links" aria-label="${copy.options}">
        ${options.map(item => `<a class="contact-widget__link" href="${item.href}"${item.external ? ' target="_blank" rel="noopener noreferrer"' : ''}>
          <span class="contact-widget__icon">${icon(item.icon)}</span>
          <span><span class="contact-widget__label">${item.label}</span><span class="contact-widget__detail"${item.ltr ? ' dir="ltr"' : ''}>${item.detail}</span></span>
        </a>`).join('')}
      </nav>
    </div>`;
  document.body.append(widget);

  const toggle = widget.querySelector('button');
  const panel = widget.querySelector('.contact-widget__panel');
  const hero = document.querySelector('.hero, .case-hero, .learning-hero');
  const dashboard = document.getElementById('dashboard');
  const contact = document.getElementById('contact');
  const navigationToggle = document.getElementById('menuButton');

  function setOpen(open, returnFocus = false) {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? copy.close : copy.contact);
    if (returnFocus) toggle.focus({ preventScroll: true });
  }
  toggle.addEventListener('click', () => setOpen(panel.hidden));
  toggle.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      panel.querySelector('a').focus();
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) setOpen(false, true);
  });
  document.addEventListener('pointerdown', event => {
    if (!widget.contains(event.target)) setOpen(false);
  });
  document.addEventListener('focusin', event => {
    if (!widget.contains(event.target)) setOpen(false);
  });
  panel.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setOpen(false, true)));

  // Keep the introduction, live report, contact section and modal views clear.
  function inViewport(element) {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  }
  function updateVisibility() {
    const pastHero = hero ? hero.getBoundingClientRect().bottom <= 100 : window.scrollY > 250;
    const obscured = inViewport(dashboard) || inViewport(contact) ||
      navigationToggle?.getAttribute('aria-expanded') === 'true' ||
      document.documentElement.classList.contains('image-viewer-open') || Boolean(document.fullscreenElement);
    const hidden = !pastHero || obscured;
    if (hidden && !widget.hidden) {
      // Do not leave keyboard focus inside a control that has become hidden.
      if (widget.contains(document.activeElement)) document.activeElement.blur();
      setOpen(false);
    }
    widget.hidden = hidden;
  }
  let scheduled = false;
  function scheduleUpdate() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => { scheduled = false; updateVisibility(); });
  }
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('load', scheduleUpdate);
  document.addEventListener('fullscreenchange', scheduleUpdate);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', scheduleUpdate);
  if (typeof ResizeObserver !== 'undefined' && hero) new ResizeObserver(scheduleUpdate).observe(hero);
  const observer = new MutationObserver(scheduleUpdate);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  if (navigationToggle) observer.observe(navigationToggle, { attributes: true, attributeFilter: ['aria-expanded'] });
  updateVisibility();
})();
