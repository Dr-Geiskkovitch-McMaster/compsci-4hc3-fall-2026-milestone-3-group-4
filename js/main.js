
import { initializeReview } from './review.js';

// Script for switching views in place using navigation bar
const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.app-view');

initializeReview();

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
    }
  });
});