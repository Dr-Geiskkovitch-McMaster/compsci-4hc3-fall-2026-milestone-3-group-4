
import { initializeReview } from './review.js';

// Script for switching views in place using navigation bar
const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.app-view');

const topNavBar = document.querySelector('.top-nav-bar');
const bottomNavBar = document.querySelector('.bottom-nav-bar');

const review = initializeReview();

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

const reviewHome = document.querySelector('#review-home');
const activeReview = document.querySelector('#active-review');
const stacks = document.querySelectorAll('.stack-button');

stacks.forEach(item => {
  item.addEventListener('click', () => {
    reviewHome.hidden = true;
    activeReview.hidden = false;
    topNavBar.classList.add('review-mode');
    bottomNavBar.classList.add('review-mode');
    review.setStack(item.dataset.stack);
  });
});

document.querySelector('#exit-review').addEventListener('click', () => {
  reviewHome.hidden = false;
  activeReview.hidden = true;
  topNavBar.classList.remove('review-mode');
  bottomNavBar.classList.remove('review-mode');
  review.clearTags();
});