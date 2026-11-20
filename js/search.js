import appData, { getColorPair } from './data.js';
import { createNoteCard } from './cards.js';
import { openSpecialView } from './specialView.js';

const FILTER_TYPES = [
  { label: 'Reminders', icon: 'notifications', query: 'reminders' },
  { label: 'Audio', icon: 'mic', query: 'audio' },
  { label: 'Images', icon: 'image', query: 'image' },
  { label: 'Pinned', icon: 'push_pin', query: 'pinned' },
  { label: 'Open', icon: 'radio_button_unchecked', query: 'open' },
];

const RECENT_SEARCHES = [
  '4HC3 wireframe',
  'groceries',
  'lab reflection',
  'standup prep',
];

function createChip(label, iconName, onClick, palette = null) {
  const chip = document.createElement('button');
  chip.type = 'button';
  chip.className = 'search-filter-chip';
  if (palette) {
    chip.style.setProperty('--chip-bg', palette.container);
    chip.style.setProperty('--chip-fg', palette.accent);
  }

  const ripple = document.createElement('md-ripple');
  const icon = document.createElement('md-icon');
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = iconName;

  const text = document.createElement('span');
  text.textContent = label;

  chip.append(ripple, icon, text);
  chip.addEventListener('click', onClick);
  return chip;
}

function getDummyResults() {
  return appData.notes.filter(n => !n.deleted).slice(0, 4);
}

function showSearchPrototypeModal(feature, context) {
  window.showPrototypeModal(feature, context);
}

export function openSearchView() {
  const searchField = document.createElement('md-filled-text-field');
  searchField.type = 'search';
  searchField.placeholder = 'Search your notes';
  searchField.className = 'filled-search-bar special-view-search';

  const trailingIcon = document.createElement('md-icon');
  trailingIcon.slot = 'trailing-icon';
  trailingIcon.textContent = 'search';
  searchField.appendChild(trailingIcon);

  const wrapper = document.createElement('div');
  wrapper.className = 'search-view-content';

  const idleSection = document.createElement('div');
  idleSection.className = 'search-idle-section';

  // Types filter section
  const typesHeading = document.createElement('h2');
  typesHeading.className = 'search-section-label';
  typesHeading.textContent = 'Types';

  const typesGrid = document.createElement('div');
  typesGrid.className = 'search-chip-group';
  for (const item of FILTER_TYPES) {
    typesGrid.appendChild(
      createChip(item.label, item.icon, () =>
        showSearchPrototypeModal('Search Filter', `Filtering search results by "${item.label}" is not implemented in this prototype.`)
      )
    );
  }

  // Tags filter section
  const tagsHeading = document.createElement('h2');
  tagsHeading.className = 'search-section-label';
  tagsHeading.textContent = 'Tags';

  const tagsGrid = document.createElement('div');
  tagsGrid.className = 'search-chip-group';
  for (const tag of appData.tags) {
    const palette = getColorPair(tag.color);
    tagsGrid.appendChild(
      createChip(`#${tag.name}`, tag.icon || 'label', () =>
        showSearchPrototypeModal('Search by Tag', `Filtering search results by "#${tag.name}" is not implemented in this prototype.`),
        palette
      )
    );
  }

  // Recent searches section at the bottom
  const recentHeading = document.createElement('h2');
  recentHeading.className = 'search-section-label';
  recentHeading.textContent = 'Recent searches';

  const recentList = document.createElement('div');
  recentList.className = 'search-recent-list';
  for (const term of RECENT_SEARCHES) {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'search-recent-item';

    const ripple = document.createElement('md-ripple');
    const histIcon = document.createElement('md-icon');
    histIcon.setAttribute('aria-hidden', 'true');
    histIcon.textContent = 'history';

    const label = document.createElement('span');
    label.className = 'search-recent-text';
    label.textContent = term;

    const fillIcon = document.createElement('md-icon');
    fillIcon.setAttribute('aria-hidden', 'true');
    fillIcon.textContent = 'north_west';

    row.append(ripple, histIcon, label, fillIcon);
    row.addEventListener('click', () =>
      showSearchPrototypeModal('Recent Searches', `Re-running recent search "${term}" is not implemented in this prototype.`)
    );
    recentList.appendChild(row);
  }

  idleSection.append(typesHeading, typesGrid, tagsHeading, tagsGrid, recentHeading, recentList);

  const resultsSection = document.createElement('div');
  resultsSection.className = 'search-results-section';
  resultsSection.hidden = true;

  // Intercept clicks on dummy result cards so they show the prototype modal
  resultsSection.addEventListener('click', (e) => {
    e.stopPropagation();
    showSearchPrototypeModal('Search Results', 'Opening notes from search results is not implemented in this prototype.');
  }, true);

  wrapper.append(idleSection, resultsSection);

  function updateResults(rawQuery) {
    const query = rawQuery.trim();
    if (!query) {
      idleSection.hidden = false;
      resultsSection.hidden = true;
      resultsSection.replaceChildren();
      return;
    }

    idleSection.hidden = true;
    resultsSection.hidden = false;

    const resultsLabel = document.createElement('h2');
    resultsLabel.className = 'search-section-label';
    resultsLabel.textContent = 'Results (Dummy)';

    const list = document.createElement('div');
    list.className = 'card-list';
    for (const note of getDummyResults()) {
      list.appendChild(createNoteCard(note, '10em'));
    }

    resultsSection.replaceChildren(resultsLabel, list);
  }

  searchField.addEventListener('input', () => {
    updateResults(searchField.value);
  });

  openSpecialView({
    title: '',
    headerActions: searchField,
    content: wrapper,
  });

  requestAnimationFrame(() => searchField.focus());
}
