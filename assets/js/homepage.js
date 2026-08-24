/**
 * AI Earn Hub - Homepage Interactive Effects
 *
 * Handles hero parallax, card mouse tracking, glass card movement,
 * enhanced scroll reveal, and reduced motion preferences.
 *
 * @package AI_Earn_Hub
 * @version 2.0.0
 */

( function() {
    'use strict';

    var prefersReducedMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

    /**
     * Hero Mouse Parallax - Subtle movement of glass cards and glow orbs
     */
    function initHeroParallax() {
        if ( prefersReducedMotion ) return;

        var hero = document.querySelector( '[data-hero]' );
        if ( ! hero ) return;

        var glassCards = hero.querySelectorAll( '.glass-card' );
        var glowOrbs = hero.querySelectorAll( '.glow-orb' );
        var aiVisual = hero.querySelector( '.hero-ai-visual' );

        var mouseX = 0;
        var mouseY = 0;
        var currentX = 0;
        var currentY = 0;
        var rafId = null;

        function lerp( start, end, factor ) {
            return start + ( end - start ) * factor;
        }

        function handleMouseMove( e ) {
            var rect = hero.getBoundingClientRect();
            mouseX = ( ( e.clientX - rect.left ) / rect.width - 0.5 ) * 2;
            mouseY = ( ( e.clientY - rect.top ) / rect.height - 0.5 ) * 2;
        }

        function animate() {
            currentX = lerp( currentX, mouseX, 0.05 );
            currentY = lerp( currentY, mouseY, 0.05 );

            glassCards.forEach( function( card ) {
                var speed = parseFloat( card.getAttribute( 'data-parallax' ) ) || 0.03;
                var x = currentX * speed * 100;
                var y = currentY * speed * 100;
                card.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
            } );

            glowOrbs.forEach( function( orb, i ) {
                var speed = 0.02 + ( i * 0.01 );
                var x = currentX * speed * 80;
                var y = currentY * speed * 80;
                orb.style.transform = 'translate(' + x + 'px, ' + y + 'px) scale(' + ( 1 + Math.abs( currentX ) * 0.05 ) + ')';
            } );

            if ( aiVisual ) {
                var x = currentX * 8;
                var y = currentY * 5;
                aiVisual.style.transform = 'translateY(-50%) translate(' + x + 'px, ' + y + 'px)';
            }

            rafId = requestAnimationFrame( animate );
        }

        hero.addEventListener( 'mousemove', handleMouseMove, { passive: true } );

        hero.addEventListener( 'mouseleave', function() {
            mouseX = 0;
            mouseY = 0;
        } );

        rafId = requestAnimationFrame( animate );
    }

    /**
     * Card Mouse Tracking - Radial gradient follows cursor
     */
    function initCardMouseTracking() {
        if ( prefersReducedMotion ) return;

        var cards = document.querySelectorAll( '.tool-card, .guide-card, .feature-card, .earn-card' );

        cards.forEach( function( card ) {
            card.addEventListener( 'mousemove', function( e ) {
                var rect = card.getBoundingClientRect();
                var x = ( ( e.clientX - rect.left ) / rect.width ) * 100;
                var y = ( ( e.clientY - rect.top ) / rect.height ) * 100;
                card.style.setProperty( '--mouse-x', x + '%' );
                card.style.setProperty( '--mouse-y', y + '%' );
            } );
        } );
    }

    /**
     * Enhanced Scroll Reveal - Sections and their children
     */
    function initScrollReveal() {
        var scrollElements = document.querySelectorAll( '[data-scroll-reveal]' );
        var scrollSections = document.querySelectorAll( '[data-scroll-section]' );

        if ( ! scrollElements.length && ! scrollSections.length ) return;

        if ( ! ( 'IntersectionObserver' in window ) ) {
            scrollElements.forEach( function( el ) {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            } );
            return;
        }

        // Section headers reveal
        var sectionObserver = new IntersectionObserver( function( entries ) {
            entries.forEach( function( entry ) {
                if ( entry.isIntersecting ) {
                    entry.target.classList.add( 'revealed' );
                    sectionObserver.unobserve( entry.target );
                }
            } );
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -60px 0px'
        } );

        scrollSections.forEach( function( section ) {
            var header = section.querySelector( '.section-header' );
            if ( header ) {
                header.setAttribute( 'data-scroll-reveal', '' );
                sectionObserver.observe( header );
            }
        } );

        // Individual card reveal with stagger
        var cardObserver = new IntersectionObserver( function( entries ) {
            entries.forEach( function( entry ) {
                if ( entry.isIntersecting ) {
                    var parent = entry.target.parentElement;
                    var siblings = Array.from( parent.children );
                    var index = siblings.indexOf( entry.target );
                    var delay = index * 80;

                    setTimeout( function() {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, delay );

                    cardObserver.unobserve( entry.target );
                }
            } );
        }, {
            threshold: 0.05,
            rootMargin: '0px 0px -30px 0px'
        } );

        var cardSelectors = '.tool-card, .guide-card, .feature-card, .earn-card, .article-card, .faq-item';
        scrollSections.forEach( function( section ) {
            var cards = section.querySelectorAll( cardSelectors );
            cards.forEach( function( card ) {
                card.style.opacity = '0';
                card.style.transform = 'translateY(28px)';
                card.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                cardObserver.observe( card );
            } );
        } );

        // Newsletter and CTA section reveal
        var ctaObserver = new IntersectionObserver( function( entries ) {
            entries.forEach( function( entry ) {
                if ( entry.isIntersecting ) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    ctaObserver.unobserve( entry.target );
                }
            } );
        }, {
            threshold: 0.15
        } );

        var newsletterCard = document.querySelector( '.newsletter-card' );
        var ctaContent = document.querySelector( '.cta-content' );

        [ newsletterCard, ctaContent ].forEach( function( el ) {
            if ( el ) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(32px)';
                el.style.transition = 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1), transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)';
                ctaObserver.observe( el );
            }
        } );
    }

    /**
     * Initialize all homepage effects
     */
    function init() {
        initHeroParallax();
        initCardMouseTracking();
        initScrollReveal();
    }

    if ( document.readyState === 'loading' ) {
        document.addEventListener( 'DOMContentLoaded', init );
    } else {
        init();
    }

} )();

