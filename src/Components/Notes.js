import { format, formatDistance } from 'date-fns';
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

import {
  getAuth,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  signInWithRedirect,
  linkWithPopup,
} from 'firebase/auth';

//Firebase auth
const auth = getAuth();
const provider = new GoogleAuthProvider();

const btnSignIn = document.getElementById('btn-sign-in');
const btnSignOut = document.getElementById('btn-sign-out');

const loginStatusMsg = document.getElementById('login-status-msg');

btnSignOut.style.display = 'none';
loginStatusMsg.style.display = 'none';

const userSignIn = async () => {
  signInWithRedirect(auth, provider)
    .then((result) => {
      const user = result.user;
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
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

btnSignIn.onclick = userSignIn;
btnSignOut.onclick = userSingOut;

//init Firestore service
const db = getFirestore();

//collection reference
const colRef = collection(db, 'users');

let uid;
onAuthStateChanged(auth, (user) => {
  if (user) {
    uid = user.uid;
    btnSignOut.style.display = 'inline-block';
    loginStatusMsg.style.display = 'flex';
  } else {
  }
});

import './Notes.css';

function Note(strTitle, objText, strHTML) {
  const userRef = collection(db, 'users/' + uid + '/notes/');
  let currentDateTime = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSS");
  addDoc(userRef, {
    title: strTitle,
    text: { ...objText },
    html: strHTML,
    id: crypto.randomUUID(),
    created_at: currentDateTime,
    modified_at: currentDateTime,
  }).then(() => {
    //confirm added
  });

  let title = strTitle;
  let text = objText;
  let html = strHTML.replaceAll('<p></p>', '<br/>');
  const id = crypto.randomUUID();
  let created_at = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSS");

  return { title, text, html, created_at, id };
}

function Notes() {
  let notes = [];

  const addNote = (objNote) => notes.unshift(objNote);

  const removeNote = async (strID) => {
    const userRef = collection(db, 'users/' + uid + '/notes/');
    const q = query(userRef, where('id', '==', strID));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      deleteDoc(doc.ref).then(() => {
        // alert('deleted succesfully!');
      });
    });
  };

  const getLatestNote = () => notes[0];

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
    querySnapshot.forEach((doc) => {
      notes.push({ ...doc.data() });
    });
    console.log(notes);
    return notes;
  };

  const updateNote = async (strTitle, objText, strHtml, strID) => {
    const userRef = collection(db, 'users/' + uid + '/notes/');
    const q = query(userRef, where('id', '==', strID));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      updateDoc(doc.ref, {
        title: strTitle,
        text: { ...objText },
        html: strHtml,
        modified_at: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSS"),
      }).then(() => {
        //confirm update
      });
    });
  };

  return {
    addNote,
    removeNote,
    updateNote,
    getAllNotes,
    getLatestNote,
    getNewestNote,
  };
}

export { Note, Notes };
