/**
 * AI Earn Hub - Tutorial Sidebar Toggle
 * Handles mobile collapse/expand for course lesson sidebar
 */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        var toggle = document.querySelector('.tut-sidebar-toggle');
        var collapse = document.querySelector('.tut-sidebar-collapse');
        if (!toggle || !collapse) return;

        toggle.addEventListener('click', function () {
            var expanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', String(!expanded));
            collapse.classList.toggle('is-open');
        });
    });
})();
