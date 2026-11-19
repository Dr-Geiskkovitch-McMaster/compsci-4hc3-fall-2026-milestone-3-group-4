import appData, { getColorPair, getAllTagNames, getTagByName } from './data.js';
import { openSpecialView } from './specialView.js';
import { createAddCard, createBrowseCard, createNoteCard } from './cards.js'

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function parseDate(dateStr) {
  // Date-only strings like "2026-11-17" are parsed as UTC by default in JS;
  // append T00:00:00 so they are treated as local time consistently.
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(`${dateStr}T00:00:00`);
  }
  return new Date(dateStr);
}

function addToDate(date, amount, unit) {
  const d = new Date(date);
  if (unit === 'days') d.setDate(d.getDate() + amount);
  else if (unit === 'weeks') d.setDate(d.getDate() + amount * 7);
  else if (unit === 'months') d.setMonth(d.getMonth() + amount);
  return d;
}

function inDateRange(dateStr, range) {
  if (!range) return true;
  if (!dateStr) return false;

  const target = parseDate(dateStr);

  // Notice, this would not work for "all day" type creations, but they are
  // not supported as of now.
  // Static is within a non-moving window of time
  if (range.type === 'static') {
    if (range.start && target < startOfDay(parseDate(range.start))) return false;
    if (range.end && target > endOfDay(parseDate(range.end))) return false;
    return true;
  }

  // Relvative is used to determine in relation to the current (i.e. next 7 days)
  if (range.type === 'relative') {
    const today = startOfDay(new Date());
    if (range.direction === 'next') {
      const upper = endOfDay(addToDate(today, range.amount, range.unit));
      return target >= today && target <= upper;
    }
    if (range.direction === 'past') {
      const lower = startOfDay(addToDate(today, -range.amount, range.unit));
      return target >= lower && target <= endOfDay(today);
    }
  }

  return true;
}

// Based on the criteria sub-structure in the filter object
// Found in data.js > appData.filters.criteria
export function matchesFilter(note, criteria) {
  if (!criteria) return true;

  if (criteria.hasTag === true && note.tags.length === 0) return false;
  if (criteria.hasTag === false && note.tags.length > 0) return false;

  if (criteria.tags) {
    const { mode, values } = criteria.tags;
    if (mode === 'include' && !values.some(t => note.tags.includes(t))) return false;
    if (mode === 'exclude' && values.some(t => note.tags.includes(t))) return false;
  }

  if (criteria.hasDeadline === true && !note.dueDate) return false;
  if (criteria.hasDeadline === false && note.dueDate) return false;

  if (criteria.hasReminders === true && note.reminders.length === 0) return false;
  if (criteria.hasReminders === false && note.reminders.length > 0) return false;

  const { dateRanges } = criteria;
  if (dateRanges) {
    if (!inDateRange(note.createdAt, dateRanges.created)) return false;
    if (!inDateRange(note.lastModifiedAt, dateRanges.lastModified)) return false;
    if (!inDateRange(note.dueDate, dateRanges.deadline)) return false;
    if (dateRanges.reminders && !note.reminders.some(r => inDateRange(r.date, dateRanges.reminders))) {
      return false;
    }
  }

  return true;
}

function buildNotesContent(notes) {
  if (notes.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'special-view-empty';
    empty.textContent = 'No notes match this view.';
    return empty;
  }

  const fragment = document.createDocumentFragment();
  for (const note of notes) {
    const card = createNoteCard(note);
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
