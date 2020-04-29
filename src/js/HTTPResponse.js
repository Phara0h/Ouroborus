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
