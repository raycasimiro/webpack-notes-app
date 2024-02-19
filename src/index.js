import Masonry from 'masonry-layout';
import App from './Components/App';
import LoadQuill from './Components/LoadQuill';
import './index.css';

const grid = document.querySelector('.notes-container');
const msry = new Masonry(grid, {
  percentPosition: true,
  itemSelector: '.note-card',
  columnWidth: '.grid-sizer',
});

LoadQuill();

// const root = document.createElement('div');
// document.body.appendChild(root);
// root.appendChild(App());
