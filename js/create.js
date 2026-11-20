import appData, { getColorPair } from './data.js';
import { renderAgendaView } from "./agenda.js";
import { renderBrowseView } from "./browse.js";

const fab = document.getElementById('add-fab');
const todayFab = document.getElementById('today-fab');
const panel = document.getElementById('text-creation-panel');
const textarea = document.getElementById('text-creation-textarea');
const textareaBackdrop = document.getElementById('text-creation-backdrop');
const closeButton = document.getElementById('close-button');
const submitButton = document.getElementById('submit-button');
const expandButton = document.getElementById('expand-button');
const expandIcon = document.getElementById('expand-icon');
const tagsContainer = document.getElementById('textarea-tag-container');
const addMediaButton = document.getElementById('media-select');
const favouriteButton = document.getElementById('star-button');

// Tag Selection
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

// Reminder Selection
const dueDateCreateButton = document.getElementById('reminder-select');
const dueDateDialog = document.getElementById('due-date-set');
const dueDateCancelButton = document.getElementById('due-date-cancel');
const dueDateSaveButton = document.getElementById('due-date-save');
const dueDateInput = document.getElementById('due-date-input');

const viewPort = window.visualViewport;

export const tags = [...new Set([...appData.tags])];

let editingNote = null;
let saveCallback = null;

renderAgendaView();


dueDateCreateButton.addEventListener('click', () => {
  openDueDateDialog();
});

dueDateCancelButton.addEventListener('click', () => {
  dueDateInput.value = '';
  dueDateDialog.close();
});


function openDueDateDialog() {
  const earliestReminder = new Date();
  if (!dueDateInput.value) {
    dueDateInput.value = '';
    dueDateInput.min = toLocalDateValue(earliestReminder);
    dueDateInput.setCustomValidity('');
  }
  
  dueDateDialog.show();
}

dueDateSaveButton.addEventListener('click', () => {
  if (!dueDateInput.value) {
      dueDateDialog.show();
      dueDateInput.setCustomValidity('Choose a valid date.');
      dueDateInput.reportValidity();
      return;
  }

  dueDateDialog.close();

});

function toLocalDateValue(date) {
    const pad = value => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function resetTextArea(){
  textarea.value='';
  selectedTags.clear();
  sessionTags.clear();
}

// trigger creating a note
fab.addEventListener('click', () => {
  panel.classList.remove('hidden');
  textareaBackdrop.classList.remove('hidden');
  fab.classList.add('hidden');
  todayFab.classList.add('hidden')

  // remove any existing text or tags when new note created
  resetTextArea();
  // render the tags for the current note at the bottom of the text area
  renderTextAreaTags();

  // if panel is full screen, change it back to collapsed
  if (panel.classList.contains('fullscreen')) {
    toggleFullScreen();
  }
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

function renderTextAreaTags() {
  const currentTags = [...selectedTags].map(tagText => {
    const chip = document.createElement('button');
    const tagData = appData.tags.find(item => item.name === tagText);
    const palette = getColorPair(tagData?.color);
    chip.type = 'button';
    chip.className = 'selected-tag';
    chip.textContent = `${tagText} ×`;
    chip.style.backgroundColor = palette?.container ?? '#E5E5E5';
    chip.style.color = palette.accent;
    chip.setAttribute('aria-label', `Remove ${tagText} tag`);

    return chip;
  });
  tagsContainer.replaceChildren(...currentTags);

}

function toggleFullScreen() {
  panel.classList.toggle('fullscreen');
  const isFullScreen = panel.classList.contains('fullscreen');
  expandIcon.textContent = isFullScreen ? 'collapse_content' : 'expand_content';
  panel.style.removeProperty('bottom');
  updatePanelPosition(panel);

  textarea.focus();
}

// trigger expanding the note creation screen
expandButton.addEventListener('click', () => {
  toggleFullScreen();

});



// hide panel when close button is tapped
function closePanel() {
  textarea.blur(); 
  panel.classList.add('hidden');
  textareaBackdrop.classList.add('hidden');
  fab.classList.remove('hidden');
  todayFab.classList.remove('hidden')
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
  const matchingTags = tags.filter(tag => !selectedTags.has(tag.name) && tag.name.toLowerCase().includes(searchTerm));

  tagOptions.replaceChildren()
  matchingTags.forEach(tag => {
    const option = document.createElement('button');
    const tagData = appData.tags.find(item => item.name == tag.name);
    const palette = getColorPair(tagData?.color);
    option.type = 'button';
    option.style.backgroundColor = palette?.container ?? '#E5E5E5';
    option.style.color = palette?.accent ?? '#000000';
    option.className = 'tag-option';
    option.textContent = tag.name;
    option.addEventListener('click', () => {
        selectTag(tag.name);
    });
    
    tagOptions.append(option);
  

  });


  // render each selected tag
  selectedTagList.replaceChildren();
  selectedTags.forEach(tag => {
    const chip = document.createElement('button');
    const tagData = appData.tags.find(item => item.name === tag);
    const palette = getColorPair(tagData?.color);
    chip.type = 'button';
    chip.className = 'selected-tag';
    chip.textContent = `${tag} ×`;
    chip.style.backgroundColor = palette?.container ?? '#E5E5E5';
    chip.style.color = palette.accent;
    chip.setAttribute('aria-label', `Remove ${tag} tag`);
    chip.addEventListener('click', () => {
        sessionTags.delete(tag);
        selectedTags.delete(tag);
        renderTagPicker();
    });
    selectedTagList.append(chip);
  });
}

// function to openNoteEditor, reusable by other screens
export function openNoteEditor(note = null, onSave){
  if (!note){
    panel.classList.remove('hidden');
    textareaBackdrop.classList.remove('hidden');
    fab.classList.add('hidden');
    todayFab.classList.add('hidden')

    // remove any existing text or tags when new note created
    resetTextArea();
    // render the tags for the current note at the bottom of the text area
    renderTextAreaTags();
    textarea.focus();
  } else {
    // used by other views, when note submitted
    panel.classList.remove('hidden');
    panel.classList.add('fullscreen');
    textareaBackdrop.classList.remove('hidden');
    fab.classList.add('hidden');
    todayFab?.classList.add('hidden');
    editingNote = note;
    saveCallback = onSave;

    textarea.value = note.text ?? `AUDIO: ${note.audio.transcript}`;
    note.tags?.forEach(tag => selectedTags.add(tag));
    renderTextAreaTags();
    
    textarea.focus();
  }
}

// listener for note creation from other screens
document.addEventListener('note-edit-requested', event => {
  openNoteEditor(event.detail.note, event.detail.onSave);
});

tagSelectCancel.addEventListener('click', () => {
  sessionTags.forEach((item) => selectedTags.delete(item));
  sessionTags.clear();
  tagDialog.close();
  renderTextAreaTags();
});

tagSelectSave.addEventListener('click', () => {
  sessionTags.clear();
  tagDialog.close();
  renderTextAreaTags();
});

function selectTag(tag) {
  sessionTags.add(tag);
  selectedTags.add(tag);
  tagSearch.value = '';
  renderTagPicker();
  tagSearch.focus();
}

// When user creates a tag, render it in the dialog
tagCreateButton.addEventListener('click', () => {
  const userCreatedTag = tagCreateName.value.trim();

  if (userCreatedTag.length > 0) {
    selectedTags.add(userCreatedTag);
    sessionTags.add(userCreatedTag);

    const chip = document.createElement('button');
    // const tagData = appData.tags.find(item => item.name === tag.name);
    // const palette = getColorPair(tagData?.color);
    chip.type = 'button';
    chip.className = 'selected-tag';
    chip.textContent = `${userCreatedTag} ×`;
    chip.style.backgroundColor = '#E5E5E5';
    // chip.style.color = black;
    chip.setAttribute('aria-label', `Remove ${userCreatedTag} tag`);
    chip.addEventListener('click', () => {
        selectedTags.delete(userCreatedTag);
        sessionTags.delete(userCreatedTag);
        renderTagPicker();
    });



    tags.push({name: userCreatedTag, color: '#E5E5E5', icon: 'star'});
    selectedTagList.append(chip);
  }

  tagCreateName.value = '';
});

addMediaButton.addEventListener('click', () => {
  window.showPrototypeModal('Add Media','For this, you would select media using the standard system dialogue to attach to your note.');
});

favouriteButton.addEventListener('click', () => {
  window.showPrototypeModal('Mark as Favourite','This feature would mark your note as a favourite and would be integrated throughout filters in each view.');
});


// save note text when submit button is tapped
// build a new horizontal card for the note made
submitButton.addEventListener('click', () => {

  // Check if the current icon on the button is the mic, meaning the user is trying to record audio
  const submitIconEl = submitButton.querySelector('md-icon'); 
  const currentIcon = submitIconEl?.textContent.trim();
  if (currentIcon === 'mic') {
    window.showPrototypeModal('Record Audio','For this, you would record your voice and the system would attach a transcript to your note.');
  }
  

  const text = textarea.value.trim();
  if (!text) return;

  if (editingNote) {
    editingNote.text = text;
    editingNote.tags = [...selectedTags];
    editingNote.lastModifiedAt = new Date().toISOString();

    renderAgendaView();
    renderBrowseView();
    textarea.value = "";
    closePanel();
    saveCallback?.();
    return;
  }

  const now = new Date().toISOString();
  appData.notes.unshift({
    id: `note-${Date.now()}`,
    type: 'text',
    text,
    audio: null,
    tags: [...selectedTags],
    dueDate: dueDateInput.value,
    reminders: [],
    attachments: [],
    pinned: false,
    open: true,
    deleted: false,
    deletedAt: null,
    createdAt: now,
    lastModifiedAt: now,
  });
  document.dispatchEvent(new Event('note-created'));

  renderAgendaView();
  renderBrowseView();

  textarea.value = "";
  closePanel();
});

function updatePanelPosition(panel) {

  if (!panel.classList.contains('hidden') || !panel.classList.contains('fullscreen')) {
    panel.style.removeProperty('--vv-top');
    panel.style.removeProperty('--vv-left');
    panel.style.removeProperty('--vv-width');
    panel.style.removeProperty('--vv-height');
    return;
  };

  if (!viewPort) return;

  panel.style.setProperty('--vv-top', `${vv.offsetTop}px`);
  panel.style.setProperty('--vv-left', `${vv.offsetLeft}px`);
  panel.style.setProperty('--vv-width', `${vv.width}px`);
  panel.style.setProperty('--vv-height', `${vv.height}px`);
}

viewPort.addEventListener('resize', updatePanelPosition);
viewPort.addEventListener('scroll', updatePanelPosition);