/**
 * AI Earn Hub - Navigation Script
 *
 * Handles mobile menu toggle, dropdowns, and accessibility.
 *
 * @package AI_Earn_Hub
 * @version 1.0.0
 */

( function() {
    'use strict';

    const toggle = document.querySelector( '.menu-toggle' );
    const navigation = document.querySelector( '.main-navigation' );
    const body = document.body;

    if ( ! toggle || ! navigation ) {
        return;
    }

    /**
     * Toggle mobile menu
     */
    function toggleMenu() {
        const isExpanded = toggle.getAttribute( 'aria-expanded' ) === 'true';
        toggle.setAttribute( 'aria-expanded', ! isExpanded );
        navigation.classList.toggle( 'is-active' );
        body.classList.toggle( 'menu-open' );

        // Trap focus inside menu when open
        if ( ! isExpanded ) {
            const firstFocusable = navigation.querySelector( 'a, button, input, [tabindex]:not([tabindex="-1"])' );
            if ( firstFocusable ) {
                firstFocusable.focus();
            }
        }
    }

    /**
     * Close mobile menu
     */
    function closeMenu() {
        toggle.setAttribute( 'aria-expanded', 'false' );
        navigation.classList.remove( 'is-active' );
        body.classList.remove( 'menu-open' );
    }

    /**
     * Handle keyboard navigation
     */
    function handleKeyboard( event ) {
        // Close menu on Escape
        if ( event.key === 'Escape' ) {
            closeMenu();
            toggle.focus();
        }
    }

    /**
     * Handle click outside to close
     */
    function handleOutsideClick( event ) {
        if ( navigation.classList.contains( 'is-active' ) &&
             ! navigation.contains( event.target ) &&
             ! toggle.contains( event.target ) ) {
            closeMenu();
        }
    }

    /**
     * Handle dropdown toggles for touch devices
     */
    function handleDropdownToggle( event ) {
        const menuItem = event.target.closest( '.menu-item-has-children' );
        if ( ! menuItem ) return;

        // Only handle on touch devices
        if ( ! ( 'ontouchstart' in window ) ) return;

        const link = menuItem.querySelector( 'a' );
        const subMenu = menuItem.querySelector( 'ul' );

        if ( subMenu && event.target === link ) {
            event.preventDefault();
            menuItem.classList.toggle( 'is-open' );
        }
    }

    // Event listeners
    toggle.addEventListener( 'click', toggleMenu );
    document.addEventListener( 'keydown', handleKeyboard );
    document.addEventListener( 'click', handleOutsideClick );
    navigation.addEventListener( 'click', handleDropdownToggle );

    // Close menu on resize if viewport becomes desktop-sized
    let resizeTimer;
    window.addEventListener( 'resize', function() {
        clearTimeout( resizeTimer );
        resizeTimer = setTimeout( function() {
            if ( window.innerWidth > 1024 ) {
                closeMenu();
            }
        }, 250 );
    } );

    // Close menu when a link is clicked (for single-page feel)
    const navLinks = navigation.querySelectorAll( 'a' );
    navLinks.forEach( function( link ) {
        link.addEventListener( 'click', function() {
            if ( window.innerWidth <= 1024 ) {
                closeMenu();
            }
        } );
    } );

} )();

