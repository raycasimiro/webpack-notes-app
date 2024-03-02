import Quill from 'quill/core';
import Clipboard from 'quill/modules/clipboard';
import { Delta } from 'quill/core';

export default class PlainClipboard extends Clipboard {
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
