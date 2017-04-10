'use babel'

import Client from './client';

export default class IdentifierHighlighter {
  constructor() {
    this.markerGroups = [];
    this.client = new Client();
  }

  highlightInEditor(editor) {
    this.client.tokenizeIdentifiers(editor.getText()).then((data) => {
      let identifiers = data.identifiers;
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
