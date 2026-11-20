import appData, { getColorPair, getAllTagNames, getTagByName } from './data.js';
import { openSpecialView } from './specialView.js';
import { createAddCard, createBrowseCard, createNoteCard } from './cards.js'
import { matchesFilter } from './filters.js';

function buildNotesSection(title, iconName, notes, header = true, first = false) {
  const details = document.createElement('details');
  details.open = true;
  details.className = 'browse-section';

  const summary = document.createElement('summary');
  summary.className = first ? 'm3-hr m3-hr--first' : 'm3-hr';

  const icon = document.createElement('md-icon');
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = iconName;

  const subtitle = document.createElement('span');
  subtitle.className = 'm3-hr-subtitle';
  subtitle.textContent = title;

  const chevron = document.createElement('md-icon');
  chevron.className = 'browse-section-chevron';
  chevron.setAttribute('aria-hidden', 'true');
  chevron.textContent = 'expand_more';

  summary.append(icon, subtitle, chevron);

  const list = document.createElement('div');
  list.className = 'card-list';
  for (const note of notes) {
    list.appendChild(createNoteCard(note, '12em'));
  }

  details.append(summary, list);

  return header ? details : list;
}

function buildNotesContent(notes) {
  if (notes.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'special-view-empty';
    empty.textContent = 'No notes match this view.';
    return empty;
  }

  const notesSorted = [...notes].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const pinnedNotes = notesSorted.filter(note => note.pinned);
  const unpinnedNotes = notesSorted.filter(note => !note.pinned);

  let atLeastOnePinned = pinnedNotes.length > 0

  const fragment = document.createDocumentFragment();
  if (pinnedNotes.length > 0) {
    fragment.appendChild(buildNotesSection('Pinned', 'push_pin', pinnedNotes, true, true));
  }
  if (unpinnedNotes.length > 0) {
    fragment.appendChild(buildNotesSection('Unpinned', 'notes', unpinnedNotes, atLeastOnePinned));
  }
  return fragment;
}

function createHeaderActionButton(iconName, label, feature, context) {
  const btn = document.createElement('md-icon-button');
  btn.setAttribute('aria-label', label);
  btn.title = label;

  const icon = document.createElement('md-icon');
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = iconName;

  btn.appendChild(icon);
  btn.addEventListener('click', () => {
    window.showPrototypeModal(feature, context);
  });
  return btn;
}

function buildBrowseHeaderActions() {
  return [
    createHeaderActionButton(
      'filter_alt',
      'Filter notes',
      'Filter Notes',
      'This would allow users to apply additional filter criteria within the current Browse list.'
    ),
    createHeaderActionButton(
      'workspaces',
      'Group notes by',
      'Group By',
      'This would allow users to group notes by tag, due date, status, or creation date.'
    )
  ];
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
        headerActions: buildBrowseHeaderActions(),
        content: buildNotesContent(activeNotes)
      });
    };
  }

  // Render Filters
  const filtersList = document.getElementById('browse-filters-list');
  if (filtersList) {
    filtersList.replaceChildren();
    const sortedFilters = [...appData.filters].sort((a, b) => a.name.localeCompare(b.name));
    for (const filter of sortedFilters) {
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
          headerActions: buildBrowseHeaderActions(),
          content: buildNotesContent(matched)
        });
      });
      filtersList.appendChild(card);
    }
    filtersList.appendChild(
      createAddCard(
        'Create new filter',
        () => {
          window.showPrototypeModal(
            'Add Filter via Browse', 'This would allow users to set up new custom filter objects which can be used in both browse and review.'
          )
        },
        'New Filter'
      )
    )
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
          headerActions: buildBrowseHeaderActions(),
          content: buildNotesContent(matched)
        });
      });
      tagsList.appendChild(card);
    }
    tagsList.appendChild(
      createAddCard(
        'Create new tag',
        () => {
          window.showPrototypeModal(
            'Add Tag via Browse', 'This would allow users to set up new custom tags which can be used in both browse, create, and review.'
          )
        },
        'New Tag'
      )
    )
  }
}