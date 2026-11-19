import appData, { getColorPair, getAllTagNames, getTagByName } from "./data.js";
import { openNoteEditor } from "./create.js";

export function createBrowseCard({ title, icon, openCount, totalCount, color }) {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'm3-card m3-card--compact';

  const palette = getColorPair(color);
  card.style.setProperty('--card-accent', palette.accent);

  card.innerHTML = `
    <md-ripple></md-ripple>
    <div class="card-content">
      <div class="card-icon-circle card-icon-circle--compact">
        <md-icon aria-hidden="true">${icon}</md-icon>
      </div>
      <span class="card-title"></span>
    </div>
    <div class="card-stats">
      <div class="card-stat">
        <span class="card-stat-value">${openCount}</span>
        <span class="card-stat-label">open</span>
      </div>
      <div class="card-stat">
        <span class="card-stat-value card-stat-value--muted">${totalCount}</span>
        <span class="card-stat-label">total</span>
      </div>
    </div>
  `;

  card.querySelector('.card-title').textContent = title;
  return card;
}

export function createAddCard(ariaLabel) {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'm3-card m3-card--compact m3-card--add';
  card.setAttribute('aria-label', ariaLabel);
  card.innerHTML = `
    <md-ripple></md-ripple>
    <md-icon aria-hidden="true">add</md-icon>
  `;
  return card;
}

function formatDeadlineBadge(dueDateStr) {
  const due = /^\d{4}-\d{2}-\d{2}$/.test(dueDateStr)
    ? new Date(`${dueDateStr}T00:00:00`)
    : new Date(dueDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const diffDays = Math.round((due - today) / 86400000);

  if (diffDays === 0) return { text: 'Today', overdue: false };
  if (diffDays === 1) return { text: 'in 1 day', overdue: false };
  if (diffDays > 1 && diffDays <= 7) return { text: `in ${diffDays} days`, overdue: false };
  if (diffDays < 0 && diffDays >= -7) return { text: `${Math.abs(diffDays)} days overdue`, overdue: true };
  if (diffDays < 0) {
    const label = due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return { text: label, overdue: true };
  }
  return {
    text: due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    overdue: false,
  };
}

export function createNoteCard(note, maxTextHeight = '6.5em') {
  const card = document.createElement('article');
  card.className = 'note-preview-card';

  const statusIcon = document.createElement('span');
  statusIcon.className = `note-preview-status-icon ${
    note.open ? 'note-preview-status-icon--open' : 'note-preview-status-icon--closed'
  }`;
  statusIcon.setAttribute('role', 'img');
  statusIcon.setAttribute('aria-label', note.open ? 'Open' : 'Closed');

  const main = document.createElement('div');
  main.className = 'note-preview-main';

  // TODO: Add visual representation of audio beyond just text + transcript
  const bodyText = document.createElement('p');
  bodyText.className = 'note-preview-text';
  bodyText.textContent =
    note.type === 'audio' ? `AUDIO ${note.audio.transcript}` : note.text;

  if (maxTextHeight) {
    bodyText.classList.add('note-preview-text--clamped');
    bodyText.style.setProperty(
      '--max-text-height',
      typeof maxTextHeight === 'number' ? `${maxTextHeight}px` : maxTextHeight
    );

    const observer = new ResizeObserver(() => {
      bodyText.classList.toggle(
        'is-truncated',
        bodyText.scrollHeight > bodyText.clientHeight + 1
      );
    });
    observer.observe(bodyText);
  }

  main.appendChild(bodyText);

  if (maxTextHeight) {
    const moreIcon = document.createElement('md-icon');
    moreIcon.className = 'note-preview-more';
    moreIcon.setAttribute('aria-hidden', 'true');
    moreIcon.textContent = 'expand_more';
    main.appendChild(moreIcon);
  }

  const meta = document.createElement('div');
  meta.className = 'note-preview-meta';

  for (const tag of note.tags) {
    const tagEl = document.createElement('span');
    const tagObj = getTagByName(tag);
    const palette = getColorPair(tagObj?.color);
    tagEl.style.setProperty('--tag-container', palette.container);
    tagEl.style.setProperty('--tag-accent', palette.accent);
    tagEl.className = 'note-preview-tag';
    tagEl.textContent = `#${tagObj?.name ?? tag}`;
    meta.appendChild(tagEl);
  }

  if (meta.hasChildNodes()) {
    main.appendChild(meta);
  }

  card.append(statusIcon, main);

  if (note.dueDate && note.open) {
    const { text, overdue } = formatDeadlineBadge(note.dueDate);
    const badge = document.createElement('span');
    badge.className = `note-preview-deadline${overdue ? ' note-preview-deadline--overdue' : ''}`;

    const badgeIcon = document.createElement('md-icon');
    badgeIcon.setAttribute('aria-hidden', 'true');
    badgeIcon.textContent = 'target';

    badge.append(badgeIcon, text);
    card.appendChild(badge);
  }

  card.addEventListener('click', () => {
    document.dispatchEvent(
      new CustomEvent('note-edit-requested', { detail: {
        note,
        onSave: () => card.replaceWith(createNoteCard(note, maxTextHeight))
      } })
    );
  });
  return card;
}

export function createAgendaCard(note, todayKey) {
  const isOverdue = Boolean(note.dueDate && note.dueDate < todayKey && note.open);

  const card = createNoteCard(note);

  return card;
}