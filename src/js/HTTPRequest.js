/*
 * Authored by Phara0h, 2020.
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
const util = require("util");
class HTTPRequest {
  constructor(ouroReq, ouroRes) {
    this.raw = ouroReq;
    this.body = null;

    this._res = ouroRes;
    this._ip = null;
    this._method = null;
    this._fullUrl = null;
    this._params = null;
    this._query = null;
    this._headers = null;
  }

  get ip() {
    if (!this._ip) {
      try {
        const ip = new Uint8Array(this._res.getRemoteAddress());
        this._ip = "";
        for (var i = 12, len = ip.length; i < len; i++) {
          if (i === len) {
            this._ip += ip[i];
          } else {
            this._ip += ip[i] + ".";
          }
        }
      } catch (e) {
        this._ip = "255.255.255.255";
      }
    }
    return this._ip;
  }

  get method() {
    if (!this._method) {
      this._method = this.raw.getMethod();
    }
    return this._method;
  }
  get url() {
    if (!this._fullUrl) {
      this._fullUrl = this.raw.getFullUrl();
    }
    return this._fullUrl;
  }

  get params() {
    if (!this._params) {
      this._params = this.raw.getParameters();
    }
    return this._params;
  }

  get query() {
    if (!this._query) {
      this._query = {};
      let queryRaw = this.raw.getQuery();
      if (queryRaw) {
        queryRaw = queryRaw.split("&");

        for (var i = 0, len = queryRaw.length; i < len; i++) {
          const split = queryRaw[i].split("=");
          this._query[split[0]] = split[1]; // look into security of this.
        }
      }
    }
    return this._query;
  }

  get headers() {
    if (!this._headers) {
      this._headers = this.raw.getHeaders();
    }
    return this._headers;
  }
  [util.inspect.custom]() {
    return this.toString();
  }
  toJSON() {
    return this.toString();
  }

  toString() {
    return {
      ip: this.ip,
      method: this.method,
      url: this.url,
      params: this.params,
      query: this.query,
      headers: this.headers
    };
  }
}

module.exports = HTTPRequest;
