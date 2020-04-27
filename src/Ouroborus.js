/*
 * Authored by Phara0h, 2020.
 * Intellectual property of third-party.

 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

 *     http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
module.exports = ((config = {}) => {
  try {
    const REQUEST_EVENT = 'request'
    const Ouroborus = require('./Ouroborus_' + process.platform + '_' + process.arch + '_' + process.versions.modules + '.node');
    if (process.env.EXPERIMENTAL_FASTCALL) {
      process.nextTick = (f, ...args) => {
        Promise.resolve().then(() => {
          f(...args);
        });
      };
    }
    const router = require('find-my-way')();
    let handler = (req, res) => {
      res.statusCode = 404
      res.statusMessage = 'Not Found'
      res.end()
    }
    const OuroborusServer = Ouroborus.App(config).any('/*', (res, req) => {
      res.finished = false
      res.onAborted(() => {
        res.finished = true
      })

      const reqWrapper = new HttpRequest(req)
      const resWrapper = new HttpResponse(res, OuroborusServer)
      const method = reqWrapper.method
      if (method !== 'GET' && method !== 'HEAD') {
        let buffer;
        res.onData((bytes, isLast) => {
          const chunk = Buffer.from(bytes)
          if (isLast) {
            if (!buffer) {
              buffer = chunk;
            }
            reqWrapper.body = buffer
            if (!res.finished) {
              handler(reqWrapper, resWrapper);
            }
          } else {
            if (buffer) {
              buffer = Buffer.concat([buffer, chunk])
            } else {
              buffer = chunk
            }
          }
        })
      } else if (!res.finished) {
        handler(reqWrapper, resWrapper);
      }
    })
    OuroborusServer._date = new Date().toUTCString()
    const timer = setInterval(() => (OuroborusServer._date = new Date().toUTCString()), 1000)

    class HttpRequest {
      constructor(uRequest) {
        const q = uRequest.getQuery();
        const uRequestKeys = Object.keys(uRequest);
        this.req = uRequest;
        this.url = uRequest.getUrl() + (q ? '?' + q : '');
        this.method = uRequest.getMethod().toUpperCase();
        this.body = null;
        this.headers = {};
        for (var i = 0, len = uRequestKeys.length; i < len; i++) {
          this.headers[uRequestKeys[i]] = uRequest[uRequestKeys[i]];
        }
      }
      getRaw() {
        return this.req
      }
    }
    class HttpResponse {
      constructor(uResponse, OuroborusServer) {
        this.res = uResponse
        this.server = OuroborusServer
        this.statusCode = 200
        this.statusMessage = 'OK'
        this.headers = {}
        this.headersSent = false
      }
      setHeader(name, value) {
        this.headers[name] = String(value)
      }
      getHeaderNames() {
        return Object.keys(this.headers)
      }
      getHeaders() {
        return Object.freeze(this.headers);
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
    process.on('exit', Ouroborus.free);

    const facade = {
      on(event, cb) {
        if (event !== REQUEST_EVENT) throw new Error(`Given "${event}" event is not supported!`)
        handler = cb
      },
      close() {
        clearInterval(timer)
        Ouroborus.us_listen_socket_close(OuroborusServer._socket)
      }
    }

    facade.listen = facade.start = (port, cb) => {
      OuroborusServer.listen(port, socket => {
        OuroborusServer._socket = socket
        cb(socket)
      })
    }
    facade.on('request', (req, res) => {
      router.lookup(req, res)
    })
    facade.route = router;
    return facade
  } catch (e) {
    throw new Error('This version of Ouroborus is not compatible with your Node.js build:\n\n' + e.toString());
  }
});
