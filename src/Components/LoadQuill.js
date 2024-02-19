import Quill from 'quill';
import 'quill/dist/quill.bubble.css';
import './LoadQuill.css';

export default function LoadQuill() {
  // const toolbarOptions = [
  //   ['bold', 'italic', 'underline', 'strike'], // toggled buttons
  //   ['blockquote', 'code-block'],
  //   [{ header: 1 }, { header: 2 }], // custom button values
  //   [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
  // ];

  const toolbarOptions = {
    container: [
      ['bold', 'italic', 'underline'],
      ['blockquote', 'code-block'],
      [{ header: 1 }, { header: 2 }],
      [{ list: 'ordered' }, { list: 'bullet' }],
    ],
    handlers: {
      // handlers object will be merged with default handlers object
      link: function (value) {
        if (value) {
          const href = prompt('Enter the URL');
          this.quill.format('link', href);
        } else {
          this.quill.format('link', false);
        }
      },
    },
  };
  const options = {
    theme: 'bubble',
    modules: { toolbar: toolbarOptions },
    placeholder: "What's up?",
  };
  const editor = document.getElementById('editor');

  const quill = new Quill(editor, options);

  // const toolbar = quill.getModule('toolbar');
  // toolbar.addHandler('image', showImageUI);

  editor.firstChild.onfocus = () => {
    editor.firstChild.style.outline = '1px solid red';
    quill.formatText(0, 1, 'header', true);
  };

  // quill.on('editor-change', () => {
  //   console.log(quill.getContents().ops[0].insert);
  // });

  editor.firstChild.onblur = () => {
    editor.firstChild.style.outline = 'none';
    if (quill.getContents().ops[0].insert === '\n') quill.setContents([]);
  };
}
