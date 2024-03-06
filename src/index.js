import Masonry from 'masonry-layout';
import { Note, Notes } from './Components/Notes';
import QuilEditor from './Components/QuilEditor';
import { format, formatDistance } from 'date-fns';
import './reset.css';
import './index.css';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const auth = getAuth();
//initialise Masonry.js
const grid = document.querySelector('.notes-container');
const msnry = new Masonry(grid, {
  percentPosition: true,
  itemSelector: '.note-card',
  columnWidth: '.grid-sizer',
  horizontalOrder: true,
  hiddenStyle: {
    transform: 'translateY(100px)',
    opacity: 0,
  },
  visibleStyle: {
    transform: 'translateY(0px)',
    opacity: 1,
  },
});

//initialize Quill editor
const editorNewNote = QuilEditor('editor-new-note');

//initialize Notes
const newNote = Notes();

const resetMasonry = () => {
  msnry.remove(grid.children);
  populateMasonryContainer();
};

//create Card element
const createCard = (title, text, html, created_at, id) => {
  const noteCard = document.createElement('div');
  noteCard.classList.add('note-card');
  // noteCard.setAttribute('data-id', id);
  noteCard.addEventListener('click', (e) => {
    // console.log(noteCard.getAttribute('data-id'));
    const cardElem = e.target;
    dialogNewNote.showModal();
    let btnSave = document.createElement('button');
    btnSave.innerText = 'Save';
    btnSave.classList.add('dialog-btn');
    btnSave.addEventListener('click', (e) => {
      e.stopPropagation();
      newNote.updateNote(
        getTitleInput(),
        editorNewNote.getEditorContents(),
        editorNewNote.getEditorContentsHTML().replaceAll('<p></p>', '<br/>'),
        id
      );
      dialogNewNote.close();
      resetMasonry();
    });
    dialogButtonOptions.appendChild(btnSave);
    document.getElementById('new-note-title').value = title;
    editorNewNote.setEditorContents(text);
  });

  const btnDeleteCard = document.createElement('button');
  btnDeleteCard.classList.add('btn-delete-card');
  btnDeleteCard.innerHTML = '<ion-icon name="close-outline"></ion-icon>';
  btnDeleteCard.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    newNote.removeNote(id);
    let elem = e.target.parentNode.parentNode;
    msnry.remove(elem);
    msnry.layout();
  });

  const noteContent = document.createElement('div');
  noteContent.classList.add('note-content');

  const noteTitle = document.createElement('h2');
  noteTitle.classList.add('note-title');
  noteTitle.innerText = title;

  const result = formatDistance(
    created_at,
    format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSS"),
    { addSuffix: true }
  );

  const noteDate = document.createElement('small');
  noteDate.innerText = result;

  const noteText = document.createElement('div');
  noteText.classList.add('note-text');
  noteText.innerHTML = html;

  noteContent.appendChild(noteTitle);
  noteContent.appendChild(noteDate);
  noteContent.appendChild(noteText);
  noteContent.appendChild(btnDeleteCard);
  noteCard.appendChild(noteContent);

  return noteCard;
};

const populateMasonryContainer = async () => {
  let notes = await newNote.getAllNotes();
  for (let note of notes) {
    let elem = createCard(
      note.title,
      note.text,
      note.html,
      note.created_at,
      note.id
    );
    grid.appendChild(elem);
    msnry.appended(elem);
    msnry.layout();
  }
};

onAuthStateChanged(auth, (user) => {
  if (user) {
    populateMasonryContainer();
  } else {
    msnry.remove(grid.children);
  }
});

const btnOpenNewNoteModal = document.getElementById('btn-open-newnote-modal');
const dialogButtonOptions = document.getElementById('dialog-button-options');
const dialogNewNote = document.getElementById('dialog-newnote-form');
const inputTitle = document.getElementById('new-note-title');

const saveNewNote = async () => {
  newNote.addNote(
    Note(
      getTitleInput(),
      editorNewNote.getEditorContents(),
      editorNewNote.getEditorContentsHTML()
    )
  );

  let note = await newNote.getNewestNote();

  let newNoteCard = createCard(
    note.title,
    note.text,
    note.html,
    note.created_at,
    note.id
  );

  grid.appendChild(newNoteCard);
  msnry.prepended(newNoteCard);
  msnry.layout();

  dialogNewNote.close();
};

btnOpenNewNoteModal.addEventListener('click', () => {
  dialogNewNote.showModal();
  editorNewNote.getFocus();
  let btnSave = document.createElement('button');
  btnSave.innerText = 'Save';
  btnSave.onclick = saveNewNote;
  btnSave.classList.add('dialog-btn');
  dialogButtonOptions.appendChild(btnSave);
});

dialogNewNote.addEventListener('close', (e) => {
  editorNewNote.clearEditor();
  clearTitleInput();
  dialogButtonOptions.innerHTML = '';
});

dialogNewNote.addEventListener('mousedown', (event) => {
  if (event.target.tagName === 'DIALOG') {
    dialogNewNote.close();
  }
});

const getTitleInput = () => {
  if (inputTitle === null || inputTitle.value === '') return 'Untitled';
  else return inputTitle.value;
};

const clearTitleInput = () => {
  inputTitle.value = '';
};
