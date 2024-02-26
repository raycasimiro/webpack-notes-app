import Quill from 'quill/core';
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
import Link from 'quill/formats/link';
import { ColorStyle } from 'quill/formats/color';
import 'quill/dist/quill.snow.css';
import './QuilEditor.css';

import Clipboard from 'quill/modules/clipboard';
import { Delta } from 'quill/core';

Link.PROTOCOL_WHITELIST = [
  'http',
  'https',
  'mailto',
  'tel',
  'radar',
  'rdar',
  'smb',
  'sms',
];

class PlainClipboard extends Clipboard {
  onPaste(range, { text }) {
    const delta = new Delta()
      .retain(range.index)
      .delete(range.length)
      .insert(text);
    this.quill.updateContents(delta, Quill.sources.USER);
    this.quill.setSelection(
      delta.length() - range.length,
      Quill.sources.SILENT
    );
    this.quill.scrollSelectionIntoView();
  }
}

class CustomLink extends Link {
  static sanitize(url) {
    // Run default sanitize method from Quill
    const sanitizedUrl = super.sanitize(url);

    // Not whitelisted URL based on protocol so, let's return `blank`
    if (!sanitizedUrl || sanitizedUrl === 'about:blank') return sanitizedUrl;

    // Verify if the URL already have a whitelisted protocol
    const hasWhitelistedProtocol = this.PROTOCOL_WHITELIST.some(function (
      protocol
    ) {
      return sanitizedUrl.startsWith(protocol);
    });

    if (hasWhitelistedProtocol) return sanitizedUrl;

    // if not, then append only 'http' to not to be a relative URL
    return `http://${sanitizedUrl}`;
  }
}

Quill.register({
  'modules/clipboard': PlainClipboard,
  'formats/link': Strike,
  'modules/toolbar': Toolbar,
  'themes/snow': Snow,
  'formats/bold': Bold,
  'formats/italic': Italic,
  'formats/header': Header,
  'formats/underline': Underline,
  'formats/blockquote': Blockquote,
  'formats/code': Code,
  'formats/list': List,
  'formats/color': ColorStyle,
  'formats/link': Link,
  'formats/link': CustomLink,
});

export default function QuilEditor(id) {
  const toolbarOptions = {
    container: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }],
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
  const clearEditor = () => quill.setContents([]);
  const getEditorContentsHTML = () => quill.getSemanticHTML();

  return { getEditorContents, clearEditor, getEditorContentsHTML };
}
