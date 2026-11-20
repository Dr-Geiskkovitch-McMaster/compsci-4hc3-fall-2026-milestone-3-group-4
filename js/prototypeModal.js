let dialogEl = null;

function ensureDialog() {
  if (dialogEl) return dialogEl;

  const dialog = document.createElement('md-dialog');
  dialog.id = 'prototype-notice-dialog';

  const headerRow = document.createElement('div');
  headerRow.slot = 'headline';
  headerRow.style.display = 'flex';
  headerRow.style.alignItems = 'center';
  headerRow.style.gap = '1em';

  const icon = document.createElement('md-icon');
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = 'construction';

  const headline = document.createElement('div');
  headline.dataset.role = 'headline';

  headerRow.append(icon, headline);

  const content = document.createElement('div');
  content.slot = 'content';
  content.style.display = 'flex';
  content.style.flexDirection = 'column';
  content.style.gap = '8px';

  const messageEl = document.createElement('p');
  messageEl.dataset.role = 'message';
  messageEl.style.margin = '0';

  const contextEl = document.createElement('p');
  contextEl.dataset.role = 'context';
  contextEl.style.margin = '0';
  contextEl.style.color = 'var(--md-sys-color-on-surface-variant, #4A4458)';
  contextEl.style.fontSize = '0.9em';

  content.append(messageEl, contextEl);

  const actions = document.createElement('div');
  actions.slot = 'actions';

  const closeBtn = document.createElement('md-filled-button');
  closeBtn.textContent = 'Got it';
  closeBtn.addEventListener('click', () => dialog.close());
  actions.appendChild(closeBtn);

  dialog.append(headerRow, content, actions);
  document.body.appendChild(dialog);
  dialogEl = dialog;
  return dialogEl;
}

/**
 * Show a generic "not implemented in prototype" modal.
 * @param {string} [feature] - Name of the unimplemented feature/function.
 * @param {string} [context] - Additional explanation or context for the user.
 * @param {{ title?: string }} [options] - Optional overrides.
 */
export function showPrototypeModal(feature = '', context = '', title = 'Prototype Limitation') {
  const dialog = ensureDialog();

  const headline = dialog.querySelector('[data-role="headline"]');
  const messageEl = dialog.querySelector('[data-role="message"]');
  const contextEl = dialog.querySelector('[data-role="context"]');

  headline.textContent = title;
  messageEl.textContent = feature
    ? `"${feature}" is not implemented in this prototype.`
    : 'This feature is not implemented in this prototype.';

  if (context) {
    contextEl.textContent = context;
    contextEl.hidden = false;
  } else {
    contextEl.textContent = '';
    contextEl.hidden = true;
  }

  dialog.show();
}

window.showPrototypeModal = showPrototypeModal;
