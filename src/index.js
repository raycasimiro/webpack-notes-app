import Masonry from 'masonry-layout';
import Notes from './Components/Notes';
import QuilEditor from './Components/QuilEditor';
import { format, formatDistance, parseISO } from 'date-fns';
import './reset.css';
import './index.css';
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut,
  onAuthStateChanged,
  signInWithRedirect,
} from 'firebase/auth';

//UI Elements
const dialogSignIn = document.getElementById('dialog-sign-in');
const dialogSignOut = document.getElementById('dialog-sign-out');
const btnSignInGoogle = document.getElementById('btn-google-sign-in');
const btnSignInGithub = document.getElementById('btn-github-sign-in');
const dialogButtonOptions = document.getElementById('dialog-button-options');
const dialogNoteForm = document.getElementById('dialog-note-form');
const formContainer = document.getElementById('form-container');
const inputTitle = document.getElementById('input-note-title');
const btnColorPopOver = document.getElementById('btn-color-popover');
const popoverOverlay = document.getElementById('popover-overlay');
const popoverDialog = document.getElementById('popover-dialog');
const colorsMenu = document.getElementById('colors-menu');
const actionsMenu = document.getElementById('actions-menu');
const btnUserActions = document.getElementById('btn-user-actions');
const userProfilePhoto = document.getElementById('user-profile-photo');

//Firebase auth
const auth = getAuth();
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

const signInWithGoogle = () => {
  signInWithRedirect(auth, googleProvider)
    .then((result) => {
      const user = result.user;
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
    });
};

const signInWithGithub = () => {
  signInWithRedirect(auth, githubProvider)
    .then((result) => {
      const credential = GithubAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      const user = result.user;
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = GithubAuthProvider.credentialFromError(error);
    });
};

const userSignOut = async () => {
  dialogSignOut.close();
  signOut(auth)
    .then(() => {
      // btnSignOut.style.display = 'none';
    })
    .catch((error) => {
      //error happened
    });
};

dialogSignIn.addEventListener('cancel', (e) => {
  e.preventDefault();
});

btnSignInGoogle.onclick = signInWithGoogle;
btnSignInGithub.onclick = signInWithGithub;

onAuthStateChanged(auth, async (user) => {
  if (user) {
    populateMasonryContainer(await newNotes.getAllNotes());
    userProfilePhoto.innerHTML = ` <img src="${user.photoURL}" alt="">`;
    dialogSignIn.close();
    createSignOutBtn(user);
    createAddNoteBtn();
    createAddNoteBtnMobile();
  } else {
    document.getElementById('menu-container').innerHTML = '';
    userProfilePhoto.innerHTML = '';
    colorsMenu.innerHTML = '';
    dialogSignIn.showModal();
    msnry.remove(grid.children);
  }
});

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

btnUserActions.addEventListener('click', () => {
  dialogSignOut.showModal();
});

dialogSignOut.addEventListener('click', (e) => {
  if (e.target.tagName === 'DIALOG') dialogSignOut.close();
});

const colorSwatch = [
  '#FFD966',
  '#FFC470',
  '#FFAFA3',
  '#FFADE7',
  '#E6E6E6',
  '#D9B8FF',
  '#AFBCCF',
  '#85E0A3',
  '#80CAFF',
];

const createAddNoteBtn = () => {
  let btn = document.createElement('button');
  btn.id = 'btn-open-newnote-modal';
  btn.classList.add('btn-primary');
  btn.innerText = 'Add Note';
  btn.onclick = openNewNoteModal;
  document.getElementById('menu-container').appendChild(btn);
};

const createAddNoteBtnMobile = () => {
  let div = document.createElement('div');
  div.classList.add('floating-btn-container');
  let btn = document.createElement('button');
  btn.id = 'btn-open-newnote-modal-mobile';
  btn.innerText = '+';
  btn.onclick = openNewNoteModal;
  div.appendChild(btn);
  document.body.appendChild(div);
};

const createSignOutBtn = (user) => {
  let btn = document.createElement('button');
  let userDisplayName = document.createElement('h4');
  let userEmail = document.createElement('small');
  btn.id = 'btn-sign-out';
  btn.innerText = 'Sign out';
  btn.style.width = '100%';
  btn.style.marginTop = '1rem';
  btn.classList.add('btn-primary');
  btn.onclick = userSignOut;
  userDisplayName.innerText = user.displayName;
  userEmail.innerText = user.email;
  dialogSignOut.appendChild(userDisplayName);
  dialogSignOut.appendChild(userEmail);
  dialogSignOut.appendChild(btn);
};

const setModalColor = (strColor) => {
  formContainer.style.backgroundColor = strColor;
  btnColorPopOver.style.backgroundColor = strColor;
};

//initialize Quill editor
const inputNoteText = QuilEditor('input-note-text');

//initialize Notes
const newNotes = Notes();

//readable date
const getReadableDate = (strDate) => {
  let parsedDate = parseISO(strDate);
  return format(parsedDate, 'PPP');
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
    btnSave.style.marginLeft = 'auto';
    btnSave.classList.add('btn-primary');
    btnSave.addEventListener('click', async (e) => {
      e.stopPropagation();
      dialogNoteForm.close();
      let getHtml = inputNoteText.getEditorContentsHTML();
      if (getHtml !== '<p></p>')
        inputNoteText.getEditorContentsHTML().replaceAll('<p></p>', '<br/>');
      await newNotes.updateNote(
        getTitleInput(),
        inputNoteText.getEditorContents(),
        getHtml,
        id,
        rgbToHex(btnColorPopOver.style.backgroundColor)
      );
      msnry.remove(grid.children);
      populateMasonryContainer(await newNotes.getAllNotes());
    });
    dialogButtonOptions.insertAdjacentElement('beforeend', btnSave);
    inputTitle.value = title;
    inputNoteText.setEditorContents(text);
  });

  const btnDeleteCard = document.createElement('button');
  btnDeleteCard.classList.add('btn-delete-card');
  btnDeleteCard.innerHTML = '<ion-icon name="close-outline"></ion-icon>';
  btnDeleteCard.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await newNotes.removeNote(id, color);
    let elem = e.target.parentNode.parentNode;
    msnry.remove(elem);
    if (grid.children.length < 3) {
      actionsMenu.innerHTML = '';
      populateMasonryContainer(await newNotes.getAllNotes());
      isFilterMode = false;
    } else msnry.layout();
    createColorsFilterMenu();
  });

  const noteContent = document.createElement('div');
  noteContent.style.backgroundColor = color;
  noteContent.classList.add('note-content');

  const noteTitle = document.createElement('h2');
  noteTitle.classList.add('note-title');
  noteTitle.innerText = title;

  const noteReadableDate = document.createElement('p');
  noteReadableDate.innerText = getReadableDate(created_at);
  noteReadableDate.classList.add('note-readable-date');

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
  noteContent.appendChild(noteReadableDate);
  noteContent.appendChild(noteDate);
  noteContent.appendChild(noteText);
  noteCard.appendChild(noteContent);

  return noteCard;
};

let isFilterMode = false;
let prevUniqueColorsSize = [];
const createColorsFilterMenu = () => {
  let colors = newNotes.getAllAvailableColors();
  const uniqueColors = [...new Set(colors)];
  prevUniqueColorsSize.push(uniqueColors.length);
  console.log(prevUniqueColorsSize);
  uniqueColors.sort().reverse();
  colorsMenu.innerHTML = '';
  if (uniqueColors.length > 1 && !isFilterMode) {
    actionsMenu.innerHTML = '';
    let delay = 0;
    for (let color of uniqueColors) {
      let btn = document.createElement('button');
      btn.classList.add('btn-color-menu-option');
      btn.style.backgroundColor = color;
      if (
        uniqueColors.length !==
        prevUniqueColorsSize[prevUniqueColorsSize.length - 2]
      ) {
        btn.style.animationTimingFunction = 'ease-out';
        btn.style.animation = 'fade-in-from-bottom .5s';
        btn.style.animationDelay = `${delay}s`;
        btn.style.animationFillMode = 'forwards';
        delay += 0.05;
      } else btn.style.opacity = 1;
      btn.addEventListener('click', () => {
        isFilterMode = true;
        msnry.remove(grid.children);
        populateMasonryContainer(newNotes.filterNotes('color', color));
      });
      colorsMenu.appendChild(btn);
    }
  }
  //create back button
  if (
    uniqueColors.length > 1 &&
    isFilterMode &&
    actionsMenu.children.length === 0
  ) {
    prevUniqueColorsSize.length = 0;
    let btn = document.createElement('button');
    btn.id = 'btn-filter-all';
    btn.classList.add('btn-action-menu-option');
    btn.style.animationTimingFunction = 'ease-out';
    btn.style.animation = 'fade-in-from-bottom .5s';
    btn.innerHTML =
      '<ion-icon name="return-down-back-outline" size="large"></ion-icon>';
    btn.addEventListener('click', () => {
      isFilterMode = false;
      msnry.remove(grid.children);
      populateMasonryContainer(newNotes.getAllNotes());
    });
    actionsMenu.appendChild(btn);
  }
};

const populateMasonryContainer = async (objNotes) => {
  let notes = await objNotes;
  createColorsFilterMenu();
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

function rgbToHex(col) {
  if (col.charAt(0) == 'r') {
    col = col.replace('rgb(', '').replace(')', '').split(',');
    var r = parseInt(col[0], 10).toString(16);
    var g = parseInt(col[1], 10).toString(16);
    var b = parseInt(col[2], 10).toString(16);
    r = r.length == 1 ? '0' + r : r;
    g = g.length == 1 ? '0' + g : g;
    b = b.length == 1 ? '0' + b : b;
    var colHex = '#' + r + g + b;
    return colHex;
  }
}

const saveNewNote = async () => {
  await newNotes.addNote(
    getTitleInput(),
    inputNoteText.getEditorContents(),
    inputNoteText.getEditorContentsHTML(),
    rgbToHex(btnColorPopOver.style.backgroundColor)
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

  if (!isFilterMode) {
    createColorsFilterMenu();
    grid.appendChild(newNotesCard);
    msnry.prepended(newNotesCard);
    msnry.layout();
  } else {
    isFilterMode = false;
    msnry.remove(grid.children);
    populateMasonryContainer(await newNotes.getAllNotes());
  }
  dialogNoteForm.close();
};

const openNewNoteModal = () => {
  setModalColor(colorSwatch[0]);
  dialogNoteForm.showModal();
  inputNoteText.getFocus();
  let btnSave = document.createElement('button');
  btnSave.innerText = 'Save';
  btnSave.style.marginLeft = 'auto';
  btnSave.onclick = saveNewNote;
  btnSave.classList.add('btn-primary');
  dialogButtonOptions.insertAdjacentElement('beforeend', btnSave);
};

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

const createColorButtons = (colors) => {
  btnColorPopOver.innerHTML =
    '<ion-icon name="color-palette-outline" size="large"></ion-icon>';
  for (let color of colors) {
    let btn = document.createElement('button');
    btn.classList.add('btn-color-option');
    btn.style.backgroundColor = color;
    btn.style.cursor = 'pointer';
    popoverDialog.appendChild(btn);
    btn.onclick = () => {
      setModalColor(color);
      popoverOverlay.classList.remove('active');
      popoverDialog.classList.remove('active');
    };
  }
};
createColorButtons(colorSwatch);
