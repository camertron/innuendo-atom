'use babel'

import IdentifierHighlighter from './identifier-highlighter';
import JumpToDefinition from './jump-to-definition';
import { Disposable, CompositeDisposable } from 'atom';

export default {
  activate(state) {
    this.subscriptions = new CompositeDisposable();

    atom.workspace.observeTextEditors((editor) => {
      if (editor.getGrammar().name.toLowerCase() === 'ruby') {
        let highlighter = new IdentifierHighlighter(editor);
        let editorView = atom.views.getView(editor);

        createEventListener = (eventName, handler) => {
          editorView.addEventListener(eventName, handler);
          return new Disposable(() => {
            editor.removeEventListener(eventName, handler);
          });
        };

        atom.commands.add(editorView, {
          'innuendo-atom:show-identifiers': () => {
            highlighter.highlightIdentifiers();
          }
        });

        this.subscriptions.add(
          createEventListener('keyup', (event) => {
            highlighter.removeHighlights();
          })
        );

        this.subscriptions.add(
          highlighter.onMarkerClick((props) => {
            if (!props.marker) { debugger; }
            let startPos = props.marker.marker.getBufferRange().start;
            let offset = editor.getBuffer().characterIndexForPosition(startPos);

            new JumpToDefinition(editor.getPath(), offset).jump();
          })
        );
      }
    });
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  serialize() {
    return {
      // innuendoAtomViewState: this.innuendoAtomView.serialize()
    };
  }
};
