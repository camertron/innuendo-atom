'use babel';

import InnuendoAtomView from './innuendo-atom-view';
import { CompositeDisposable } from 'atom';

export default {

  innuendoAtomView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.innuendoAtomView = new InnuendoAtomView(state.innuendoAtomViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.innuendoAtomView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'innuendo-atom:show-identifiers': () => this.showIdentifiers()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.innuendoAtomView.destroy();
  },

  serialize() {
    return {
      innuendoAtomViewState: this.innuendoAtomView.serialize()
    };
  },

  showIdentifiers() {
    debugger
    console.log('Show identifiers!')
    return true
  }
};
