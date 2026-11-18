const swipeThreshold = 100;

/* Hardcoded notes to show review functionality */
export const notes = [
    {
        text: "Capstone: new model fine tuning approach? Ask TA",
        resolved: false,
        reminder: new Date(2026, 11, 9),
        tags: ['school', 'capstone']
    },
    {
        text: "Traitors themed birthday party",
        resolved: false,
        reminder: null,
        tags: ['random']
    },
    {
        text: "Gift for mom: long gold earrings",
        resolved: false,
        reminder: new Date(2026, 11, 15),
        tags: ['home']
    },
    {
        text: "Lizzy mcalpine new album favs: \n Peach \n Ugly things \n two elevens",
        resolved: false,
        reminder: null,
        tags: ['random']
    },
    {
        text: "quinoa power bowl recipe allrecipes",
        resolved: false,
        reminder: new Date(2026, 10, 19),
        tags: ['food']
    },
    {
        text: "something about inventions based on ecology",
        resolved: false,
        reminder: new Date(2026, 11, 1),
        tags: ['school']
    },
    {
        text: "badminton\n eng volleyball \n waterpolo (x2)?\n intramural signup monday",
        resolved: false,
        reminder: new Date(2026, 10, 29),
        tags: null
    },
    {
        text: "the body new show to watch",
        resolved: false,
        reminder: null,
        tags: ['random']
    }
];

export const stacks = [
    {
        name: "Open Loops",
        tags: ['open'],
        type: 'filter'
    }, 
    {
        name: "Untagged",
        tags: ['untagged'],
        type: 'filter'
    },  
    {
        name: "Due Soon",
        tags: ['due'],
        type: 'filter'
    },  
    {
        name: "School",
        tags: ['school'],
        type: 'tag'
    },   
    {
        name: "Random",
        tags: ['random'],
        type: 'tag'
    },   
    {
        name: "Home",
        tags: ['home'],
        type: 'tag'
    },   
    {
        name: "Capstone",
        tags: ['capstone'],
        type: 'tag'
    },   
    {
        name: "Food",
        tags: ['food'],
        type: 'tag'
    }
];

function getNoteTags(note) {
    const updatedTags = note.tags?.length ? [...note.tags] : ['untagged'];
    if (!note.resolved) updatedTags.push('open');
    if (!note.resolved && note.reminder && dateSoon(note.reminder,2)){
        updatedTags.push('due');
    }
    
    return updatedTags;
}

export const tags = [...new Set([...notes.flatMap(getNoteTags), 'due'])];
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


export function initializeReview() {
    const reviewView = document.querySelector('#review-view');
    const note = reviewView?.querySelector('.sticky-note--front');
    const feedback = reviewView?.querySelector('.review-feedback');

    const noteStack = reviewView.querySelector('.note-stack');
    const backNote = reviewView.querySelector('.sticky-note--back');

    const reminderDialog = document.querySelector('#reminder-date-set');
    const reminderInput = document.querySelector('#reminder-time');    

    const tagSearch = reviewView.querySelector('#review-tag');
    const tagOptions = reviewView.querySelector('#review-tag-options');
    const selectedTagList = reviewView.querySelector('#selected-review-tags');

    const saveNewStack = reviewView.querySelector('#save-stack');
    const saveNewStackDialog = reviewView.querySelector('#save-stack-dialog');
    const newStackInput = reviewView.querySelector('#stack-name');

    if (!reviewView || !note || !feedback || !noteStack || !backNote
        || !tagSearch || !tagOptions || !selectedTagList 
        || !reminderDialog ||! reminderInput) {
        throw new Error('Review view is missing its note or feedback element.');
    }

    const noteText = note.querySelector('p');
    const noteTags = note.querySelector('.note-tags');

    if (!noteText || !noteTags) {
        throw new Error('Review note is missing its text or tags element.');
    }
    
    const state = {
        note,
        noteText,
        noteStack,
        backNote,
        noteTags,
        feedback,
        reviewView,
        tagSearch,
        tagOptions,
        selectedTagList,
        noteQueue: notes,
        selectedTags: new Set(),
        startPoint: undefined,
        touchIdentifier: undefined,
        noteIndex: 0,
        reminderInput,
        reminderDialog,
        transitionHandler: undefined,
        creatingNewStack: false,
        saveNewStack,
        newStackInput,
        saveNewStackDialog
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

    state.reminderDialog.addEventListener('close', () => {
        if (state.reminderDialog.returnValue !== 'save' || !state.reminderInput.value) return;

        state.noteQueue[state.noteIndex].reminder = new Date(state.reminderInput.value);
        state.feedback.textContent = 'Reminder updated';
        updateNoteQueue(state);
    });

    note.addEventListener('touchstart', event => {
        if (event.touches.length !== 1) {
            state.startPoint = undefined;
            state.touchIdentifier = undefined;
            return;
        }

        const touch = event.touches[0];
        state.touchIdentifier = touch.identifier;
        state.startPoint = { x: touch.clientX, y: touch.clientY };
    }, { passive: true });

    note.addEventListener('touchend', event => {
        if (!state.startPoint || state.touchIdentifier === undefined) {
            return;
        }

        const touch = Array.from(event.changedTouches)
            .find(changedTouch => changedTouch.identifier === state.touchIdentifier);
        if (!touch) {
            return;
        }

        const horizontalDistance = touch.clientX - state.startPoint.x;
        const verticalDistance = touch.clientY - state.startPoint.y;

        state.startPoint = undefined;
        state.touchIdentifier = undefined;

        /** determine whether touch warrants a swipe */
        if (Math.abs(horizontalDistance) > Math.abs(verticalDistance)
            && Math.abs(horizontalDistance) > swipeThreshold) {
            swipeActions[horizontalDistance > 0 ? 'right' : 'left']();
        } else if (Math.abs(verticalDistance) > swipeThreshold) {
            swipeActions[verticalDistance > 0 ? 'down' : 'up']();
        }
    }, { passive: true });

    note.addEventListener('touchcancel', () => {
        state.startPoint = undefined;
        state.touchIdentifier = undefined;
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
            type: 'custom'
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
    const stackAlreadyExists = stacks.some(stack =>
        stack.tags.length === state.selectedTags.size
        && stack.tags.every(tag => state.selectedTags.has(tag))
    );

    state.saveNewStack.hidden =
        state.selectedTags.size === 0 || stackAlreadyExists;
}

/* count notes in stack for ui */
function countStackNotes(stack) {
    return notes.filter(note =>
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
    state.noteText.textContent = currentNote.text;
    state.noteTags.replaceChildren();
    /** draw tags on the note */
    (getNoteTags(currentNote) ?? []).forEach(tag => {
        if (tag !== 'untagged' && tag !== 'open' && tag !== 'due'){
            const chip = document.createElement('span');
            chip.className = 'note-tag';
            chip.textContent = tag;
            chip.style.backgroundColor = tagColors[tag] ?? '#E5E5E5';
            state.noteTags.append(chip);
        }
    });
    state.backNote.hidden = state.noteQueue.slice(state.noteIndex + 1)
        .every(queuedNote => queuedNote.resolved);
}

/** update queue for when tags are selected */
function updateNoteQueue(state) {
    if (state.selectedTags.size > 0) {
        state.noteQueue = notes.filter (note =>
            getNoteTags(note).some(tag => state.selectedTags.has(tag))
        );
    } else {
        state.noteQueue = state.creatingNewStack ? [] : notes;
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
        option.type = 'button';
        option.style.backgroundColor = tagColors[tag] ?? '#E5E5E5';
        option.className = 'tag-option';
        option.textContent = tag;
        option.addEventListener('click', () => {
            selectTag(state,tag);
        });
        state.tagOptions.append(option);
    });

    /* render each selected tag */
    state.selectedTagList.replaceChildren();
    state.selectedTags.forEach(tag => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'selected-tag';
        chip.textContent = `${tag} ×`;
        chip.style.backgroundColor = tagColors[tag] ?? '#E5E5E5';
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
        state.feedback.textContent = 'Note dismissed';
    } else if (direction === 'right'){
        state.feedback.textContent = 'Note resolved';
        state.noteQueue[state.noteIndex].resolved = true;
    } else if (direction === 'up') {
        state.feedback.textContent = 'Change reminder';
        openReminderDialog(state);
        return;
    } else if (direction == 'down'){
        state.feedback.textContent = 'Editing note';
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

function handleTransitionEnd(state,event) {
    if (event.propertyName !== 'transform') return;
    state.note.removeEventListener('transitionend', state.transitionHandler);

    state.noteIndex += 1;

    state.note.style.transition = 'none';
    state.note.style.transform = 'none';
    state.note.style.backgroundColor = '';
    state.note.style.transition = '';
    showCurrentNote(state);
}