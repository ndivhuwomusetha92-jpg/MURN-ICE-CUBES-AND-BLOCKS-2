/* js/main.js - site-wide interactions (FAQ, search, enquiry calc, clock, auth, forms) */

document.addEventListener('DOMContentLoaded', () => {
  setAutoYear();
  setupMenuClose();
  initFAQ();
  initGalleryFilter();
  initContactClock();
  initEnquiryCalc();
  attachValidation('#contact-form');
  attachValidation('#enquiry-form');
  setupAuth(); // register/login local demo
  lazyLoadImages();
});

/* auto year in footer */
function setAutoYear(){
  const el = document.getElementById('year');
  if(el) el.textContent = new Date().getFullYear();
}

/* close mobile menu after clicking a link */
function setupMenuClose(){
  const menuToggle = document.querySelector('.menu-toggle-checkbox');
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => {
      if(menuToggle && menuToggle.checked) menuToggle.checked = false;
    });
  });
}

/* FAQ accordion - toggles paragraph under the header */
function initFAQ(){
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('h3');
    const a = item.querySelector('p');
    if(q && a){
      q.addEventListener('click', () => {
        const showing = a.style.display === 'block';
        // close others
        document.querySelectorAll('.faq-item p').forEach(p => p.style.display = 'none');
        a.style.display = showing ? 'none' : 'block';
      });
    }
  });
}

/* gallery filter (search by title/description) */
function initGalleryFilter(){
  const input = document.getElementById('searchInput') || document.getElementById('searchInput') || document.getElementById('searchInput');
  // some pages used id "searchInput"
  const grid = document.getElementById('galleryGrid') || document.getElementById('galleryGrid');
  const search = document.getElementById('searchInput') || document.getElementById('searchInput') || document.getElementById('searchInput');
  if(!search) return;
  search.addEventListener('input', () => {
    const term = search.value.trim().toLowerCase();
    document.querySelectorAll('.gallery-card').forEach(card => {
      const title = (card.querySelector('h3')?.textContent || '').toLowerCase();
      const desc = (card.querySelector('p')?.textContent || '').toLowerCase();
      const alt = (card.querySelector('img')?.alt || '').toLowerCase();
      const text = title + ' ' + desc + ' ' + alt;
      card.style.display = (!term || text.includes(term)) ? '' : 'none';
    });
  });
}

/* Contact page clock */
function initContactClock(){
  const el = document.getElementById('current-time');
  if(!el) return;
  function update(){
    const now = new Date();
    el.textContent = now.toLocaleString(); // local format
  }
  update();
  setInterval(update, 1000);
}

/* Enquiry calculator (qty * unit price) */
function initEnquiryCalc(){
  const qty = document.getElementById('eq-qty');
  const unit = document.getElementById('eq-unit-price');
  const totalEl = document.getElementById('eq-total');
  const overall = document.getElementById('eq-overall');
  if(!qty || !unit || !totalEl) return;
  function compute(){
    const q = parseFloat(qty.value) || 0;
    const u = parseFloat(unit.value) || 0;
    const total = q * u;
    totalEl.textContent = total.toFixed(2);

  }
  qty.addEventListener('input', compute);
  unit.addEventListener('input', compute);
  compute();
}

/* basic form validation handler and simulated send */
function attachValidation(selector){
  const form = document.querySelector(selector);
  if(!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    clearErrors(form);
    let ok = true;
    form.querySelectorAll('[required]').forEach(f => {
      if(!f.value || f.value.trim() === ''){
        ok = false;
        showFieldError(f, 'Please complete this field.');
      } else if(f.type === 'email'){
        const v = f.value.trim();
        if(!/^\S+@\S+\.\S+$/.test(v)){ ok = false; showFieldError(f,'Please enter a valid email.'); }
      }
    });
    if(!ok){
      const first = form.querySelector('.invalid');
      if(first) first.focus();
      return;
    }
    showToast('Message sent successfully — thank you!');
    setTimeout(()=> form.reset(), 500);
  });
}
function showFieldError(field, msg){
  field.classList.add('invalid');
  let n = field.nextElementSibling;
  if(!n || !n.classList || !n.classList.contains('field-error')){
    n = document.createElement('div');
    n.className = 'field-error';
    field.parentNode.insertBefore(n, field.nextSibling);
  }
  n.textContent = msg;
}
function clearErrors(form){
  form.querySelectorAll('.field-error').forEach(n=>n.remove());
  form.querySelectorAll('.invalid').forEach(n=>n.classList.remove('invalid'));
}

/* small toast */
function showToast(msg, time=2800){
  let t = document.getElementById('site-toast');
  if(!t){
    t = document.createElement('div');
    t.id = 'site-toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  setTimeout(()=> t.style.opacity = '0', time);
}

/* lazy loading fallback */
function lazyLoadImages(){
  document.querySelectorAll('img').forEach(img => {
    if(!img.hasAttribute('loading')) img.setAttribute('loading','lazy');
  });
}

/* Simple front-end auth (localStorage demo) */
function setupAuth(){
  const regForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');
  if(regForm){
    regForm.addEventListener('submit', e => {
      e.preventDefault();
      const name = regForm.querySelector('[name="reg-name"]').value.trim();
      const email = regForm.querySelector('[name="reg-email"]').value.trim();
      const pwd = regForm.querySelector('[name="reg-password"]').value;
      if(!name || !email || !pwd){ showToast('Please complete all fields'); return; }
      const users = JSON.parse(localStorage.getItem('murn_users') || '[]');
      if(users.find(u=>u.email===email)){ showToast('Email already registered'); return; }
      users.push({name, email, password: pwd});
      localStorage.setItem('murn_users', JSON.stringify(users));
      showToast('Registration successful — you can now log in');
      regForm.reset();
    });
  }
  if(loginForm){
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const email = loginForm.querySelector('[name="login-email"]').value.trim();
      const pwd = loginForm.querySelector('[name="login-password"]').value;
      const users = JSON.parse(localStorage.getItem('murn_users') || '[]');
      const found = users.find(u => u.email === email && u.password === pwd);
      if(found){
        localStorage.setItem('murn_current', JSON.stringify({name: found.name, email: found.email}));
    ;
        loginForm.reset();
      } else {
        showToast('Invalid credentials');
      }
    });
  }
}
/* js/script.js
   Site-wide interactivity:
   - auto-year
   - mobile menu auto-close
   - FAQ accordion
   - gallery search (by title/desc/tags)
   - employee search (about-us)
   - enquiry calculator (eq-qty x eq-unit-price)
   - form validation (contact + enquiry)
   - auth (login/register front-end demo)
   - initMap (Google Maps callback)
   - real-time clock (contact-us)
   - lazy load images and simple toast
*/

document.addEventListener('DOMContentLoaded', () => {
  setAutoYear();
  setupMobileMenu();
  initFAQ();
  initGallerySearch();
  initEmployeeSearch();
  initEnquiryCalculator();
  attachFormValidation('#contact-form');
  attachFormValidation('#enquiry-form');
  setupAuthDemo();
  lazyLoadImages();
  initClock();
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
    a.addEventListener('click', () => {
      if (toggle.checked) toggle.checked = false;
    });
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

/* Gallery search */
function initGallerySearch() {
  const input = document.getElementById('gallerySearch');
  const noResult = document.getElementById('galleryNoResult');
  if (!input) return;

  input.addEventListener('input', () => {
    const term = input.value.trim().toLowerCase();
    let visibleCount = 0;

    document.querySelectorAll('.gallery-card').forEach(card => {
      






      
      if (!term || text.includes(term)) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (noResult) noResult.style.display = visibleCount === 0 ? 'block' : 'none';
  });
}

/* Employee search (About page) */
function initEmployeeSearch() {
  const input = document.getElementById('employeeSearch');
  const noResult = document.getElementById('employeeNoResult');
  if (!input) return;

  input.addEventListener('input', () => {
    const term = input.value.trim().toLowerCase();
    let visibleCount = 0;

    document.querySelectorAll('.employee').forEach(card => {
     





      if (!term || text.includes(term)) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (noResult) noResult.style.display = visibleCount === 0 ? 'block' : 'none';
  });
}

/* Enquiry calculator */
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
    if (overall)
      overall.textContent = `Order: ${q} item(s) • Unit price: R${u.toFixed(
        2
      )} • Total: R${t.toFixed(2)}`;
  }

  qty.addEventListener('input', compute);
  unit.addEventListener('input', compute);
  compute();
}

/* Basic validation and simulated submission */
function attachFormValidation(selector) {
  const form = document.querySelector(selector);
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    clearFormErrors(form);
    let valid = true;

    form.querySelectorAll('[required]').forEach(field => {
      if (!field.value || field.value.trim() === '') {
        valid = false;
        showFieldError(field, 'Please complete this field.');
      } else if (field.type === 'email') {
        if (!/^\S+@\S+\.\S+$/.test(field.value.trim())) {
          valid = false;
          showFieldError(field, 'Please enter a valid email');
        }
      }
    });

    if (!valid) {
      const first = form.querySelector('.invalid');
      if (first) first.focus();
      return;
    }

    // simulate send
    showToast('Submission successful — we will respond shortly.');
    setTimeout(() => form.reset(), 700);
  });
}

function showFieldError(field, msg) {
  field.classList.add('invalid');
  let el = field.nextElementSibling;
  if (!el || !el.classList || !el.classList.contains('field-error')) {
    el = document.createElement('div');
    el.className = 'field-error';
    field.parentNode.insertBefore(el, field.nextSibling);
  }
  el.textContent = msg;
}

function clearFormErrors(form) {
  form.querySelectorAll('.field-error').forEach(n => n.remove());
  form.querySelectorAll('.invalid').forEach(n => n.classList.remove('invalid'));
}

/* Auth demo (localStorage) */
function setupAuthDemo() {
  const reg = document.getElementById('registerForm');
  const log = document.getElementById('loginForm');
  const loginTab = document.getElementById('loginTab');
  const registerTab = document.getElementById('registerTab');
  if (loginTab && registerTab && log && reg) {
    loginTab.addEventListener('click', () => {
      loginTab.classList.add('active');
      registerTab.classList.remove('active');
      log.classList.remove('hidden');
      reg.classList.add('hidden');
    });
    registerTab.addEventListener('click', () => {
      registerTab.classList.add('active');
      loginTab.classList.remove('active');
      reg.classList.remove('hidden');
      log.classList.add('hidden');
    });

    reg.addEventListener('submit', e => {
      e.preventDefault();
      const name = reg.querySelector('[name="reg-name"]').value.trim();
      const email = reg.querySelector('[name="reg-email"]').value.trim();
      const pwd = reg.querySelector('[name="reg-password"]').value;
      if (!name || !email || !pwd) {
        showToast('Complete all fields to register');
        return;
      }

      const users = JSON.parse(localStorage.getItem('murn_users') || '[]');
      if (users.find(u => u.email === email)) {
        showToast('Email already registered');
        return;
      }

      users.push({ name, email, password: pwd });
      localStorage.setItem('murn_users', JSON.stringify(users));
      showToast('Registration successful — please log in');
      reg.reset();
      loginTab.click();
    });

    log.addEventListener('submit', e => {
      e.preventDefault();
      const email = log.querySelector('[name="login-email"]').value.trim();
      const pwd = log.querySelector('[name="login-password"]').value;
      const users = JSON.parse(localStorage.getItem('murn_users') || '[]');
      const found = users.find(u => u.email === email && u.password === pwd);
      if (found) {
        



        log.reset();
      } else {
        showToast('Invalid credentials');
      }
    });
  }
}

/* Clock for contact-us */
function initClock() {
  const el = document.getElementById('current-time');
  if (!el) return;
  function update() {
    el.textContent = new Date().toLocaleString();
  }
  update();
  setInterval(update, 1000);
}

/* Lazy load fallback */
function lazyLoadImages() {
  document
    .querySelectorAll('img')
    .forEach(img => {
      if (!img.hasAttribute('loading'))
        img.setAttribute('loading', 'lazy');
    });
}

/* Toast */
