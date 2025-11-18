/* js/script.js - unified site script (search, validation, lightbox, UI) */

document.addEventListener('DOMContentLoaded', () => {
  setAutoYear();
  setupMobileMenu();
  initFAQ();
  initGallerySearch();
  initEmployeeSearch();
  initEnquiryCalculator();
  attachFormValidation('#contact-form');
  attachFormValidation('#enquiry-form');
  attachFormValidation('#enquiry-form'); // safe
  lazyLoadImages();
  initClock();
  initLightbox();
});

/* Auto year */
function setAutoYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

/* Mobile menu */
function setupMobileMenu() {
  const toggle = document.querySelector('.menu-toggle-checkbox');
  if (!toggle) return;
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => { if (toggle.checked) toggle.checked = false; });
  });
}

/* FAQ accordion */
function initFAQ() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('h3');
    const a = item.querySelector('p');
    if (q && a) {
      q.addEventListener('click', () => {
        const open = a.style.display === 'block';
        document.querySelectorAll('.faq-item p').forEach(p => p.style.display = 'none');
        a.style.display = open ? 'none' : 'block';
      });
    }
  });
}

/* Gallery search (and also used for get-involved gallery) */
function initGallerySearch() {
  const input = document.getElementById('gallerySearch');
  const noResult = document.getElementById('galleryNoResult');
  if (!input) return;
  input.addEventListener('input', () => {
    const term = input.value.trim().toLowerCase();
    let visibleCount = 0;
    document.querySelectorAll('.gallery-card').forEach(card => {
      const title = (card.querySelector('h3')?.textContent || '').toLowerCase();
      const description = (card.querySelector('p')?.textContent || '').toLowerCase();
      const alt = (card.querySelector('img')?.alt || '').toLowerCase();
      const tags = (card.dataset.tags || '').toLowerCase();
      const text = `${title} ${description} ${alt} ${tags}`;
      if (!term || text.includes(term)) { card.style.display = ''; visibleCount++; } else { card.style.display = 'none'; }
    });
    if (noResult) noResult.style.display = visibleCount === 0 ? 'block' : 'none';
  });
}

/* Employee search */
function initEmployeeSearch() {
  const input = document.getElementById('employeeSearch');
  const noResult = document.getElementById('employeeNoResult');
  if (!input) return;
  input.addEventListener('input', () => {
    const term = input.value.trim().toLowerCase();
    let visibleCount = 0;
    document.querySelectorAll('.employee').forEach(card => {
      const name = (card.dataset.name || '').toLowerCase();
      const role = (card.dataset.role || '').toLowerCase();
      const qual = (card.dataset.qual || '').toLowerCase();
      const text = `${name} ${role} ${qual}`;
      if (!term || text.includes(term)) { card.style.display = ''; visibleCount++; } else { card.style.display = 'none'; }
    });
    if (noResult) noResult.style.display = visibleCount === 0 ? 'block' : 'none';
  });
}

/* Enquiry Calculator */
function initEnquiryCalculator() {
  const qty = document.getElementById('eq-qty');
  const unit = document.getElementById('eq-unit-price');
  const totalEl = document.getElementById('eq-total');
  const overall = document.getElementById('eq-overall');
  if (!qty || !unit || !totalEl) return;
  function compute() {
    const q = parseFloat(qty.value) || 0;
    const u = parseFloat(unit.value) || 0;
    const t = q * u;
    totalEl.textContent = t.toFixed(2);
    if (overall) overall.textContent = `Order: ${q} item(s) • Unit price: R${u.toFixed(2)} • Total: R${t.toFixed(2)}`;
  }
  qty.addEventListener('input', compute);
  unit.addEventListener('input', compute);
  compute();
}

/* Validation & live field checks */
function attachFormValidation(selector) {
  const form = document.querySelector(selector);
  if (!form) return;

  // ensure each field has a field-error element after it for messages
  form.querySelectorAll('input,textarea,select').forEach(field => {
    // create .field-error element if missing
    if (!field.nextElementSibling || !field.nextElementSibling.classList || !field.nextElementSibling.classList.contains('field-error')) {
      const err = document.createElement('div'); err.className = 'field-error'; field.parentNode.insertBefore(err, field.nextSibling);
    }
  });

  // live validation per field
  form.querySelectorAll('input,textarea,select').forEach(field => {
    field.addEventListener('input', () => validateField(field));
    field.addEventListener('blur', () => validateField(field));
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll('input,textarea,select').forEach(field => {
      const ok = validateField(field);
      if (!ok) valid = false;
    });
    if (!valid) {
      showToast('Please fix errors highlighted in red', 3000);
      return;
    }
    // successful simulated submission
    showToast('✔ Submission successful — we will contact you shortly.', 3000);
    setTimeout(() => form.reset(), 700);
  });
}

function validateField(field) {
  if (!field) return true;
  const val = (field.value || '').trim();
  const name = field.name || field.id || '';
  const errorEl = field.nextElementSibling && field.nextElementSibling.classList && field.nextElementSibling.classList.contains('field-error') ? field.nextElementSibling : null;

  // clear errors
  if (errorEl) errorEl.textContent = '';

  // required
  if (field.hasAttribute('required') && !val) {
    field.classList.add('invalid');
    if (errorEl) errorEl.textContent = 'This field is required.';
    return false;
  }

  // email
  if (field.type === 'email' && val) {
    const re = /^\S+@\S+\.\S+$/;
    if (!re.test(val)) { field.classList.add('invalid'); if (errorEl) errorEl.textContent = 'Please enter a valid email address.'; return false; }
  }

  // phone
  if (name.toLowerCase().includes('phone') || name.toLowerCase().includes('tel')) {
    const re = /^\d{9,15}$/;
    if (val && !re.test(val)) { field.classList.add('invalid'); if (errorEl) errorEl.textContent = 'Phone must be numeric (min 9 digits).'; return false; }
  }

  // password rules (not used heavily here)
  if (name.toLowerCase().includes('password')) {
    const re = /^(?=.{6,})(?=.*\d).*/;
    if (val && !re.test(val)) { field.classList.add('invalid'); if (errorEl) errorEl.textContent = 'Password must be 6+ chars and include a number.'; return false; }
  }

  if (field.tagName.toLowerCase() === 'textarea' && val.length > 0 && val.length < 10) {
    field.classList.add('invalid'); if (errorEl) errorEl.textContent = 'Message should be at least 10 characters.'; return false;
  }

  field.classList.remove('invalid');
  if (errorEl) errorEl.textContent = '';
  return true;
}

/* Lazy load images */
function lazyLoadImages() { document.querySelectorAll('img').forEach(img => { if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy'); }); }

/* Toast */
function showToast(msg, time = 3000) {
  let t = document.getElementById('site-toast');
  if (!t) { t = document.createElement('div'); t.id = 'site-toast'; document.body.appendChild(t); }
  t.textContent = msg; t.style.opacity = '1';
  setTimeout(() => t.style.opacity = '0', time);
}

/* Clock for contact page */
function initClock() {
  const el = document.getElementById('current-time');
  if (!el) return;
  function update() { el.textContent = new Date().toLocaleString(); }
  update(); setInterval(update, 1000);
}

/* LIGHTBOX implementation (simple) */
function initLightbox() {
  // collect links with data-lightbox
  const links = Array.from(document.querySelectorAll('[data-lightbox]'));
  if (links.length === 0) return;

  // build lightbox if not present (for gallery page we included markup, but ensure)
  let lb = document.getElementById('lightbox');
  if (!lb) {
    lb = document.createElement('div'); lb.id = 'lightbox'; lb.className = '';
    lb.style.display = 'none';
    lb.innerHTML = '<button id="lb-close" aria-label="Close">✕</button><img id="lb-image" alt=""><div id="lb-caption"></div><button id="lb-prev" class="lb-nav" aria-label="Previous">◀</button><button id="lb-next" class="lb-nav" aria-label="Next">▶</button>';
    document.body.appendChild(lb);
  }
  const lbImage = lb.querySelector('#lb-image');
  const lbCaption = lb.querySelector('#lb-caption');
  const lbClose = lb.querySelector('#lb-close');
  const lbPrev = lb.querySelector('#lb-prev');
  const lbNext = lb.querySelector('#lb-next');

  // build array of items per gallery (group by data-lightbox value)
  const groups = {};
  links.forEach((a, i) => {
    const group = a.dataset.lightbox || 'default';
    if (!groups[group]) groups[group] = [];
    groups[group].push(a);
  });

  // state
  let currentGroup = null;
  let currentIndex = 0;

  function open(group, index) {
    currentGroup = group;
    currentIndex = index;
    const anchor = groups[group][index];
    lbImage.src = anchor.href;
    lbImage.alt = anchor.dataset.title || anchor.querySelector('img')?.alt || '';
    lbCaption.textContent = anchor.dataset.title || anchor.querySelector('img')?.alt || '';
    lb.style.display = 'flex';
    lb.setAttribute('aria-hidden', 'false');
  }
  function close() { lb.style.display = 'none'; lb.setAttribute('aria-hidden', 'true'); lbImage.src = ''; lbCaption.textContent = ''; }

  links.forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const group = a.dataset.lightbox || 'default';
      const index = groups[group].indexOf(a);
      open(group, index);
    });
  });

  lbClose.addEventListener('click', close);
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });

  lbPrev.addEventListener('click', () => {
    if (!currentGroup) return;
    currentIndex = (currentIndex - 1 + groups[currentGroup].length) % groups[currentGroup].length;
    open(currentGroup, currentIndex);
  });
  lbNext.addEventListener('click', () => {
    if (!currentGroup) return;
    currentIndex = (currentIndex + 1) % groups[currentGroup].length;
    open(currentGroup, currentIndex);
  });

  // keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (lb.style.display !== 'flex') return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') lbPrev.click();
    if (e.key === 'ArrowRight') lbNext.click();
  });
}

/* Google Maps placeholder function (if you include API) */
function initMap() {
  try {
    const coords = { lat: -23.0482, lng: 30.3940 };
    const map = new google.maps.Map(document.getElementById('map'), { center: coords, zoom: 12 });
    new google.maps.Marker({ position: coords, map: map, title: 'MURN ICE - Tshiombo' });
  } catch (e) {
    console.warn('Google Maps not loaded', e);
  }
}
