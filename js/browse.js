import appData, { getColorPair, getAllTagNames, getTagByName } from './data.js';
import { openSpecialView } from './specialView.js';
import { createAddCard, createBrowseCard, createNoteCard } from './cards.js'
import { matchesFilter } from './filters.js';

function buildNotesContent(notes) {
  if (notes.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'special-view-empty';
    empty.textContent = 'No notes match this view.';
    return empty;
  }

  const fragment = document.createDocumentFragment();
  for (const note of notes) {
    const card = createNoteCard(note, '12em');
    fragment.appendChild(card);
  }
  return fragment;
}

export function renderBrowseView() {
  const activeNotes = appData.notes.filter(note => !note.deleted);

  // Update pinned "View All" card counts and click handler
  const viewAllBtn = document.getElementById('browse-view-all-btn');
  const viewAllOpen = document.getElementById('browse-view-all-open');
  const viewAllTotal = document.getElementById('browse-view-all-total');
  if (viewAllOpen && viewAllTotal) {
    viewAllOpen.textContent = activeNotes.filter(n => n.open).length;
    viewAllTotal.textContent = activeNotes.length;
  }
  if (viewAllBtn) {
    viewAllBtn.onclick = () => {
      openSpecialView({
        title: 'View All',
        content: buildNotesContent(activeNotes)
      });
    };
  }

  // Render Filters
  const filtersList = document.getElementById('browse-filters-list');
  if (filtersList) {
    filtersList.replaceChildren();
    for (const filter of appData.filters) {
      const matched = activeNotes.filter(note => matchesFilter(note, filter.criteria));
      const card = createBrowseCard({
        title: filter.name,
        icon: filter.icon || 'filter_list',
        openCount: matched.filter(n => n.open).length,
        totalCount: matched.length,
        color: filter.color
      });
      card.dataset.filterId = filter.id;
      card.addEventListener('click', () => {
        openSpecialView({
          title: filter.name,
          content: buildNotesContent(matched)
        });
      });
      filtersList.appendChild(card);
    }
    filtersList.appendChild(createAddCard('Create new filter'));
  }

  // Render Tags
  const tagsList = document.getElementById('browse-tags-list');
  if (tagsList) {
    tagsList.replaceChildren();
    const tagMetaMap = new Map(appData.tags.map(t => [t.name, t]));
    for (const tagName of getAllTagNames()) {
      const matched = activeNotes.filter(note => note.tags.includes(tagName));
      const meta = tagMetaMap.get(tagName);
      const card = createBrowseCard({
        title: "#" + tagName,
        icon: meta?.icon || 'label',
        openCount: matched.filter(n => n.open).length,
        totalCount: matched.length,
        color: meta?.color
      });
      card.dataset.tagName = tagName;
      card.addEventListener('click', () => {
        openSpecialView({
          title: "#" + tagName,
          content: buildNotesContent(matched)
        });
      });
      tagsList.appendChild(card);
    }
    tagsList.appendChild(createAddCard('Create new tag'));
  }
}