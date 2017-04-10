'use babel'

import request from 'request';

export default class Client {
  constructor(options = {}) {
    this.rootUrl = options.rootUrl || 'http://localhost:8080';
  }

  tokenizeIdentifiers(code) {
    return this._makeGetRequest(this._getTokenizeUrl(), { code: code });
  }

  define(file, offset) {
    return this._makeGetRequest(this._getDefineUrl(), { file: file, offset: offset });
  }

  _getTokenizeUrl() {
    if (this.tokenizeUrl == null) {
      this.tokenizeUrl = [this.rootUrl, 'tokenize', 'identifiers'].join('/');
    }

    return this.tokenizeUrl;
  }

  _getDefineUrl() {
    if (this.defineUrl == null) {
      this.defineUrl = [this.rootUrl, 'define'].join('/');
    }

    return this.defineUrl;
  }

  _makeGetRequest(url, qs) {
    return new Promise((resolve, reject) => {
      let options = { url: url, qs: qs };

      request(options, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          resolve(JSON.parse(body));
        } else {
          reject({});
        }
      });
    });
  }
}
