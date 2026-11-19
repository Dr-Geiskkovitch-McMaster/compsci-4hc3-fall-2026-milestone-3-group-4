const swipeThreshold = 150;
import { openNoteEditor } from './create.js';
import appData, { getColorPair } from './data.js';
import { renderAgendaView } from './agenda.js';
import { renderBrowseView } from './browse.js';

function getNoteTags(note) {
    const updatedTags = note.tags?.length ? [...note.tags] : ['untagged'];
    if (note.open) updatedTags.push('open');
    if (note.open && note.dueDate && dateSoon(new Date(note.dueDate),2)){
        updatedTags.push('due');
    }
    
    return updatedTags;
}

export const tags = [...new Set([...appData.notes.flatMap(getNoteTags)])];
export const stacks = [
    { name: "Open Loops", tags: ['open'], type: 'filter', iconClass: 'note-preview-status-icon--open' },
    { name: "Untagged", tags: ['untagged'], type: 'filter', icon: 'label_off' },
    { name: "Due Soon", tags: ['due'], type: 'filter', icon: 'schedule'},

    ...tags
        .filter(tag => tag !== 'open' && tag !== 'due')
        .map(tag => {
        const tagData = appData.tags.find(item => item.name === tag);

        return {
            name: tag.charAt(0).toUpperCase() + tag.slice(1),
            tags: [tag],
            type: 'tag',
            icon: tagData?.icon ?? 'label'
        };
    })
];


export function initializeReview() {
    const reviewView = document.querySelector('#review-view');
    const note = reviewView?.querySelector('.sticky-note--front');
    const feedback = reviewView?.querySelector('.review-feedback');

    const noteStack = reviewView.querySelector('.note-stack');
    const backNote = reviewView.querySelector('.sticky-note--back');

    const reminderDialog = document.querySelector('#reminder-date-set');
    const reminderCancel = document.querySelector('#reminder-cancel');
    const reminderInput = document.querySelector('#reminder-time');
    const reminderFrequencies = document.querySelectorAll('input[name="reminder-frequency"]');
    const reminderOccurrences = document.querySelector('#reminder-occurrences');

    const tagSearch = reviewView.querySelector('#review-tag');
    const tagOptions = reviewView.querySelector('#review-tag-options');
    const selectedTagList = reviewView.querySelector('#selected-review-tags');

    const saveNewStack = reviewView.querySelector('#save-stack');
    const saveNewStackDialog = reviewView.querySelector('#save-stack-dialog');
    const newStackInput = reviewView.querySelector('#stack-name');

    const swipeHint = reviewView.querySelector('.swipe-hint');

    if (!reviewView || !note || !feedback || !noteStack || !backNote
        || !tagSearch || !tagOptions || !selectedTagList 
        || !reminderDialog ||! reminderInput) {
        throw new Error('Review view is missing its note or feedback element.');
    }

    const noteText = note.querySelector('p');
    const noteTags = note.querySelector('.note-tags');
    const noteDueDate = note.querySelector('.note-due-date');

    if (!noteText || !noteTags || !noteDueDate ) {
        throw new Error('Review note is missing its text, tags, or due date element.');
    }
    
    const state = {
        note,
        noteText,
        noteStack,
        backNote,
        noteTags,
        noteDueDate,
        feedback,
        reviewView,
        tagSearch,
        tagOptions,
        selectedTagList,
        noteQueue: appData.notes,
        selectedTags: new Set(),
        startPoint: undefined,
        touchIdentifier: undefined,
        noteIndex: 0,
        reminderInput,
        reminderDialog,
        reminderCancel,
        reminderFrequencies,
        reminderOccurrences,
        transitionHandler: undefined,
        creatingNewStack: false,
        saveNewStack,
        newStackInput,
        saveNewStackDialog,
        swipeHint,
        feedbackTimeout: undefined
    };

    state.transitionHandler = event => handleTransitionEnd(state, event);

    state.tagSearch.addEventListener('input', () => {
        renderTagPicker(state)
    });

    let lastKey = '';

    /** Listener for the searching tags */
    state.tagSearch.addEventListener('keydown', (event)=>{
        if (event.key === "Enter") {
            const searchTerm = state.tagSearch.value.trim().toLowerCase();
            const matchingTags = tags.filter(tag =>
                !state.selectedTags.has(tag) && tag.toLowerCase().includes(searchTerm)
            );
             /** select a tag if it's the only one left matching */
            if (matchingTags.length === 1){
                event.preventDefault();
                selectTag(state,matchingTags[0]);
            };
        }
        /** only delete tags if double backspace */
        if (event.key === 'Backspace' && lastKey === 'Backspace' && state.tagSearch.value === '' && state.selectedTags.size > 0){
            event.preventDefault();

            const lastTag = [...state.selectedTags].at(-1);
            state.selectedTags.delete(lastTag);

            renderTagPicker(state);
            updateNoteQueue(state);
            updateSaveButtonVisibility(state);
        }
        lastKey = event.key;
    });

    renderTagPicker(state);
    showCurrentNote(state);

    const swipeActions = {
        left: () => showSwipeFeedback(state,'left', 'var(--md-sys-color-surface-container)'),
        right: () => showSwipeFeedback(state,'right', '#var(--md-sys-color-surface-container)'),
        up: () => showSwipeFeedback(state,'up', '#var(--md-sys-color-surface-container)'),
        down: () => showSwipeFeedback(state,'down', '#var(--md-sys-color-surface-container)')
    };

    state.reminderDialog.querySelector('#reminder-cancel').addEventListener('click', () => state.reminderDialog.close('cancel'));

    state.reminderDialog.addEventListener('close', () => {
        if (state.reminderDialog.returnValue !== 'save') return;

        const reminderDate = new Date(state.reminderInput.value);
        if (!state.reminderInput.value
            || !Number.isFinite(reminderDate.getTime())
            || reminderDate <= new Date()) {
            state.reminderDialog.show();
            state.reminderInput.setCustomValidity('Choose a valid date and time in the future.');
            state.reminderInput.reportValidity();
            return;
        }

        const selectedFrequency = [...state.reminderFrequencies].find(frequency => frequency.checked);
        
        state.noteQueue[state.noteIndex].reminders.push({
            date: reminderDate,
            recurrence: selectedFrequency?.value ?? null,
            occurrences: state.reminderOccurrences.value
        });
        console.log(state.noteQueue[state.noteIndex].reminders);
        state.feedback.textContent = 'Reminder updated';
        updateNoteQueue(state);
    });

    note.addEventListener('pointerdown', event => {
        if (event.pointerType === 'mouse' && event.button !== 0) return;

        state.pointerId = event.pointerId;
        state.startPoint = { x: event.clientX, y: event.clientY };
        note.setPointerCapture(event.pointerId);
    });

    /* event listener to hint when partial swipe is done */
    note.addEventListener('pointermove', event => {
        if (event.pointerId !== state.pointerId || !state.startPoint ) {
            return;
        }

        const horizontalDistance = event.clientX - state.startPoint.x;
        const verticalDistance = event.clientY - state.startPoint.y;

        /** determine whether click is start of a swipe */
        const hintThreshold = 50;
        let direction; 
        
        if (Math.abs(horizontalDistance) >= Math.abs(verticalDistance)) {
            if (Math.abs(horizontalDistance) >= hintThreshold) {
                direction = horizontalDistance > 0 ? 'right' : 'left';
            }
        } else if (Math.abs(verticalDistance) >= hintThreshold) {
            direction = verticalDistance > 0 ? 'down' : 'up';
        }

        if (!direction) {
            state.feedback.textContent = 'Swipe the note to action it.';
            state.feedback.hidden = false;
            return;
        }
        const hints = {
            left: 'Dismiss note',
            right: 'Resolve note',
            up: 'Change reminder',
            down: 'Edit'
        };

        displayFeedbackText(state,hints[direction]);
    }, { passive: true });

    note.addEventListener('pointerup', event => {
        if (event.pointerId !== state.pointerId || !state.startPoint ) {
            return;
        }

        const horizontalDistance = event.clientX - state.startPoint.x;
        const verticalDistance = event.clientY - state.startPoint.y;

        state.startPoint = undefined;
        state.pointerId = undefined;

        /** determine whether click warrants a swipe */
        if (Math.abs(horizontalDistance) > Math.abs(verticalDistance)
            && Math.abs(horizontalDistance) > swipeThreshold) {
            swipeActions[horizontalDistance > 0 ? 'right' : 'left']();
        } else if (Math.abs(verticalDistance) > swipeThreshold) {
            swipeActions[verticalDistance > 0 ? 'down' : 'up']();
        }
    }, { passive: true });

    note.addEventListener('pointercancel', () => {
        state.startPoint = undefined;
        state.pointerId = undefined;
    });

    state.saveNewStack.addEventListener('click', () => {
        openNewStackDialog(state);
    });

    state.saveNewStackDialog.addEventListener('close', () => {
        if (state.saveNewStackDialog.returnValue !== 'save' || state.selectedTags.size === 0) return;
        updateNoteQueue(state);

        /* save new stack */
        const newStack = {
            name: state.newStackInput.value,
            tags: [...state.selectedTags],
            type: 'filter'
        } 

        stacks.push(newStack);
        console.log(stacks);

        /** log event so stack can be rendered */
        document.dispatchEvent(new CustomEvent('stack-created', {
            detail:newStack
        }));
    });

    /** accessible by main.js, function to set which stack is reviewed */
    function setStack(selectedStack){
        if (selectedStack === "new-stack-button"){
            createNewStack(state);
        } else {
            state.creatingNewStack = false;
            state.selectedTags.clear();
            selectedStack.forEach(tag => state.selectedTags.add(tag));
            state.tagSearch.value = '';
            renderTagPicker(state);
            updateNoteQueue(state);
            updateSaveButtonVisibility(state);
        }
    }

    return {setStack, clearTags: () => clearTags(state), countStackNotes};
}

/* save button is only visible when stack with selected tags doesn't already exist */
function updateSaveButtonVisibility(state) {
    const selectedTags = new Set([...state.selectedTags].filter(tag => tag !== 'open'));
    const stackAlreadyExists = stacks.some(stack => {
        const stackTags = stack.tags.filter(tag => tag !== 'open');

        return stackTags.length === selectedTags.size
        && stackTags.every(tag => selectedTags.has(tag))
    }
        
    );

    state.saveNewStack.hidden =
        state.selectedTags.size === 0 || stackAlreadyExists;
}

/* count notes in stack for ui */
function countStackNotes(stack) {
    return appData.notes.filter(note =>
        !note.resolved && stack.tags.some(tag => getNoteTags(note).includes(tag))
    ).length;
}

function createNewStack(state){
    state.creatingNewStack = true;
    clearTags(state);
    state.tagSearch.value = '';
    renderTagPicker(state);
    updateNoteQueue(state);
}

function showCurrentNote(state) {
    while (state.noteIndex < state.noteQueue.length && state.noteQueue[state.noteIndex].resolved) {
        state.noteIndex += 1;
    }

    if (state.noteIndex >= state.noteQueue.length) {
        state.noteStack.hidden = true;
        state.noteTags.replaceChildren();
        state.feedback.textContent = state.creatingNewStack? 'Select tags to create a stack.' : 'Empty stack';
        return;
    }

    state.noteStack.hidden = false;
    const currentNote = state.noteQueue[state.noteIndex];
    state.noteText.textContent = currentNote.text ? currentNote.text : `AUDIO: ${currentNote.audio.transcript}`;
    state.noteTags.replaceChildren();
    /** draw tags on the note */
    (getNoteTags(currentNote) ?? []).forEach(tag => {
        if (tag !== 'untagged' && tag !== 'open' && tag !== 'due'){
            const chip = document.createElement('span');
            const tagData = appData.tags.find(item => item.name === tag);
            const palette = getColorPair(tagData.color);
            chip.className = 'note-tag';
            chip.textContent = `#${tagData.name}`;
            chip.style.backgroundColor = palette.container;
            chip.style.color = palette.accent;
            state.noteTags.append(chip);
        }
    });
    // draw due date on the note
    state.noteDueDate.textContent = currentNote.dueDate ? `Due ${currentNote.dueDate}` : '';
    
    state.backNote.hidden = state.noteQueue.slice(state.noteIndex + 1)
        .every(queuedNote => queuedNote.resolved);
}

/** update queue for when tags are selected */
function updateNoteQueue(state) {
    if (state.selectedTags.size > 0) {
        state.noteQueue = appData.notes.filter (note =>
            getNoteTags(note).some(tag => state.selectedTags.has(tag))
        );
    } else {
        state.noteQueue = state.creatingNewStack ? [] : appData.notes;
    }

    state.noteIndex = 0;
    showCurrentNote(state);
}

function selectTag(state, tag) {
    state.selectedTags.add(tag);
    state.tagSearch.value = '';
    renderTagPicker(state);
    updateNoteQueue(state);
    state.tagSearch.focus();
    updateSaveButtonVisibility(state);
}

function clearTags(state) {
    state.saveNewStack.hidden = true;
    state.selectedTags.clear();
    state.tagSearch.value = '';
    renderTagPicker(state);
    updateNoteQueue(state);
    updateSaveButtonVisibility(state);
    state.tagSearch.focus();
}

/* Function to render the tag options based on what has been typed in the search bar */
function renderTagPicker(state) {
    const searchTerm = state.tagSearch.value.trim().toLowerCase();
    const matchingTags = tags.filter(tag =>
        !state.selectedTags.has(tag) && tag.toLowerCase().includes(searchTerm)
    );

    /* render each matching tag as a button */
    state.tagOptions.replaceChildren();
    matchingTags.forEach(tag => {
        const option = document.createElement('button');
        const tagData = appData.tags.find(item => item.name === tag);
        const palette = getColorPair(tagData?.color);
        option.type = 'button';
        option.style.backgroundColor = palette?.container ?? '#E5E5E5';
        option.style.color = palette?.accent ?? '#000000';
        option.className = 'tag-option';
        option.textContent = `#${tag}`;
        option.addEventListener('click', () => {
            selectTag(state,tag);
        });
        state.tagOptions.append(option);
    });

    /* render each selected tag */
    state.selectedTagList.replaceChildren();
    state.selectedTags.forEach(tag => {
        const chip = document.createElement('button');
        const tagData = appData.tags.find(item => item.name === tag);
        const palette = getColorPair(tagData?.color);
        chip.type = 'button';
        chip.className = 'selected-tag';
        chip.textContent = `#${tag} ×`;
        chip.style.backgroundColor = palette?.container ?? '#E5E5E5';
        chip.style.color = palette.accent;
        chip.setAttribute('aria-label', `Remove ${tag} tag`);
        chip.addEventListener('click', () => {
            state.selectedTags.delete(tag);
            renderTagPicker(state);
            updateNoteQueue(state);
        });
        state.selectedTagList.append(chip);
    });
}
    
function openReminderDialog(state) {
    const reminder = state.noteQueue[state.noteIndex].reminder;
    state.reminderInput.value = reminder ? toLocalDateTimeValue(reminder) : '';
    const earliestReminder = new Date();
    earliestReminder.setMinutes(earliestReminder.getMinutes() + 1, 0, 0);
    state.reminderInput.min = toLocalDateTimeValue(earliestReminder);
    state.reminderInput.setCustomValidity('');
    state.reminderDialog.show();
}

function openNewStackDialog(state) {
    state.saveNewStackDialog.show();
}

function toLocalDateTimeValue(date) {
    const pad = value => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
        + `T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function dateSoon(date,threshold) {
    const daysUntil = (date.getTime() - Date.now())/ (1000 * 60 * 60 * 24);
    return (daysUntil < threshold);
}

function showSwipeFeedback(state, direction, color) {
    if (direction === 'left'){
        displayFeedbackText(state,'Note dismissed');
    } else if (direction === 'right'){
        displayFeedbackText(state,'Note resolved');
        state.noteQueue[state.noteIndex].resolved = true;
    } else if (direction === 'up') {
        displayFeedbackText(state,'Change reminder');
        openReminderDialog(state);
        return;
    } else if (direction == 'down'){
        displayFeedbackText(state,'Editing note');
        openNoteEditor(state.noteQueue[state.noteIndex],
            () => {
                updateNoteQueue(state);
                renderAgendaView();
                renderBrowseView();
            });
        return;
    }

    state.note.style.backgroundColor = color;

    const movement = {
        left: 'translateX(-120vw) rotate(-12deg)',
        right: 'translateX(120vw) rotate(12deg)',
        up: 'translateY(-120vh) rotate(8deg)',
        down: 'translateY(120vh) rotate(-8deg)'
    };

    state.note.style.transform = movement[direction];

    state.note.addEventListener('transitionend', state.transitionHandler);
}

function displayFeedbackText (state, message, duration = 2000){
    clearTimeout(state.feedbackTimeout);

    state.feedback.textContent = message;
    state.feedback.hidden = false;

    state.feedbackTimeout = setTimeout(() => {
        state.feedback.textContent = 'Swipe the note to action it.';
        state.feedback.hidden = false;
    }, duration);
}

function handleTransitionEnd(state,event) {
    if (event.propertyName !== 'transform') return;
    state.note.removeEventListener('transitionend', state.transitionHandler);

    state.noteIndex += 1;

    state.note.style.transition = 'none';
    state.note.style.transform = 'none';
    state.note.style.backgroundColor = '';
    showCurrentNote(state);
    // Apply the offscreen reset before re-enabling the transition.
    void state.note.offsetWidth;
    state.note.style.transition = '';
}