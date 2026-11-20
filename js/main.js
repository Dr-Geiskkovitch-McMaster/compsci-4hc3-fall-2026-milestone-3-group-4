
import appData, { getColorPair } from './data.js';
import { renderBrowseView } from './browse.js';
import { initializeReview, stacks as reviewStacks } from './review.js';
import { renderAgendaView, scrollToToday } from './agenda.js';
import { openSpecialView } from './specialView.js';
import { openSearchView } from './search.js';
import './prototypeModal.js';

// Forces page to reload to today instead of where user was last scrolled
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

renderBrowseView();
renderAgendaView();

// Script for switching views in place using navigation bar
const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.app-view');
const topNav = document.querySelector('.top-nav-bar');

const topNavMenu = document.getElementById('top-nav-menu');
const navDrawer = document.getElementById('nav-drawer');
const navDrawerBackdrop = document.getElementById('nav-drawer-backdrop');
const navDrawerClose = document.getElementById('nav-drawer-close');

function openNavDrawer() {
  if (!navDrawer || !navDrawerBackdrop) return;
  navDrawer.hidden = false;
  navDrawerBackdrop.hidden = false;
}

function closeNavDrawer() {
  if (!navDrawer || !navDrawerBackdrop) return;
  navDrawer.hidden = true;
  navDrawerBackdrop.hidden = true;
}

topNavMenu?.addEventListener('click', openNavDrawer);
navDrawerClose?.addEventListener('click', closeNavDrawer);
navDrawerBackdrop?.addEventListener('click', closeNavDrawer);

document.querySelectorAll('.nav-drawer-item').forEach(item => {
  item.addEventListener('click', () => {
    const feature = item.dataset.feature ?? '';
    const context = item.dataset.context ?? '';
    closeNavDrawer();
    window.showPrototypeModal(feature, context);
  });
});

const avatarMenu = document.getElementById('top-nav-avatar');
avatarMenu.addEventListener('click', () => showPrototypeModal('User Config/Settings', 'This feature would allow the user to manage their accounts, sync, personas, or other environment settings.'));

const searchBar = document.getElementById('notes-search');
searchBar.addEventListener('click', openSearchView);

let lastScrollY = window.scrollY;

const review = initializeReview();

document.getElementById('today-fab')?.addEventListener('click', () => scrollToToday('smooth'));

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
      if (targetId === 'agenda-view') {
        renderAgendaView();
      } else {
        if (targetId === 'browse-view') {
          renderBrowseView();
        }
        window.scrollTo({ top: 0, behavior: 'instant' }); // Scroll to top for browse and review
      }
    }
  });
});

// // Currently disabled 
// window.addEventListener('scroll', () => {
//   const currentScrollY = window.scrollY;
//   // Always show at the very top of the page (handles iOS/trackpad bounce)
//   if (currentScrollY <= 0) {
//     topNav.classList.remove('top-nav-bar--hidden');
//     lastScrollY = 0;
//     return;
//   }
//   // Ignore tiny scroll jitter
//   if (Math.abs(currentScrollY - lastScrollY) < 6) return;
//   if (currentScrollY > lastScrollY && currentScrollY > topNav.offsetHeight) {
//     // Scrolling down
//     topNav.classList.add('top-nav-bar--hidden');
//   } else {
//     // Scrolling up
//     topNav.classList.remove('top-nav-bar--hidden');
//   }
//   lastScrollY = currentScrollY;
// }, { passive: true });
/* REVIEW CODE */

/* generate stacks based on stack array */
function renderStacks(stack) {
  const grid = document.createElement('div');
  grid.className = 'stack-grid';

  const button = document.createElement('button');
  button.className = 'layer stack-button';
  const icon = stack.iconClass
  ? Object.assign(document.createElement('span'), {
      className: `note-preview-status-icon ${stack.iconClass}`,
    })
  : document.createElement('md-icon');

  if (!stack.iconClass) {
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = stack.icon ?? 'label';
  }
  // stack icon can be first tag
  const tagData = appData.tags.find(item => 
    item.name === stack.tags[0]
  );

  const palette = getColorPair(tagData?.color);
  if (!stack.iconClass) {
    icon.style.color = palette.accent;
  }
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

const activeReview = document.querySelector('#active-review');
const stacks = document.querySelectorAll('.stack-button');
const undoReview = document.querySelector('#undo-fab');
const specialView = document.querySelector('#special-view');

function openStack(stack){
  activeReview.hidden = false;
  review.setStack(stack.tags);
  specialView.classList.add('special-view--review');
  openSpecialView({
    title: stack.name,
    content: activeReview,
    onClose: () => {
      activeReview.hidden = true;
      undoReview.classList.add('hidden');
      specialView.classList.remove('special-view--review');
      updateStackCount();
      review.clearTags();
    },
  });
}

document.querySelector('#new-stack-button').addEventListener('click', () => {
  activeReview.hidden = false;
  review.setStack('new-stack-button');
  openSpecialView({
    title: 'New Stack',
    content: activeReview,
    onClose: () => {
      activeReview.hidden = true;
      updateStackCount();
      review.clearTags();
    },
  });
});

function updateStackCount() {
  document.querySelectorAll('.stack-count').forEach(count => {
    const stack = reviewStacks[Number(count.dataset.stackIndex)];
    count.textContent = String(review.countStackNotes(stack));
  });
}

document.addEventListener('note-created', updateStackCount);

document.addEventListener('stack-created', event => {
  renderStacks(event.detail);
});
