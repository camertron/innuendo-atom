'use babel'

import Client from './client'

export default class JumpToDefinition {
  constructor(file, offset) {
    this.file = file;
    this.offset = offset;
    this.client = new Client();
  }

  jump() {
    this.client.define(this.file, this.offset).then((data) => {
      switch (data.kind) {
        case 'scope_variable': this._handleScopeVariable(data);
      }
    });
  }

  _handleScopeVariable(data) {
    let pos = data.element.scope.definition_position;

    if (pos != null) {
      atom.open({ pathsToOpen: [pos.file + ':' + (pos.line_number + 1)], newWindow: false });
    }
  }
}
