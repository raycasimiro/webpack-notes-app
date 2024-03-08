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
  horizontalOrder: false,
  hiddenStyle: {
    transform: 'translateY(100px)',
    opacity: 0,
  },
  visibleStyle: {
    transform: 'translateY(0px)',
    opacity: 1,
  },
});

//UI
const btnOpenNewNoteModal = document.getElementById('btn-open-newnote-modal');
const dialogButtonOptions = document.getElementById('dialog-button-options');
const dialogNoteForm = document.getElementById('dialog-note-form');
const formContainer = document.getElementById('form-container');
const inputTitle = document.getElementById('input-note-title');
const btnColorPopOver = document.getElementById('btn-color-popover');
const popoverOverlay = document.getElementById('popover-overlay');
const popoverDialog = document.getElementById('popover-dialog');

const colorSwatch = [
  '#FFD966',
  '#FFC470',
  '#FFAFA3',
  '#80CAFF',
  '#D9B8FF',
  '#FFADE7',
  '#85E0A3',
  '#AFBCCF',
  '#E6E6E6',
];

const setModalColor = (strColor) => {
  formContainer.style.backgroundColor = strColor;
  btnColorPopOver.style.backgroundColor = strColor;
};

//initialize Quill editor
const inputNoteText = QuilEditor('input-note-text');

//initialize Notes
const newNotes = Notes();

const resetMasonry = () => {
  msnry.remove(grid.children);
  populateMasonryContainer();
};

//create Card element
const createCard = (title, text, html, created_at, modified_at, id, color) => {
  const noteCard = document.createElement('div');
  noteCard.classList.add('note-card');
  noteCard.addEventListener('click', (e) => {
    setModalColor(color);
    dialogNoteForm.showModal();
    let btnSave = document.createElement('button');
    btnSave.innerText = 'Save';
    btnSave.classList.add('dialog-btn');
    btnSave.addEventListener('click', async (e) => {
      e.stopPropagation();
      dialogNoteForm.close();
      await newNotes.updateNote(
        getTitleInput(),
        inputNoteText.getEditorContents(),
        inputNoteText.getEditorContentsHTML().replaceAll('<p></p>', '<br/>'),
        id,
        btnColorPopOver.style.backgroundColor
      );
      resetMasonry();
    });
    dialogButtonOptions.insertAdjacentElement('beforeend', btnSave);
    inputTitle.value = title;
    inputNoteText.setEditorContents(text);
  });

  const btnDeleteCard = document.createElement('button');
  btnDeleteCard.classList.add('btn-delete-card');
  btnDeleteCard.innerHTML = '<ion-icon name="close-outline"></ion-icon>';
  btnDeleteCard.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    newNotes.removeNote(id);
    let elem = e.target.parentNode.parentNode;
    msnry.remove(elem);
    msnry.layout();
  });

  const noteContent = document.createElement('div');
  noteContent.style.backgroundColor = color;
  noteContent.classList.add('note-content');

  const noteTitle = document.createElement('h2');
  noteTitle.classList.add('note-title');
  noteTitle.innerText = title;

  let result = '';
  if (created_at === modified_at) {
    result = formatDistance(
      created_at,
      format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSS"),
      { addSuffix: true }
    );
  } else {
    result =
      'edited ' +
      formatDistance(
        modified_at,
        format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSS"),
        { addSuffix: true }
      );
  }

  const noteDate = document.createElement('small');
  noteDate.innerText = result;

  const noteText = document.createElement('div');
  noteText.classList.add('note-text');
  noteText.innerHTML = html;

  noteContent.appendChild(btnDeleteCard);
  noteContent.appendChild(noteTitle);
  noteContent.appendChild(noteDate);
  noteContent.appendChild(noteText);
  noteCard.appendChild(noteContent);

  return noteCard;
};

const populateMasonryContainer = async () => {
  let notes = await newNotes.getAllNotes();
  for (let note of notes) {
    let elem = createCard(
      note.title,
      note.text,
      note.html,
      note.created_at,
      note.modified_at,
      note.id,
      note.color
    );
    grid.appendChild(elem);
    msnry.appended(elem);
    msnry.layout();
  }
};

onAuthStateChanged(auth, (user) => {
  if (user) {
    populateMasonryContainer();
    console.log(user);
  } else {
    msnry.remove(grid.children);
  }
});

const saveNewNote = async () => {
  Note(
    getTitleInput(),
    inputNoteText.getEditorContents(),
    inputNoteText.getEditorContentsHTML(),
    btnColorPopOver.style.backgroundColor
  );

  let note = await newNotes.getNewestNote();

  let newNotesCard = createCard(
    note.title,
    note.text,
    note.html,
    note.created_at,
    note.modified_at,
    note.id,
    note.color
  );

  grid.appendChild(newNotesCard);
  msnry.prepended(newNotesCard);
  msnry.layout();

  dialogNoteForm.close();
};

btnOpenNewNoteModal.addEventListener('click', () => {
  setModalColor(colorSwatch[0]);
  dialogNoteForm.showModal();
  inputNoteText.getFocus();
  let btnSave = document.createElement('button');
  btnSave.innerText = 'Save';
  btnSave.onclick = saveNewNote;
  btnSave.classList.add('dialog-btn');
  dialogButtonOptions.insertAdjacentElement('beforeend', btnSave);
});

dialogNoteForm.addEventListener('close', (e) => {
  inputNoteText.clearEditor();
  clearTitleInput();
  dialogButtonOptions.removeChild(dialogButtonOptions.lastChild);
  popoverOverlay.classList.remove('active');
  popoverDialog.classList.remove('active');
  setModalColor(colorSwatch[0]);
});

dialogNoteForm.addEventListener('mousedown', (event) => {
  if (event.target.tagName === 'DIALOG') {
    dialogNoteForm.close();
  }
});

const getTitleInput = () => {
  if (inputTitle === null || inputTitle.value === '') return 'Untitled';
  else return inputTitle.value;
};

const clearTitleInput = () => {
  inputTitle.value = '';
};

//colorpicker
btnColorPopOver.addEventListener('click', (e) => {
  e.preventDefault();
  popoverOverlay.classList.toggle('active');
  popoverDialog.classList.toggle('active');
});

popoverOverlay.addEventListener('click', () => {
  popoverOverlay.classList.remove('active');
  popoverDialog.classList.remove('active');
});

const createColorButtons = (swatch) => {
  for (let e of swatch) {
    let btn = document.createElement('button');
    btn.classList.add('btn-color-option');
    btn.style.backgroundColor = e;
    btn.style.cursor = 'pointer';
    popoverDialog.appendChild(btn);
    btn.onclick = () => {
      setModalColor(e);
      popoverOverlay.classList.remove('active');
      popoverDialog.classList.remove('active');
    };
  }
};

createColorButtons(colorSwatch);
