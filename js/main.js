
import './data.js';
import { renderBrowseView } from './browse.js';

renderBrowseView();

// Script for switching views in place using navigation bar
const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.app-view');
const topNav = document.querySelector('.top-nav-bar');

let lastScrollY = window.scrollY;

navItems.forEach(item => {
  item.addEventListener('click', () => {

    // on click, remove the active class any navigation bar items
    navItems.forEach(nav => nav.classList.remove('active'));
    // add the active class to the newly selected item only
    item.classList.add('active');

    // remove all views
    views.forEach(view => {
      view.style.display = 'none';
    });

    // display the selected view
    const targetId = item.getAttribute('data-target');
    const targetView = document.getElementById(targetId);
    if (targetView) {
      targetView.style.display = 'block';
      if (targetId === 'browse-view') {
        renderBrowseView();
      }
    }
  });
});

window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;
  // Always show at the very top of the page (handles iOS/trackpad bounce)
  if (currentScrollY <= 0) {
    topNav.classList.remove('top-nav-bar--hidden');
    lastScrollY = 0;
    return;
  }
  // Ignore tiny scroll jitter
  if (Math.abs(currentScrollY - lastScrollY) < 6) return;
  if (currentScrollY > lastScrollY && currentScrollY > topNav.offsetHeight) {
    // Scrolling down
    topNav.classList.add('top-nav-bar--hidden');
  } else {
    // Scrolling up
    topNav.classList.remove('top-nav-bar--hidden');
  }
  lastScrollY = currentScrollY;
}, { passive: true });