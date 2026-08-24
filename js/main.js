/**
 * AI EARN HUB Main JavaScript
 * Handles: header scroll, mobile menu
 */

(function () {
  'use strict';

  const header = document.getElementById('header');
  const burgerBtn = document.getElementById('burgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-menu__link');

  // Header Scroll Effect
  function handleHeaderScroll() {
    if (window.pageYOffset > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });

  // Mobile Menu
  function toggleMobileMenu() {
    const isOpen = mobileMenu.classList.contains('active');
    mobileMenu.classList.toggle('active');
    burgerBtn.classList.toggle('active');
    burgerBtn.setAttribute('aria-expanded', !isOpen);
    mobileMenu.setAttribute('aria-hidden', isOpen);
    document.body.style.overflow = isOpen ? '' : 'hidden';
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove('active');
    burgerBtn.classList.remove('active');
    burgerBtn.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  burgerBtn.addEventListener('click', toggleMobileMenu);

  mobileLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      closeMobileMenu();
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
      closeMobileMenu();
    }
  });
})();
