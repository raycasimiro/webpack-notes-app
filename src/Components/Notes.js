import { format } from 'date-fns';
import './Notes.css';
import app from './Firebase';
import {
  where,
  getFirestore,
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  deleteDoc,
  updateDoc,
  limit,
} from 'firebase/firestore';

import { getAuth, onAuthStateChanged } from 'firebase/auth';

const auth = getAuth();
let uid;
onAuthStateChanged(auth, async (user) => {
  if (user) {
    uid = user.uid;
  } else {
  }
});

//init Firestore service
const db = getFirestore();

function Notes() {
  let colorsAvailable = [];

  const getAllAvailableColors = () => colorsAvailable;

  const addNote = async (strTitle, objText, strHTML, strColor) => {
    colorsAvailable.push(strColor);
    const userRef = collection(db, 'users/' + uid + '/notes/');
    let currentDateTime = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSS");
    addDoc(userRef, {
      title: strTitle,
      text: { ...objText },
      html: strHTML,
      id: crypto.randomUUID(),
      created_at: currentDateTime,
      modified_at: currentDateTime,
      color: strColor,
    }).then(() => {
      //confirm added
    });
  };

  const removeNote = async (strID, strColor) => {
    let index = colorsAvailable.findIndex((color) => color === strColor);
    colorsAvailable.splice(index, 1);
    const userRef = collection(db, 'users/' + uid + '/notes/');
    const q = query(userRef, where('id', '==', strID));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      deleteDoc(doc.ref).then(() => {
        // alert('deleted succesfully!');
      });
    });
  };

  const updateNote = async (strTitle, objText, strHtml, strID, strColor) => {
    const userRef = collection(db, 'users/' + uid + '/notes/');
    const q = query(userRef, where('id', '==', strID));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      updateDoc(doc.ref, {
        title: strTitle,
        text: { ...objText },
        html: strHtml,
        modified_at: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSS"),
        color: strColor,
      }).then(() => {
        //saved
      });
    });
  };

  const filterNotes = async (strAttr, strValue) => {
    const userRef = collection(db, 'users/' + uid + '/notes/');
    const q = query(userRef, where(strAttr, '==', strValue));
    const querySnapshot = await getDocs(q);
    let notes = [];
    querySnapshot.forEach((doc) => {
      notes.push({ ...doc.data() });
    });
    return notes;
  };

  const getNewestNote = async () => {
    const userRef = collection(db, 'users/' + uid + '/notes/');
    const q = query(userRef, orderBy('modified_at', 'desc'), limit(1));
    const querySnapshot = await getDocs(q);
    let note = {};
    querySnapshot.forEach((doc) => {
      note = { ...doc.data() };
    });
    return note;
  };

  const getAllNotes = async () => {
    const userRef = collection(db, 'users/' + uid + '/notes/');
    const q = query(userRef, orderBy('modified_at', 'desc'));
    const querySnapshot = await getDocs(q);
    let notes = [];
    colorsAvailable = [];
    querySnapshot.forEach((doc) => {
      notes.push({ ...doc.data() });
      colorsAvailable.push(doc.data().color);
    });
    return notes;
  };

  return {
    addNote,
    removeNote,
    updateNote,
    getAllNotes,
    filterNotes,
    getNewestNote,
    getAllAvailableColors,
  };
}

export default Notes;
