import { format } from 'date-fns';
import './Notes.css';

function Note(strTitle, strText, strHTML) {
  let title = strTitle;
  let text = strText;
  let html = strHTML;
  const dateTime = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSS");
  return { title, text, dateTime, html };
}

function Notes() {
  let notes = [];

  const addNote = (objNote) => notes.unshift(objNote);

  const removeNote = (strDateTime) =>
    notes.filter((note) => note.dateTime !== strDateTime);

  const getLatestNote = () => notes[0];

  return { addNote, removeNote, notes, getLatestNote };
}

export { Note, Notes };
