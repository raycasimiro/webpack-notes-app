import Quill from 'quill/core';
import PlainClipboard from './PlainClipboard';
import Toolbar from 'quill/modules/toolbar';
import Snow from 'quill/themes/snow';
import Bold from 'quill/formats/bold';
import Italic from 'quill/formats/italic';
import Strike from 'quill/formats/strike';
import Header from 'quill/formats/header';
import Underline from 'quill/formats/underline';
import Blockquote from 'quill/formats/blockquote';
import Code from 'quill/formats/code';
import List from 'quill/formats/list';
import CustomLink from './CustomLink';
import { ColorStyle } from 'quill/formats/color';
import 'quill/dist/quill.snow.css';
import './QuilEditor.css';

Quill.register({
  'modules/toolbar': Toolbar,
  'themes/snow': Snow,
  'formats/bold': Bold,
  'formats/italic': Italic,
  'formats/underline': Underline,
  'formats/strike': Strike,
  'formats/header': Header,
  'formats/blockquote': Blockquote,
  'formats/code': Code,
  'formats/list': List,
  'formats/color': ColorStyle,
  'formats/link': CustomLink,
});

Quill.register('modules/clipboard', PlainClipboard, true);

export default function QuilEditor(id) {
  const toolbarOptions = {
    container: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'code-block', 'link'],
      [{ header: 1 }, { header: 2 }],
      ['clean'],
    ],
  };
  const options = {
    theme: 'snow',
    modules: { toolbar: toolbarOptions },
    placeholder: "What's up?",
  };

  const editor = document.getElementById(id);
  const quill = new Quill(editor, options);

  const getEditorContents = () => quill.getContents();
  const setEditorContents = (Delta) => quill.setContents(Delta);
  const clearEditor = () => quill.setContents([]);
  const getFocus = () => quill.focus();
  const getEditorContentsHTML = () => quill.getSemanticHTML();

  return {
    getEditorContents,
    setEditorContents,
    clearEditor,
    getFocus,
    getEditorContentsHTML,
  };
}
