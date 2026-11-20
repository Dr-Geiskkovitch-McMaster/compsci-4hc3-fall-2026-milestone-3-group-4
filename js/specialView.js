let activeOnClose = null;

function getElements() {
  return {
    container: document.getElementById('special-view'),
    title: document.getElementById('special-view-title'),
    headerActions: document.getElementById('special-view-header-actions'),
    body: document.getElementById('special-view-body'),
    backBtn: document.getElementById('special-view-back'),
    fabs: [ 
            document.getElementById('add-fab'),
            document.getElementById('today-fab'),
            document.getElementById('draft-fab-wrapper')
          ]
  };
}

export function closeSpecialView() {
  const { container, headerActions, body, fabs } = getElements();
  if (!container || container.hidden) return;

  container.hidden = true;
  for (const fab of fabs) {
    fab?.classList.remove('hidden');
  }
  if (headerActions) headerActions.replaceChildren();
  if (body) body.replaceChildren();

  const onClose = activeOnClose;
  activeOnClose = null;
  if (typeof onClose === 'function') {
    onClose();
  }
}

/**
 * Opens the full-screen Special View overlay.
 * @param {Object} options
 * @param {string} options.title - Title shown next to the back arrow.
 * @param {Node|Node[]|string} options.headerActions - Optional header actions/buttons to include in the header.
 * @param {Node|Node[]|string} options.content - Body content to render inside the view.
 * @param {Function} [options.onClose] - Optional callback invoked when closing.
 */
export function openSpecialView({ title = '', headerActions = '', content = '', onClose = null } = {}) {
  const { container, title: titleElement, headerActions: headerActionsContainer, body, fabs } = getElements();
  if (!container || !titleElement || !body) return;

  titleElement.textContent = title;
  if (headerActionsContainer) headerActionsContainer.replaceChildren();
  body.replaceChildren();

  //Allow flexible inputs to header actions
  if (Array.isArray(headerActions)) {
    headerActionsContainer.append(...headerActions);
  } else if (headerActions instanceof Node) {
    headerActionsContainer.appendChild(headerActions);
  } else if (typeof headerActions === 'string') {
    headerActionsContainer.innerHTML = headerActions;
  }

  // Allow flexible inputs to body content
  if (Array.isArray(content)) {
    body.append(...content);
  } else if (content instanceof Node) {
    body.appendChild(content);
  } else if (typeof content === 'string') {
    body.innerHTML = content;
  }

  activeOnClose = onClose;
  container.hidden = false;
  for (const fab of fabs) {
    fab?.classList.add('hidden');
  }

  // Scroll to top
  container.scrollTop = 0;
}

// Wire back button and Escape key once DOM is ready
const { backBtn } = getElements();
if (backBtn) {
  backBtn.addEventListener('click', closeSpecialView);
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeSpecialView();
  }
});
