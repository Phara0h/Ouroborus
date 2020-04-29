module.exports = ((config, Ouroborus) => {
  const router = require('find-my-way')();
  const HTTPRequest = require('./HTTPRequest.js');
  const HTTPResponse = require('./HTTPResponse.js');
  const REQUEST_EVENT = 'request'
  let handler = (req, res) => {
    res.statusCode = 404
    res.statusMessage = 'Not Found'
    res.end()
  }
  const OuroborusServer = Ouroborus.App(config.server || {}).any('/*', (res, req) => {
    res.finished = false
    res.onAborted(() => {
      res.finished = true
    })

    const reqWrapper = new HTTPRequest(req)
    const resWrapper = new HTTPResponse(res, OuroborusServer, config)
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

  return facade;
});
