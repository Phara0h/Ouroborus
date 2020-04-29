module.exports = async (req, res) => {
  return new Promise((resolve, reject) => {
    const headers =  req.headers;
    const contentType = headers['Content-Type'] || headers['content-type'];

    res.finished = false;
    res.onAborted(() => {
      res.finished = true;
      resolve();
    });

    var buffer;
    res.onData((bytes, isLast) => {
      // no longer have access to native req functions in this scope??

      const chunk = Buffer.from(bytes);
      if (isLast) {
        if (!buffer) {
          buffer = chunk;
        }

        if(contentType === 'application/json') {
          req.body = JSON.parse(buffer.toString());
        }
        else if(contentType === 'text/plain'){
          req.body = buffer.toString();
        }
        else {
          req.body = buffer;
        }
        if (!res.finished) {
          resolve();
        }
      } else {
        if (buffer) {
          buffer = Buffer.concat([buffer, chunk]);
        } else {
          buffer = chunk;
        }
      }
    });
  });
};
