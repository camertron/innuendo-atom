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
        case 'scope_variable': this._jumpToScopeVariable(data); break;
        case 'method_call':    this._jumpToMethodCall(data); break;
        case 'variable':       this._jumpToVariable(data); break;
      }
    });
  }

  _jumpToScopeVariable(data) {
    let pos = data.element.scope.definition_position;

    if (pos != null) {
      this._atomOpen(pos);
    }
  }

  _jumpToMethodCall(data) {
    let pos = data.element.methods[0].definition_position;

    if (pos != null) {
      this._atomOpen(pos);
    }
  }

  _jumpToVariable(data) {
    let pos = data.element.definition_position;

    if (pos != null) {
      this._atomOpen(pos);
    }
  }

  _atomOpen(pos) {
    atom.open({ pathsToOpen: [pos.file + ':' + (pos.line_number + 1)], newWindow: false });
  }
}
