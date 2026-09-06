document.addEventListener('DOMContentLoaded', () => {
  initFooterYear();
  initNavbarScrollState();
  initMobileMenu();
  initActiveNavHighlight();
  initScrollReveal();
  initProjectFilters();
  initContactForm();
});

const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';
const EMAILJS_SERVICE_ID = 'service_zv9lavf';
const EMAILJS_TEMPLATE_ID = 'template_duy30dl';

function initFooterYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

function initNavbarScrollState() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const updateState = () => {
    navbar.classList.toggle('is-scrolled', window.scrollY > 12);
  };

  updateState();
  window.addEventListener('scroll', updateState, { passive: true });
}

/* ---------------------------------- */
/* Mobile hamburger menu               */
/* ---------------------------------- */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!hamburger || !mobileMenu) return;

  const closeMenu = () => {
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open menu');
    mobileMenu.classList.remove('is-open');
  };

  const openMenu = () => {
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Close menu');
    mobileMenu.classList.add('is-open');
  };

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  });

  // Close the mobile menu whenever a link inside it is clicked
  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}

/* ---------------------------------- */
/* Highlight active section in nav     */
/* ---------------------------------- */
function initActiveNavHighlight() {
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('[data-nav]');

  if (!sections.length || !navLinks.length) return;

  const setActiveLink = (id) => {
    navLinks.forEach((link) => {
      const isMatch = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('active', isMatch);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveLink(entry.target.id);
        }
      });
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

/* ---------------------------------- */
/* Scroll reveal animations            */
/* ---------------------------------- */
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    // Show everything immediately, skip the animated reveal
    revealEls.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );

  revealEls.forEach((el) => observer.observe(el));
}

/* ---------------------------------- */
/* Project filtering                   */
/* ---------------------------------- */
function initProjectFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  const emptyState = document.getElementById('projects-empty');

  if (!filterButtons.length || !projectCards.length) return;

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;

      // Update active button state
      filterButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');

      let visibleCount = 0;

      projectCards.forEach((card) => {
        const matches = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('is-hidden', !matches);
        if (matches) visibleCount += 1;
      });

      if (emptyState) {
        emptyState.hidden = visibleCount !== 0;
      }
    });
  });
}

/* ---------------------------------- */
/* Contact form + EmailJS              */
/* ---------------------------------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const statusEl = document.getElementById('form-status');

  if (!form || !statusEl) return;

  const emailJsConfigured =
    typeof emailjs !== 'undefined' &&
    EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY';

  if (emailJsConfigured) {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

  const fields = {
    name: {
      el: form.querySelector('#name'),
      message: 'Please enter your name (at least 2 characters).'
    },

    email: {
      el: form.querySelector('#email'),
      message: 'Please enter a valid email address.'
    },

    subject: {
      el: form.querySelector('#subject'),
      message: 'Please enter a subject (at least 3 characters).'
    },

    message: {
      el: form.querySelector('#message'),
      message: 'Please enter a message (at least 10 characters).'
    }
  };

  /* ---------------------------------- */
  /* Show / hide field errors            */
  /* ---------------------------------- */
  const setFieldError = (key, errorMessage) => {
    const { el } = fields[key];

    if (!el) return;

    const wrapper = el.closest('.form-field');
    const errorEl = wrapper?.querySelector('.form-error');

    if (!wrapper || !errorEl) return;

    if (errorMessage) {
      wrapper.classList.add('has-error');
      errorEl.textContent = errorMessage;
    } else {
      wrapper.classList.remove('has-error');
      errorEl.textContent = '';
    }
  };

  /* ---------------------------------- */
  /* Validate individual field          */
  /* ---------------------------------- */
  const validateField = (key) => {
    const { el, message } = fields[key];

    if (!el) return false;

    const isValid = el.checkValidity();

    setFieldError(key, isValid ? '' : message);

    return isValid;
  };

  /* ---------------------------------- */
  /* Live validation                     */
  /* ---------------------------------- */
  Object.keys(fields).forEach((key) => {
    const { el } = fields[key];

    if (!el) return;

    el.addEventListener('blur', () => {
      validateField(key);
    });

    el.addEventListener('input', () => {
      const wrapper = el.closest('.form-field');

      if (wrapper?.classList.contains('has-error')) {
        validateField(key);
      }
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate all fields
    const results = Object.keys(fields).map((key) => {
      return validateField(key);
    });

    const allValid = results.every(Boolean);

    if (!allValid) {
      statusEl.textContent =
        'Please fix the highlighted fields before sending.';

      statusEl.classList.add('is-error');

      return;
    }

    // Show sending status
    statusEl.classList.remove('is-error');
    statusEl.textContent = 'Sending message...';

    try {
      if (!emailJsConfigured) {
        throw new Error('EmailJS public key is not configured.');
      }

      emailjs.init({
  publicKey: EMAILJS_PUBLIC_KEY
});

    await emailjs.sendForm(
     EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
    form
);
const EMAILJS_PUBLIC_KEY = 'UDITlXmef-lDUx903';
const EMAILJS_SERVICE_ID = 'service_zv9lavf';
const EMAILJS_TEMPLATE_ID = 'template_duy30dl';

      // Success
      statusEl.classList.remove('is-error');
      statusEl.textContent =
        'Message sent successfully! Thank you for contacting me.';

      // Clear form
      form.reset();

      // Clear validation styles
      Object.keys(fields).forEach((key) => {
        setFieldError(key, '');
      });

    } catch (error) {
      // Show error in browser console
      console.error('EmailJS Error:', error);

      statusEl.classList.add('is-error');
      const errorMessage = String(error?.message || error?.text || '');
      statusEl.textContent = errorMessage.toLowerCase().includes('public key')
        ? 'Add your EmailJS public key in script.js before sending.'
        : `Email could not be sent: ${errorMessage || 'check your EmailJS service and template IDs.'}`;
    }
  });
}