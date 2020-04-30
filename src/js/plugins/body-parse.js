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
