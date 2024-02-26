import Masonry from 'masonry-layout';
import { Note, Notes } from './Components/Notes';
import QuilEditor from './Components/QuilEditor';
import './reset.css';
import './index.css';

const grid = document.querySelector('.notes-container');
const msnry = new Masonry(grid, {
  percentPosition: true,
  itemSelector: '.note-card',
  columnWidth: '.grid-sizer',
});

const editorNewNote = QuilEditor('editor-new-note');

const notes = Notes();

notes.addNote(Note('Testing1', 'lorem ipsum'));
notes.addNote(Note('Testing2', 'dolor sit amet'));
notes.addNote(Note('Testing3', 'dolor sit amet'));

const createNoteCard = (title, html) => {
  const noteCard = document.createElement('div');
  noteCard.classList.add('note-card');

  const noteContent = document.createElement('div');
  noteContent.classList.add('note-content');

  const noteTitle = document.createElement('h2');
  noteTitle.classList.add('note-title');
  noteTitle.innerText = title;

  const noteText = document.createElement('div');
  noteText.classList.add('note-text');
  noteText.innerHTML = html;

  noteContent.appendChild(noteTitle);
  noteContent.appendChild(noteText);
  noteCard.appendChild(noteContent);

  return noteCard;
};

const initMasonry = () => {
  for (let note of notes.notes) {
    let elem = createNoteCard(note.title, note.text);
    grid.appendChild(elem);
    msnry.appended(elem);
    msnry.layout();
  }
};

initMasonry();

const btnAddNote = document.getElementById('btn-save-note');

let inputTitle = document.getElementById('new-note-title');

const getTitleInput = () => {
  if (inputTitle === null || inputTitle.value === '') return 'Untitled';
  else return inputTitle.value;
};

const clearTitleInput = () => {
  inputTitle.value = '';
};

btnAddNote.addEventListener('click', (e) => {
  e.preventDefault();
  notes.addNote(
    Note(
      getTitleInput(),
      editorNewNote.getEditorContents(),
      editorNewNote.getEditorContentsHTML()
    )
  );

  let newNoteCard = createNoteCard(
    notes.getLatestNote().title,
    notes.getLatestNote().html
  );

  grid.appendChild(newNoteCard);
  msnry.prepended(newNoteCard);
  msnry.layout();

  editorNewNote.clearEditor();
  clearTitleInput();
  console.log(notes.notes);
});
