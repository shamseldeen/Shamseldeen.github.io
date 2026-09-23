'use strict';

// Keep image URLs usable without JavaScript; enhance them with a native dialog.
(() => {
  if (typeof HTMLDialogElement === 'undefined' || !HTMLDialogElement.prototype.showModal) return;
  const arabic = document.documentElement.lang === 'ar';
  const label = arabic ? 'تكبير الصورة' : 'Enlarge image';
  const images = document.querySelectorAll('.page-visual img, .nutrition-hero-figure img, .study-figure img, .study-feature figure img, .project-cover img');
  images.forEach(img => {
    if (img.closest('a')) return;
    const link = document.createElement('a');
    link.href = img.getAttribute('src');
    link.className = 'image-zoom';
    link.target = '_blank';
    link.rel = 'noopener';
    img.before(link);
    link.append(img);
  });
  const links = document.querySelectorAll('a.image-zoom, a.screenshot-link, a.certificate-image');
  if (!links.length) return;

  const dialog = document.createElement('dialog');
  dialog.className = 'image-viewer';
  dialog.setAttribute('aria-labelledby', 'imageViewerTitle');
  dialog.setAttribute('aria-describedby', 'imageViewerCaption');
  const toolbar = document.createElement('div');
  toolbar.className = 'image-viewer-toolbar';
  const title = document.createElement('strong');
  title.id = 'imageViewerTitle';
  title.textContent = arabic ? 'عرض الصورة' : 'Image preview';
  const original = document.createElement('a');
  original.textContent = arabic ? 'فتح الصورة الأصلية ↗' : 'Open original ↗';
  original.target = '_blank';
  original.rel = 'noopener';
  const close = document.createElement('button');
  close.type = 'button';
  close.textContent = arabic ? 'إغلاق ×' : 'Close ×';
  close.autofocus = true;
  toolbar.append(title, original, close);
  const figure = document.createElement('figure');
  const image = document.createElement('img');
  const caption = document.createElement('figcaption');
  caption.id = 'imageViewerCaption';
  figure.append(image, caption);
  dialog.append(toolbar, figure);
  document.body.append(dialog);
  let opener;

  links.forEach(link => {
    const thumb = link.querySelector('img');
    if (!thumb) return;
    link.classList.add('image-zoom');
    link.setAttribute('aria-haspopup', 'dialog');
    link.setAttribute('aria-label', `${label}: ${thumb.alt}`);
    const hint = document.createElement('span');
    hint.className = 'image-zoom-hint';
    hint.setAttribute('aria-hidden', 'true');
    hint.textContent = label + ' ↗';
    link.append(hint);
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = link;
      image.src = link.href;
      image.alt = thumb.alt;
      caption.textContent = thumb.alt;
      original.href = link.href;
      dialog.showModal();
      document.documentElement.classList.add('image-viewer-open');
    });
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('image-viewer-open');
    opener?.focus({preventScroll: true});
    image.removeAttribute('src');
  });
})();
