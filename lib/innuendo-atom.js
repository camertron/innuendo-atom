'use babel'

import IdentifierHighlighter from './identifier-highlighter';
import JumpToDefinition from './jump-to-definition';
import { Disposable, CompositeDisposable } from 'atom';

export default {
  innuendoAtomView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    // this.innuendoAtomView = new InnuendoAtomView(state.innuendoAtomViewState);
    // this.modalPanel = atom.workspace.addModalPanel({
    //   item: this.innuendoAtomView.getElement(),
    //   visible: false
    // });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'innuendo-atom:show-identifiers': () => this.showIdentifiers()
    }));

    this.identifierHighlighter = new IdentifierHighlighter();

    disposables = new CompositeDisposable();

    createEventListener = (editor, eventName, handler) => {
      let editorView = atom.views.getView(editor);
      editorView.addEventListener(eventName, handler);
      return new Disposable(() => {
        editor.removeEventListener(eventName, handler);
      });
    };

    atom.workspace.observeTextEditors((editor) => {
      if (editor.getGrammar().name.toLowerCase() === 'ruby') {
        let keyupHandler = createEventListener(editor, 'keyup', (event) => {
          this.identifierHighlighter.removeHighlights();
        });

        let clickHandler = createEventListener(editor, 'click', (event) => {
          let editorView = atom.views.getView(editor);
          let screenPos = editorView.component.screenPositionForMouseEvent(event);
          let bufferPos = editor.bufferPositionForScreenPosition(screenPos);
          let markers = editor.findMarkers({ containsBufferPosition: bufferPos });

          // Cmd/Ctrl-clicking will add a new cursor, which we don't want
          if (editor.hasMultipleCursors()) {
            editor.getCursorAtScreenPosition(screenPos).destroy();
          }

          if (markers.length > 0) {
            let startPos = markers[0].getBufferRange().start;
            let offset = editor.getBuffer().characterIndexForPosition(startPos);

            new JumpToDefinition(editor.getPath(), offset).jump();
          }
        });

        disposables.add(keyupHandler);
        disposables.add(clickHandler);
      }
    });
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.innuendoAtomView.destroy();
  },

  serialize() {
    return {
      // innuendoAtomViewState: this.innuendoAtomView.serialize()
    };
  },

  showIdentifiers() {
    let editor = atom.workspace.getActiveTextEditor();

    if (editor.getGrammar().name.toLowerCase() === 'ruby') {
      this.identifierHighlighter.highlightInEditor(editor);
    }
  }
};
