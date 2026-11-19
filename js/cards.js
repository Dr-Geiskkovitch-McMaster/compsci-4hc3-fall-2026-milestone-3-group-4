import appData, { getColorPair, getAllTagNames, getTagByName } from "./data.js";

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

export function createNoteCard(note) {
  const card = document.createElement('article');
  card.className = 'note-preview-card';

  // TODO: Add visual representation of audio beyond just text + transcript
  const bodyText = document.createElement('p');
  bodyText.className = 'note-preview-text';
  bodyText.textContent =
    note.type === 'audio' ? `AUDIO ${note.audio.transcript}` : note.text;
  card.appendChild(bodyText);

  const meta = document.createElement('div');
  meta.className = 'note-preview-meta';

  const status = document.createElement('span');
  status.textContent = note.open ? 'Open' : 'Closed';
  meta.appendChild(status);

  if (note.dueDate) {
    const due = document.createElement('span');
    due.textContent = `Due ${note.dueDate}`;
    meta.appendChild(due);
  }

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

  card.appendChild(meta);

  return card;
}