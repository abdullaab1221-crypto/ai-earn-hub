/**
 * AI Earn Hub - Scroll Script
 *
 * Handles sticky header, smooth scroll, FAQ toggles, and scroll animations.
 *
 * @package AI_Earn_Hub
 * @version 1.0.0
 */

( function() {
    'use strict';

    /**
     * Sticky Header
     */
    function initStickyHeader() {
        const header = document.querySelector( '.site-header' );
        if ( ! header ) return;

        let lastScroll = 0;

        function handleScroll() {
            const currentScroll = window.pageYOffset;

            // Add scrolled class for shadow
            if ( currentScroll > 50 ) {
                header.classList.add( 'scrolled' );
            } else {
                header.classList.remove( 'scrolled' );
            }

            lastScroll = currentScroll;
        }

        window.addEventListener( 'scroll', handleScroll, { passive: true } );
        handleScroll(); // Run on load
    }

    /**
     * Smooth Scroll for Anchor Links
     */
    function initSmoothScroll() {
        const anchorLinks = document.querySelectorAll( 'a[href^="#"]' );

        anchorLinks.forEach( function( link ) {
            link.addEventListener( 'click', function( event ) {
                const href = this.getAttribute( 'href' );

                // Skip empty anchors and #only
                if ( href === '#' || href.length < 2 ) return;

                const target = document.querySelector( href );
                if ( ! target ) return;

                event.preventDefault();

                const headerHeight = document.querySelector( '.site-header' )?.offsetHeight || 72;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

                window.scrollTo( {
                    top: targetPosition,
                    behavior: 'smooth'
                } );

                // Update URL without scroll
                history.pushState( null, null, href );
            } );
        } );
    }

    /**
     * FAQ Accordions
     */
    function initFAQ() {
        const faqItems = document.querySelectorAll( '.faq-item' );

        faqItems.forEach( function( item ) {
            const question = item.querySelector( '.faq-question' );
            if ( ! question ) return;

            question.addEventListener( 'click', function() {
                const isExpanded = this.getAttribute( 'aria-expanded' ) === 'true';

                // Close all other items
                faqItems.forEach( function( otherItem ) {
                    if ( otherItem !== item ) {
                        otherItem.classList.remove( 'active' );
                        otherItem.querySelector( '.faq-question' )?.setAttribute( 'aria-expanded', 'false' );
                    }
                } );

                // Toggle current item
                item.classList.toggle( 'active', ! isExpanded );
                this.setAttribute( 'aria-expanded', ! isExpanded );
            } );
        } );
    }

    /**
     * Scroll Reveal Animation
     */
    function initScrollReveal() {
        const elements = document.querySelectorAll( '.tool-card, .guide-card, .feature-card, .article-card, .earn-card, .section-header' );

        if ( ! elements.length ) return;

        if ( ! ( 'IntersectionObserver' in window ) ) {
            elements.forEach( function( el ) {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            } );
            return;
        }

        elements.forEach( function( el ) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(28px)';
            el.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        } );

        const observer = new IntersectionObserver( function( entries ) {
            entries.forEach( function( entry ) {
                if ( entry.isIntersecting ) {
                    const siblings = Array.from( entry.target.parentElement.children );
                    const index = siblings.indexOf( entry.target );
                    const delay = index * 80;

                    setTimeout( function() {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, delay );

                    observer.unobserve( entry.target );
                }
            } );
        }, {
            threshold: 0.08,
            rootMargin: '0px 0px -40px 0px'
        } );

        elements.forEach( function( el ) {
            observer.observe( el );
        } );
    }

    /**
     * Reading Progress Bar (Single Posts)
     */
    function initReadingProgress() {
        const article = document.querySelector( '.single-article' );
        if ( ! article ) return;

        // Create progress bar
        const progressBar = document.createElement( 'div' );
        progressBar.className = 'reading-progress';
        progressBar.setAttribute( 'role', 'progressbar' );
        progressBar.setAttribute( 'aria-label', 'Reading progress' );
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: var(--gradient-primary);
            z-index: 1001;
            transition: width 0.1s linear;
        `;
        document.body.appendChild( progressBar );

        function updateProgress() {
            const articleTop = article.offsetTop;
            const articleHeight = article.offsetHeight;
            const windowHeight = window.innerHeight;
            const scrollY = window.pageYOffset;

            const progress = Math.min( Math.max( ( scrollY - articleTop + windowHeight * 0.3 ) / articleHeight * 100, 0 ), 100 );

            progressBar.style.width = progress + '%';
            progressBar.setAttribute( 'aria-valuenow', Math.round( progress ) );
        }

        window.addEventListener( 'scroll', updateProgress, { passive: true } );
    }

    /**
     * Back to Top Button
     */
    function initBackToTop() {
        const scrollThreshold = 500;

        // Create button
        const button = document.createElement( 'button' );
        button.className = 'back-to-top';
        button.setAttribute( 'aria-label', 'Back to top' );
        button.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>`;
        button.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #6366f1, #4f46e5);
            color: #fff;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            visibility: hidden;
            transform: translateY(20px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 999;
            box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
        `;
        document.body.appendChild( button );

        function toggleButton() {
            if ( window.pageYOffset > scrollThreshold ) {
                button.style.opacity = '1';
                button.style.visibility = 'visible';
                button.style.transform = 'translateY(0)';
            } else {
                button.style.opacity = '0';
                button.style.visibility = 'hidden';
                button.style.transform = 'translateY(20px)';
            }
        }

        button.addEventListener( 'click', function() {
            window.scrollTo( { top: 0, behavior: 'smooth' } );
        } );

        button.addEventListener( 'mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 6px 24px rgba(99, 102, 241, 0.5)';
        } );

        button.addEventListener( 'mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 16px rgba(99, 102, 241, 0.4)';
        } );

        window.addEventListener( 'scroll', toggleButton, { passive: true } );
    }

    /**
     * Reading Time Estimate
     */
    function calculateReadingTime() {
        const content = document.querySelector( '.entry-content' );
        const readingTimeEl = document.querySelector( '.reading-time' );

        if ( ! content || ! readingTimeEl ) return;

        const text = content.textContent || content.innerText;
        const wordCount = text.trim().split( /\s+/ ).length;
        const readingTime = Math.ceil( wordCount / 200 );

        readingTimeEl.textContent = readingTime + ' min read';
    }

    // Initialize all
    document.addEventListener( 'DOMContentLoaded', function() {
        initStickyHeader();
        initSmoothScroll();
        initFAQ();
        initScrollReveal();
        initReadingProgress();
        initBackToTop();
        calculateReadingTime();
    } );

} )();

