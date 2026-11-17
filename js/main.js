
import { initializeReview, stacks as reviewStacks } from './review.js';

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

/* REVIEW CODE */

/* generate stacks based on stack array */
function renderStacks(stack) {
  const grid = document.createElement('div');
  grid.className = 'stack-grid';

  const button = document.createElement('button');
  button.className = 'layer stack-button';
  button.textContent = stack.name;
  button.addEventListener('click', () => openStack(stack));

  grid.append(button);

  for (const layerClass of ['layer-2', 'layer-3']) {
    const layer = document.createElement('div');
    layer.className = `layer ${layerClass}`;
    grid.append(layer);
  }

  const container = document.querySelector('#' + stack.type +'-stacks')

  container.append(grid);
}

reviewStacks.forEach(renderStacks);

const reviewHome = document.querySelector('#review-home');
const activeReview = document.querySelector('#active-review');
const stacks = document.querySelectorAll('.stack-button');

function openStack(stack){
  reviewHome.hidden = true;
  activeReview.hidden = false;
  topNavBar.classList.add('review-mode');
  bottomNavBar.classList.add('review-mode');
  review.setStack(stack.tags);
}

document.querySelector('#new-stack-button').addEventListener('click', () => {
  reviewHome.hidden = true;
  activeReview.hidden = false;
  topNavBar.classList.add('review-mode');
  bottomNavBar.classList.add('review-mode');
  review.setStack('new-stack-button');
});

document.querySelector('#exit-review').addEventListener('click', () => {
  reviewHome.hidden = false;
  activeReview.hidden = true;
  topNavBar.classList.remove('review-mode');
  bottomNavBar.classList.remove('review-mode');
  review.clearTags();
});

document.addEventListener('stack-created', event => {
  renderStacks(event.detail);
});