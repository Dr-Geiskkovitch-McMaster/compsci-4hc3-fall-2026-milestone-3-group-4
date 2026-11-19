import appData from './data.js';
import { createAddCard, createAgendaCard } from './cards.js';

const DAYS_BEFORE = 20;
const DAYS_AFTER = 20;

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDayLabel(offset, date) {
  if (offset === -1) return 'Yesterday';
  if (offset === 0) return 'Today';
  if (offset === 1) return 'Tomorrow';
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function buildDayMap(notes) {
  const dayMap = new Map();

  for (const note of notes) {
    if (note.deleted || !note.createdAt) continue;

    const key = toDateKey(new Date(note.createdAt));
    if (!dayMap.has(key)) dayMap.set(key, []);
    dayMap.get(key).push(note);
  }

  return dayMap;
}

function createDaySection(offset, date, notes, todayKey) {
  const section = document.createElement('div');
  section.className = 'agenda-day card-list';

  const today = offset === 0;
  const now = new Date();

  if (today) section.id = 'agenda-today';

  const divider = document.createElement('md-divider');
  const heading = document.createElement('h1');
  heading.className = 'title-label-small';
  heading.textContent = formatDayLabel(offset, date);

  section.append(divider, heading);

  let cursorToBePlaced = today;

  for (const note of notes) {
    if (cursorToBePlaced && new Date(note.createdAt) >= now) {
        const cursor = document.createElement('div')
        cursor.className = 'today-time-cursor'
        section.appendChild(cursor)
        cursorToBePlaced = false;
    }
    section.appendChild(createAgendaCard(note, todayKey));
  }

  if (cursorToBePlaced) {
        const cursor = document.createElement('div')
        cursor.className = 'today-time-cursor'
        section.appendChild(cursor)
        cursorToBePlaced = false;
    }

  return section;
}

export function renderAgendaView() {
  const container = document.getElementById('agenda-card-container');
  if (!container) return;

  const today = new Date();
  const todayKey = toDateKey(today);
  const dayMap = buildDayMap(appData.notes);
  const fragment = document.createDocumentFragment();

  for (let offset = -DAYS_BEFORE; offset <= DAYS_AFTER; offset++) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    const key = toDateKey(date);
    const notesForDay = dayMap.get(key) ?? [];
    if (offset !== 0 && notesForDay.length === 0) continue;
    fragment.appendChild(createDaySection(offset, date, notesForDay, todayKey));
  }

  container.replaceChildren(fragment);

  const agendaView = document.getElementById('agenda-view');
  if (agendaView && agendaView.style.display !== 'none') {
    requestAnimationFrame(() => {
      document.getElementById('agenda-today')?.scrollIntoView({
        block: 'start',
        behavior: 'instant',
      });
    });
  }
}