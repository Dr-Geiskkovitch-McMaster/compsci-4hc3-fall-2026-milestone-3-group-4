const fab = document.getElementById('add-fab');
const panel = document.getElementById('text-creation-panel');
const textarea = document.getElementById('text-creation-textarea');
const textareaBackdrop = document.getElementById('text-creation-backdrop');
const closeButton = document.getElementById('close-button');
const submitButton = document.getElementById('submit-button');
const expandButton = document.getElementById('expand-button');
const expandIcon = document.getElementById('expand-icon');
const cardContainer = document.getElementById('card-container-today');


// trigger creating a note
fab.addEventListener('click', () => {
  panel.classList.remove('hidden');
  textareaBackdrop.classList.remove('hidden');
  fab.classList.add('hidden');

  textarea.focus();
});

// trigger expanding the note creation screen
expandButton.addEventListener('click', () => {
  panel.classList.toggle('fullscreen');
  const isFullScreen = panel.classList.contains('fullscreen');

  expandIcon.textContent = isFullScreen ? 'collapse_content' : 'expand_content';

  if (isFullScreen) {
    panel.style.bottom = '0px';
  }

});


// hide panel when close button is tapped
function closePanel() {
  textarea.blur(); 
  panel.classList.add('hidden');
  textareaBackdrop.classList.add('hidden');
  expandIcon.textContent = 'expand_content';
  fab.classList.remove('hidden');
  panel.style.bottom = '0px';
}

closeButton.addEventListener('click', closePanel);
textareaBackdrop.addEventListener('click', closePanel);

// save note text when submit button is tapped
// build a new horizontal card for the note made
submitButton.addEventListener('click', () => {
  const text = textarea.value.trim();
  if (!text) return;

  const newCard = document.createElement('div');
  newCard.className = 'horizontal-card';
  const cardContent = document.createElement('div');
  cardContent.className = 'card-content basic';

  const cardText = document.createElement('div');
  cardText.className = 'card-text';
  const cardBody = document.createElement('p');
  cardBody.className = 'card-body';
  cardBody.textContent = text;

  const cardActions = document.createElement('div');
  cardActions.className = 'card-actions';
  const iconButton = document.createElement('md-filled-icon-button');
  const icon = document.createElement('md-icon');
  icon.textContent = 'Edit';
  iconButton.appendChild(icon);
  
  cardText.appendChild(cardBody);
  cardActions.appendChild(iconButton);
  cardContent.appendChild(cardActions)
  cardContent.appendChild(cardText)

  newCard.appendChild(cardContent)

  cardContainer.prepend(newCard);

  textarea.value = "";

  closePanel();
});

if (window.visualViewport) {

    // Moves panel to be above the mobile keyboard when add button is tapped
  const updatePanelPosition = () => {
  if (panel.classList.contains('hidden') || panel.classList.contains('fullscreen')) return;
    
    
  const keyboardHeight = window.innerHeight - window.visualViewport.height - window.visualViewport.offsetTop;
  panel.style.bottom = `${Math.max(0, keyboardHeight)}px`;
  };

  window.visualViewport.addEventListener('resize', updatePanelPosition);
  window.visualViewport.addEventListener('scroll', updatePanelPosition);
}