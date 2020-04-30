/*
 * Copyright 2020 Phara0h
 * Changes are the diff from uWebSockets.js v17.4.0 (commit 116a85f9668dcb03e7799db06dc8275bc43c0963)
 * to this file.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
const SERVER_FINGERPRINT = `Ouroborus v${require('../package.json').version}`;
class HTTPResponse {
  constructor(ouroResponse, OuroborusServer, config) {
    this.res = ouroResponse;
    this.server = OuroborusServer;
    this.statusCode = 200;
    this.statusMessage = 'OK';
    this.headers = {};
    this.headersSent = false;
    if(config.fingerprint === false) {
      this.headers.Server = SERVER_FINGERPRINT;
    }
  }
  setHeader(name, value) {
    this.headers[name] = String(value)
  }
  getHeaderNames() {
    return Object.keys(this.headers)
  }
  getHeaders() {
    return this.headers;
  }
  getHeader(name) {
    return this.headers[name]
  }
  removeHeader(name) {
    delete this.headers[name]
  }
  write(data) {
    this.res.write(data)
  }
  end(data = '') {
    this.res.writeStatus(`${this.statusCode} ${this.statusMessage}`)
    this.res.writeHeader('Date', this.server._date)
    const headerKeys = Object.keys(this.headers);
    for (var i = 0, len = headerKeys.length; i < len; i++) {
      this.res.writeHeader(headerKeys[i], this.headers[headerKeys[i]]);
    }
    this.headersSent = true
    this.finished = true
    this.res.end(data)
  }
  getRaw() {
    return this.res
  }
}

module.exports = HTTPResponse;
