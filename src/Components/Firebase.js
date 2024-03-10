// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCWCD0fELIxsopuhhfJo1KLymb2krWtHfI',
  authDomain: 'rcsmr-notes.netlify.app',
  projectId: 'rcsmr-notes-app',
  storageBucket: 'rcsmr-notes-app.appspot.com',
  messagingSenderId: '367911567246',
  appId: '1:367911567246:web:9b062c0ba2bca47fcfeedf',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;
