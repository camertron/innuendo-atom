'use babel'

import request from 'request'

export default class IdentifierHighlighter {
  constructor() {
    this.markerGroups = [];
  }

  highlightInEditor(editor) {
    let response = new Promise((resolve, reject) => {
      let options = { url: 'http://localhost:8080/tokenize/identifiers', qs: { code: editor.getText() } };

      request(options, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          resolve(body);
        } else {
          reject({});
        }
      })
    });

    response.then((body) => {
      let identifiers = JSON.parse(body).identifiers;
      let markers = [];

      for (identifier of identifiers) {
        let startPoint = editor.getBuffer().positionForCharacterIndex(identifier.start_offset);
        let endPoint   = editor.getBuffer().positionForCharacterIndex(identifier.end_offset);
        let marker = editor.markBufferRange([startPoint.toArray(), endPoint.toArray()]);
        markers.push(marker);
      }

      this.markerGroups.push(markers);

      for (marker of markers) {
        editor.decorateMarker(marker, { type: 'highlight', class: 'innuendo identifier' });
      }

      let editorView = atom.views.getView(editor);
      editorView.classList.add('innuendo');
      editorView.classList.add('identifier');
    });
  }

  removeHighlights() {
    for (markerGroup of this.markerGroups) {
      for (marker of markerGroup) {
        marker.destroy();
      }
    }

    this.markerGroups = [];
  }
}
