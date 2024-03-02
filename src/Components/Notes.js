import { format, formatDistance } from 'date-fns';
import app from './Firebase';
import {
  getDatabase,
  set,
  get,
  update,
  remove,
  ref,
  child,
} from 'firebase/database';
import './Notes.css';

function Note(strTitle, objText, strHTML) {
  let title = strTitle;
  let text = objText;
  let html = strHTML.replaceAll('<p></p>', '<br/>');
  const id = crypto.randomUUID();
  let dateTime = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSS");

  const getDate = () => {
    const result = formatDistance(
      dateTime,
      format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSS"),
      { addSuffix: true }
    );
    return result;
  };

  const getID = () => {
    return id;
  };

  return { title, text, html, getDate, getID };
}

function Notes() {
  let notes = [];

  const addNote = (objNote) => notes.unshift(objNote);

  const removeNote = (id) => {
    notes = notes.filter((x) => x.getID() !== id);
    console.log(notes);
  };

  const getLatestNote = () => notes[0];

  const getAllNotes = () => notes;

  const findNote = (id) => {
    let note = notes.find((e) => e.getID() === id);
    return note;
  };

  return { addNote, removeNote, findNote, getAllNotes, getLatestNote };
}

export { Note, Notes };
