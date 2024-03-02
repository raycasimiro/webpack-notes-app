import Masonry from 'masonry-layout';
import { Note, Notes } from './Components/Notes';
import QuilEditor from './Components/QuilEditor';

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

import './reset.css';
import './index.css';

//initialise Masonry.js
const grid = document.querySelector('.notes-container');
const msnry = new Masonry(grid, {
  percentPosition: true,
  itemSelector: '.note-card',
  columnWidth: '.grid-sizer',
  horizontalOrder: true,
});

//initialize Quill editor
const editorNewNote = QuilEditor('editor-new-note');

//initialize Notes
const newNote = Notes();

//sample Notes
// newNote.addNote(
//   Note('Testing1', { ops: [{ insert: 'lorem ipsum\n' }] }, '<p>lorem ipsum</p>')
// );
// newNote.addNote(
//   Note('Testing2', { ops: [{ insert: 'dolor sit amet\n' }] }, 'dolor sit amet')
// );
// newNote.addNote(
//   Note('Testing3', { ops: [{ insert: 'dolor sit amet\n' }] }, 'dolor sit amet')
// );

const updateNote = (id) => {
  let note = newNote.findNote(id);
  note.title = getTitleInput();
  note.text = editorNewNote.getEditorContents();
  note.html = editorNewNote
    .getEditorContentsHTML()
    .replaceAll('<p></p>', '<br/>');
  console.log(newNote.getAllNotes());
  dialogNewNote.close();
};

const updateCard = (elem) => {
  msnry.remove(grid.children);
  populateMasonryContainer();
};

//create Card element
const createCard = (title, text, html, date, getID) => {
  const noteCard = document.createElement('div');
  noteCard.classList.add('note-card');
  noteCard.addEventListener('click', (e) => {
    const cardElem = e.target;
    console.log(getID);
    dialogNewNote.showModal();
    let btnSave = document.createElement('button');
    btnSave.innerText = 'Save';
    btnSave.classList.add('dialog-btn');
    btnSave.addEventListener('click', (e) => {
      e.stopPropagation();
      updateNote(getID);
      updateCard(cardElem);
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
    newNote.removeNote(getID);
    let elem = e.target.parentNode.parentNode;
    msnry.remove(elem);
    msnry.layout();
  });

  const noteContent = document.createElement('div');
  noteContent.classList.add('note-content');

  const noteTitle = document.createElement('h2');
  noteTitle.classList.add('note-title');
  noteTitle.innerText = title;

  const noteDate = document.createElement('small');
  noteDate.innerText = date;

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

const populateMasonryContainer = () => {
  for (let note of newNote.getAllNotes()) {
    let elem = createCard(
      note.title,
      note.text,
      note.html,
      note.getDate(),
      note.getID()
    );
    grid.appendChild(elem);
    msnry.appended(elem);
    msnry.layout();
  }
};

populateMasonryContainer();

// const btnSaveNote = document.getElementById('btn-save-note');
const btnOpenNewNoteModal = document.getElementById('btn-open-newnote-modal');
const dialogButtonOptions = document.getElementById('dialog-button-options');
const dialogNewNote = document.getElementById('dialog-newnote-form');
const inputTitle = document.getElementById('new-note-title');

const saveNewNote = () => {
  newNote.addNote(
    Note(
      getTitleInput(),
      editorNewNote.getEditorContents(),
      editorNewNote.getEditorContentsHTML()
    )
  );

  let newNoteCard = createCard(
    newNote.getLatestNote().title,
    newNote.getLatestNote().text,
    newNote.getLatestNote().html,
    newNote.getLatestNote().getDate(),
    newNote.getLatestNote().getID()
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

dialogNewNote.addEventListener('click', (event) => {
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

//Firebase auth
const auth = getAuth();
const provider = new GoogleAuthProvider();

const btnSignIn = document.getElementById('btn-sign-in');
const btnSignOut = document.getElementById('btn-sign-out');

const loginStatusMsg = document.getElementById('login-status-msg');

btnSignOut.style.display = 'none';
loginStatusMsg.style.display = 'none';

const userSignIn = async () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      // --- const credential = GoogleAuthProvider.credentialFromResult(result);
      // --- const token = credential.accessToken;
      // The signed-in user info.
      const user = result.user;
      console.log(user);
      // IdP data available using getAdditionalUserInfo(result)
      // ...
    })
    .catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      // --- const email = error.customData.email;
      // The AuthCredential type that was used.
      // --- const credential = GoogleAuthProvider.credentialFromError(error);
      // ...
    });
};

const userSingOut = async () => {
  signOut(auth)
    .then(() => {
      alert('Sign-out successful');
      btnSignOut.style.display = 'none';
      loginStatusMsg.style.display = 'none';
    })
    .catch((error) => {
      //error happened
    });
};

onAuthStateChanged(auth, (user) => {
  if (user) {
    btnSignOut.style.display = 'inline-block';
    loginStatusMsg.style.display = 'flex';
  } else {
  }
});

btnSignIn.onclick = userSignIn;
btnSignOut.onclick = userSingOut;
