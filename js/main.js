
import appData, { getColorPair } from './data.js';
import { renderBrowseView } from './browse.js';
import { initializeReview, stacks as reviewStacks } from './review.js';
import { renderAgendaView } from './agenda.js';

renderBrowseView();
renderAgendaView();

// Script for switching views in place using navigation bar
const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.app-view');
const topNav = document.querySelector('.top-nav-bar');

let lastScrollY = window.scrollY;

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
/* REVIEW CODE */

/* generate stacks based on stack array */
function renderStacks(stack) {
  const grid = document.createElement('div');
  grid.className = 'stack-grid';

  const button = document.createElement('button');
  button.className = 'layer stack-button';
  const icon = document.createElement('md-icon');
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = stack.icon ?? 'label';
  // stack icon can be first tag
  const tagData = appData.tags.find(item => 
    item.name === stack.tags[0]
  );

  const palette = getColorPair(tagData?.color);
  icon.style.color = palette.accent;

  const label = document.createElement('span');
  label.textContent = stack.name;

  button.replaceChildren(icon, label);
  button.addEventListener('click', () => openStack(stack));

  grid.append(button);

  for (const layerClass of ['layer-2', 'layer-3']) {
    const layer = document.createElement('div');
    layer.className = `layer ${layerClass}`;
    grid.append(layer);
  }

  const count = document.createElement('span');
  count.className = 'stack-count';
  count.textContent = review.countStackNotes(stack);
  count.dataset.stackIndex = reviewStacks.indexOf(stack);
  grid.append(button, count);

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

function updateStackCount() {
  document.querySelectorAll('.stack-count').forEach(count => {
    const stack = reviewStacks[Number(count.dataset.stackIndex)];
    count.textContent = String(review.countStackNotes(stack));
  });
}

document.querySelector('#exit-review').addEventListener('click', () => {
  reviewHome.hidden = false;
  activeReview.hidden = true;
  topNavBar.classList.remove('review-mode');
  bottomNavBar.classList.remove('review-mode');
  updateStackCount();
  review.clearTags();
});

document.addEventListener('stack-created', event => {
  renderStacks(event.detail);
});
