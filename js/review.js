const swipeThreshold = 100;

export const notes = [
    {
        text: "Capstone: new model fine tuning approach? Ask TA",
        resolved: false,
        reminder: new Date(2026, 11, 9)
    },
    {
        text: "Traitors themed birthday party",
        resolved: false,
        reminder: null
    },
    {
        text: "Gift for mom: long gold earrings",
        resolved: false,
        reminder: new Date(2026, 11, 15)
    }
];

export function initializeReview() {
    const reviewView = document.querySelector('#review-view');
    const note = reviewView?.querySelector('.sticky-note--front');
    const feedback = reviewView?.querySelector('.review-feedback');

    const noteStack = reviewView.querySelector('.note-stack');
    const backNote = reviewView.querySelector('.sticky-note--back');
    

    if (!reviewView || !note || !feedback || !noteStack || !backNote) {
        throw new Error('Review view is missing its note or feedback element.');
    }

    backNote.hidden = notes.length <= 1;

    let startPoint;
    let touchIdentifier;
    let noteIndex = 0;
    const noteText = note.querySelector('p');

    noteText.textContent = notes[noteIndex].text;

    const swipeActions = {
        left: () => showSwipeFeedback('left', 'var(--md-sys-color-surface-container)'),
        right: () => showSwipeFeedback('right', '#var(--md-sys-color-surface-container)'),
        up: () => showSwipeFeedback('up', '#var(--md-sys-color-surface-container)'),
        down: () => showSwipeFeedback('down', '#var(--md-sys-color-surface-container)')
    };

    function showSwipeFeedback(direction, color) {
        feedback.textContent = `You swiped ${direction}!`;
        note.style.backgroundColor = color;

        const movement = {
        left: 'translateX(-120vw) rotate(-12deg)',
        right: 'translateX(120vw) rotate(12deg)',
        up: 'translateY(-120vh) rotate(8deg)',
        down: 'translateY(120vh) rotate(-8deg)'
    };

    note.style.transform = movement[direction];

    function handleTransitionEnd(event) {
        if (event.propertyName !== 'transform') return;
        note.removeEventListener('transitionend', handleTransitionEnd);

        noteIndex += 1;
        
        if (noteIndex >= notes.length){
            noteStack.hidden = true;
            feedback.textContent = 'Empty stack';
            return;
        }

        noteText.textContent = notes[noteIndex].text;
        backNote.hidden = noteIndex === notes.length - 1;

        note.style.transition = 'none';
        note.style.transform = 'none';
        note.style.backgroundColor = '';
        void note.offsetWidth; 
        note.style.transition = '';
    }

    note.addEventListener('transitionend', handleTransitionEnd);

}

    note.addEventListener('touchstart', event => {
        if (event.touches.length !== 1) {
            startPoint = undefined;
            touchIdentifier = undefined;
            return;
        }

        const touch = event.touches[0];
        touchIdentifier = touch.identifier;
        startPoint = { x: touch.clientX, y: touch.clientY };
    }, { passive: true });

    note.addEventListener('touchend', event => {
        if (!startPoint || touchIdentifier === undefined) {
            return;
        }

        const touch = Array.from(event.changedTouches)
            .find(changedTouch => changedTouch.identifier === touchIdentifier);
        if (!touch) {
            return;
        }

        const horizontalDistance = touch.clientX - startPoint.x;
        const verticalDistance = touch.clientY - startPoint.y;

        startPoint = undefined;
        touchIdentifier = undefined;

        if (Math.abs(horizontalDistance) > Math.abs(verticalDistance)
            && Math.abs(horizontalDistance) > swipeThreshold) {
            swipeActions[horizontalDistance > 0 ? 'right' : 'left']();
        } else if (Math.abs(verticalDistance) > swipeThreshold) {
            swipeActions[verticalDistance > 0 ? 'down' : 'up']();
        }
    }, { passive: true });

    note.addEventListener('touchcancel', () => {
        startPoint = undefined;
        touchIdentifier = undefined;
    });
}
