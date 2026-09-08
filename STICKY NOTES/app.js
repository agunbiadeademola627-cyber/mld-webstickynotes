// State
let notes = JSON.parse(localStorage.getItem('captionNotes')) || [];
let currentNoteId = null;
let pipWindow = null;

// DOM Elements
const dashboardView = document.getElementById('dashboard-view');
const editorView = document.getElementById('editor-view');
const notesGrid = document.getElementById('notes-grid');
const btnNewNote = document.getElementById('btn-new-note');
const btnBack = document.getElementById('btn-back');
const btnPip = document.getElementById('btn-pip');
const activeNote = document.getElementById('active-note');
const noteTitle = document.getElementById('note-title');
const noteContent = document.getElementById('note-content');
const noteDate = document.getElementById('note-date');
const btnDelete = document.getElementById('btn-delete');
const btnColorPicker = document.getElementById('btn-color-picker');
const colorPalette = document.getElementById('color-palette');
const colorSwatches = document.querySelectorAll('.color-swatch');

// Initialize
function init() {
    renderNotes();
    setupEventListeners();
}

// Event Listeners
function setupEventListeners() {
    btnNewNote.addEventListener('click', createNewNote);
    btnBack.addEventListener('click', closeNote);
    btnDelete.addEventListener('click', deleteNote);
    btnPip.addEventListener('click', togglePip);

    // Close note when clicking the backdrop — only if both mousedown AND mouseup land on backdrop
    // This prevents closing when the user drags text selection outside the note boundary
    let backdropMouseDown = false;
    editorView.addEventListener('mousedown', (e) => {
        backdropMouseDown = e.target === editorView;
    });
    editorView.addEventListener('mouseup', (e) => {
        if (e.target === editorView && backdropMouseDown) closeNote();
        backdropMouseDown = false;
    });

    // Auto-save on input
    noteTitle.addEventListener('input', saveCurrentNote);
    noteContent.addEventListener('input', saveCurrentNote);

    // Color picker
    btnColorPicker.addEventListener('click', () => {
        colorPalette.classList.toggle('hidden');
    });

    // Hide color picker when clicking outside
    document.addEventListener('click', (e) => {
        if (!btnColorPicker.contains(e.target) && !colorPalette.contains(e.target)) {
            colorPalette.classList.add('hidden');
        }
    });

    colorSwatches.forEach(swatch => {
        swatch.addEventListener('click', (e) => {
            const colorClass = e.target.dataset.color;
            changeNoteColor(colorClass);
            colorPalette.classList.add('hidden');
        });
    });
}

// Notes Management
function renderNotes() {
    notesGrid.innerHTML = '';

    if (notes.length === 0) {
        notesGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); margin-top: 2rem;">No notes yet. Click the + button to start one!</div>';
        return;
    }

    // Sort by timestamp descending
    const sortedNotes = [...notes].sort((a, b) => b.timestamp - a.timestamp);

    sortedNotes.forEach(note => {
        const dateObj = new Date(note.timestamp);
        const dateStr = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const card = document.createElement('div');
        card.className = `note-card ${note.color}`;
        card.innerHTML = `
            <h3>${note.title || 'Untitled Note'}</h3>
            <div class="meta">${dateStr}</div>
            <div class="preview">${note.content || '<em>No content</em>'}</div>
        `;

        card.addEventListener('click', () => openNote(note.id));
        notesGrid.appendChild(card);
    });
}

function createNewNote() {
    const newNote = {
        id: Date.now().toString(),
        title: '',
        content: '',
        color: 'color-yellow',
        timestamp: Date.now()
    };

    notes.push(newNote);
    saveToLocalStorage();
    openNote(newNote.id);
}

function openNote(id) {
    currentNoteId = id;
    const note = notes.find(n => n.id === id);

    if (!note) return;

    // Populate UI
    noteTitle.value = note.title;
    noteContent.value = note.content;

    const dateObj = new Date(note.timestamp);
    noteDate.textContent = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString();

    // Apply color
    activeNote.className = `note-window ${note.color}`;

    // Switch view
    dashboardView.classList.remove('active');
    editorView.classList.add('active');
}

function closeNote() {
    saveCurrentNote();
    currentNoteId = null;

    // Switch view
    editorView.classList.remove('active');
    dashboardView.classList.add('active');

    renderNotes();
}

function saveCurrentNote() {
    if (!currentNoteId) return;

    const noteIndex = notes.findIndex(n => n.id === currentNoteId);
    if (noteIndex !== -1) {
        notes[noteIndex].title = noteTitle.value;
        notes[noteIndex].content = noteContent.value;
        saveToLocalStorage();

        // Sync to PiP window if open
        if (pipWindow) {
            const pipContentEl = pipWindow.document.getElementById('pip-content');
            // Only sync if user is not actively typing in the PiP window to prevent cursor jumping
            if (pipContentEl && pipWindow.document.activeElement !== pipContentEl) {
                pipWindow.document.querySelector('h3').textContent = noteTitle.value || 'Untitled';
                pipContentEl.value = noteContent.value;
                pipContentEl.scrollTop = pipContentEl.scrollHeight;
            }
        }
    }
}

function changeNoteColor(colorClass) {
    if (!currentNoteId) return;

    // Update UI
    activeNote.className = `note-window ${colorClass}`;

    // Update data
    const noteIndex = notes.findIndex(n => n.id === currentNoteId);
    if (noteIndex !== -1) {
        notes[noteIndex].color = colorClass;
        saveToLocalStorage();
    }
}

function deleteNote() {
    if (!currentNoteId) return;

    if (confirm('Are you sure you want to delete this note?')) {
        notes = notes.filter(n => n.id !== currentNoteId);
        saveToLocalStorage();
        closeNote();
    }
}

async function togglePip() {
    if (!('documentPictureInPicture' in window)) {
        alert('Document Picture-in-Picture is not supported in this browser. Try Chrome or Edge (v116+).');
        return;
    }

    if (pipWindow) {
        pipWindow.close();
        return;
    }

    try {
        pipWindow = await documentPictureInPicture.requestWindow({
            width: 350,
            height: 450
        });

        // Copy styles
        [...document.styleSheets].forEach(styleSheet => {
            try {
                const cssRules = [...styleSheet.cssRules].map(rule => rule.cssText).join('');
                const style = document.createElement('style');
                style.textContent = cssRules;
                pipWindow.document.head.appendChild(style);
            } catch (e) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.type = styleSheet.type;
                link.media = styleSheet.media;
                link.href = styleSheet.href;
                pipWindow.document.head.appendChild(link);
            }
        });

        // Setup body
        const currentNote = notes.find(n => n.id === currentNoteId);
        if (!currentNote) return;

        pipWindow.document.body.className = currentNote.color;
        pipWindow.document.body.style.display = 'flex';
        pipWindow.document.body.style.flexDirection = 'column';
        pipWindow.document.body.style.padding = '1.5rem';
        pipWindow.document.body.style.height = '100vh';
        pipWindow.document.body.style.overflow = 'auto';
        pipWindow.document.body.style.fontFamily = "'Inter', sans-serif";
        pipWindow.document.body.style.color = "var(--text-main)";

        pipWindow.document.body.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h3 style="font-size: 1.25rem; font-weight: 600; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${currentNote.title || 'Untitled Note'}</h3>
                <button id="btn-return" style="background: none; border: none; cursor: pointer; font-size: 1.25rem; color: inherit; opacity: 0.7; transition: opacity 0.2s;" title="Return to Tab" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'">
                    <i class="fas fa-external-link-square-alt" style="transform: scaleX(-1);"></i>
                </button>
            </div>
            <textarea id="pip-content" style="flex-grow: 1; font-size: 1rem; line-height: 1.6; outline: none; background: transparent; border: none; resize: none; font-family: inherit; color: inherit; width: 100%; height: 100%;" placeholder="Start typing...">${currentNote.content}</textarea>
        `;

        const pipTextArea = pipWindow.document.getElementById('pip-content');
        const btnReturn = pipWindow.document.getElementById('btn-return');

        // Two-way Sync: PiP -> Main
        pipTextArea.addEventListener('input', (e) => {
            noteContent.value = e.target.value;
            // Save to local storage silently
            const noteIndex = notes.findIndex(n => n.id === currentNoteId);
            if (noteIndex !== -1) {
                notes[noteIndex].content = noteContent.value;
                saveToLocalStorage();
            }
        });

        // Return Button
        btnReturn.addEventListener('click', () => {
            pipWindow.close();
            window.focus();
        });

        pipWindow.addEventListener('pagehide', () => {
            pipWindow = null;
        });

    } catch (error) {
        // Silently ignore user-activation errors
        if (error.name !== 'NotAllowedError') {
            alert("Failed to open PiP window. " + error.message);
        }
    }
}

function saveToLocalStorage() {
    localStorage.setItem('captionNotes', JSON.stringify(notes));
}

// Start app
init();