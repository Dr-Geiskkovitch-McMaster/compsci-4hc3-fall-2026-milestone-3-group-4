const fab = document.getElementById('add-fab');
const panel = document.getElementById('text-creation-panel');
const textarea = document.getElementById('text-creation-textarea');
const textareaBackdrop = document.getElementById('text-creation-backdrop');
const closeButton = document.getElementById('close-button');
const submitButton = document.getElementById('submit-button');
const expandButton = document.getElementById('expand-button');
const expandIcon = document.getElementById('expand-icon');
const cardContainer = document.getElementById('card-container-today');

const selectTagButton = document.getElementById('tag-select');
const tagDialog = document.getElementById('tag-dialog');
const tagSearch = document.getElementById('note-tag');
const tagOptions = document.getElementById('tag-select-options');
const selectedTagList = document.getElementById('selected-tags');
const selectedTags = new Set();
// Represents tags that were selected during the current dialog session
const sessionTags = new Set()
const tagSelectCancel = document.getElementById('cancel-tag-selection');
const tagSelectSave = document.getElementById('save-tag-selection');
const tagCreateName = document.getElementById('created-tag');
const tagCreateButton = document.getElementById('create-tag-button');

// dummy tags for testing tag selection when creating a note
export const tags = ['school', 'random', 'food', 'capstone', 'christmas'];
export const tagColors = {
    school: '#DDEBFF',
    capstone: '#E8D9FF',
    random: '#FFE6CC',
    home: '#D7F2DF',
    food: '#FFF2B3',
    untagged: '#e6e3e3',
    open: '#e6e3e3',
    due: '#e6e3e3'
}


// trigger creating a note
fab.addEventListener('click', () => {
  panel.classList.remove('hidden');
  textareaBackdrop.classList.remove('hidden');
  fab.classList.add('hidden');

  textarea.focus();
});

// change icon to 'submit' when user starts typing
textarea.addEventListener('input', () => {
  const userTyped = textarea.value.trim().length > 0;

  if (userTyped) {
    submitButton.innerHTML = '<md-icon>send</md-icon>';
  } else {
    submitButton.innerHTML = '<md-icon>mic</md-icon>';
  }

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
  submitButton.innerHTML = '<md-icon>mic</md-icon>';
  panel.style.bottom = '0px';
}

closeButton.addEventListener('click', closePanel);
textareaBackdrop.addEventListener('click', closePanel);

// open tag panel when tag select button is tapped
selectTagButton.addEventListener('click', () => {
  tagDialog.show();
  renderTagPicker();
});

tagSearch.addEventListener('input', () => {
  renderTagPicker();
});

function renderTagPicker() {

  // identify which of the current created tags match with the user's search
  const searchTerm = tagSearch.value.trim().toLowerCase();
  const matchingTags = tags.filter(tag => !selectedTags.has(tag) && tag.toLowerCase().includes(searchTerm));

  tagOptions.replaceChildren()
  matchingTags.forEach(tag => {
    const option = document.createElement('button');
    option.type = 'button';
    option.style.backgroundColor = tagColors[tag] ?? '#E5E5E5';
    option.className = 'tag-option';
    option.textContent = tag;
    option.addEventListener('click', () => {
        selectTag(tag);
    });
    
    tagOptions.append(option);
  

  });

  // render each selected tag
  selectedTagList.replaceChildren();
  selectedTags.forEach(tag => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'selected-tag';
    chip.textContent = `${tag} ×`;
    chip.style.backgroundColor = tagColors[tag] ?? '#E5E5E5';
    chip.setAttribute('aria-label', `Remove ${tag} tag`);
    chip.addEventListener('click', () => {
        sessionTags.delete(tag);
        selectedTags.delete(tag);
        renderTagPicker();
    });
    selectedTagList.append(chip);
  });
}

tagSelectCancel.addEventListener('click', () => {
  sessionTags.forEach((item) => selectedTags.delete(item));
  sessionTags.clear();
  tagDialog.close();
});

tagSelectSave.addEventListener('click', () => {
  sessionTags.clear();
  tagDialog.close();
});

function selectTag(tag) {
  sessionTags.add(tag);
  selectedTags.add(tag);
  tagSearch.value = '';
  renderTagPicker()
  tagSearch.focus()
}

// When user creates a tag, render it in the dialog
tagCreateButton.addEventListener('click', () => {
  const userCreatedTag = tagCreateName.value.trim();

  if (userCreatedTag.length > 0) {
    selectedTags.add(userCreatedTag);
    sessionTags.add(userCreatedTag)

    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'selected-tag';
    chip.textContent = `${userCreatedTag} ×`;
    chip.style.backgroundColor = tagColors[userCreatedTag] ?? '#E5E5E5';
    chip.setAttribute('aria-label', `Remove ${userCreatedTag} tag`);
    chip.addEventListener('click', () => {
        selectedTags.delete(userCreatedTag);
        sessionTags.delete(userCreatedTag)
        renderTagPicker();
    });

    tags.push(userCreatedTag);
    tagColors[userCreatedTag] = chip.backgroundColor;
    selectedTagList.append(chip);
  }

  tagCreateName.value = '';
});



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
  cardContent.appendChild(cardActions);
  cardContent.appendChild(cardText);

  newCard.appendChild(cardContent);

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