'use babel'

import Client from './client';
import { Emitter } from 'atom';

// require these manually since arrive is a jQuery plugin
$ = jQuery = require('jQuery');
require('arrive');

export default class IdentifierHighlighter {
  constructor(editor) {
    this.client = new Client();
    this.editor = editor;
    this.editorView = atom.views.getView(editor);
    this.markers = {};
    this.emitter = new Emitter();
  }

  highlightIdentifiers() {
    let that = this;

    // triggered whenever new elements are added to the .highlights element
    $('.highlights', this.editorView).arrive('.innuendo.identifier', function() {
      let newElem = $(this);
      let classNames = newElem.attr('class').split(' ');
      let markerId = that._markerIdFromClassNames(classNames);

      if (that.markers[markerId] !== undefined) {
        that.markers[markerId].element = newElem;

        // attach functions to highlighted elements here
        newElem.click(function(event) {
          that._onMarkerClick(event, { markerId: markerId, marker: that.markers[markerId] });
        });
      }
    });

    this.client.tokenizeIdentifiers(this.editor.getText()).then((data) => {
      let identifiers = data.identifiers;

      for (identifier of identifiers) {
        let startPoint = this.editor.getBuffer().positionForCharacterIndex(identifier.start_offset);
        let endPoint   = this.editor.getBuffer().positionForCharacterIndex(identifier.end_offset);
        let marker     = this.editor.markBufferRange([startPoint.toArray(), endPoint.toArray()]);
        let decoration = this.editor.decorateMarker(marker, { type: 'highlight', class: 'innuendo identifier marker-' + marker.id });
        this.markers[marker.id] = { marker: marker, decoration: decoration };
      }
    });
  }

  removeHighlights() {
    for (id in this.markers) {
      let marker = this.markers[id];

      marker.marker.destroy();

      // unbind all event handlers
      if (marker.element !== undefined) {
        marker.element.unbind();
      }
    }

    this.markers = {};
    $('.highlights', this.editorView).unbindArrive();
  }

  onMarkerClick(callback) {
    return this.emitter.on('did-marker-click', callback);
  }

  showTooltip(position) {
    // debugger;
    // this.client.define(editor)
    // let tooltip = new SignatureTooltip();
  }

  ////////// PRIVATE //////////

  _onMarkerClick(event, props) {
    let screenPos = this.editorView.component.screenPositionForMouseEvent(event);

    // Cmd/Ctrl-clicking will add a new cursor, which we don't want
    if (this.editor.hasMultipleCursors()) {
      this.editor.getCursorAtScreenPosition(screenPos).destroy();
    }

    this.emitter.emit('did-marker-click', props);
  }

  _markerIdFromClassNames(classNames) {
    let re = /^marker-(\d+)$/;

    for (className of classNames) {
      let match = className.match(re);

      if (match !== null) {
        return parseInt(match[1]);
      }
    }

    return null;
  }
}
