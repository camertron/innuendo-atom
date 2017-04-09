'use babel'

import IdentifierHighlighter from './identifier-highlighter';
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
        let keydownHandler = createEventListener(editor, 'keydown', (event) => {
          if (event.key === 'Meta') {
            this.identifierHighlighter.highlightInEditor(editor);
          }
        });

        let keyupHandler = createEventListener(editor, 'keyup', (event) => {
          this.identifierHighlighter.removeHighlights();
        });

        disposables.add(keydownHandler);
        disposables.add(keyupHandler);
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
  }
};
