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
 
const HTTPRequest = require('./HTTPRequest.js')
class Interface {
  constructor(Ourobous) {
    this.plugins = [];
    this.body = null;
    this.Ourobous = Ourobous;
  }

  use(fn) {
    this.plugins.push(fn);
  }

  get(...args) {this._routeAdd('get',...args);}
  post(...args) {this._routeAdd('post',...args);}
  head(...args) {this._routeAdd('head',...args);}
  put(...args) {this._routeAdd('put',...args);}
  delete(...args) {this._routeAdd('delete',...args);}
  options(...args) {this._routeAdd('options',...args);}
  trace(...args) {this._routeAdd('trace',...args);}

  _routeAdd(method,path,fn, middleware)  {
    this.Ourobous[method](path, async (req,res)=>{
      const nReq = new HTTPRequest(req,res);

      if(this.plugins.length > 0) {
        for (var i = 0, len = this.plugins.length; i < len; i++) {
          await this.plugins[i](nReq,res);
        }
      }
      if(middleware) {
        await middleware(nReq,res);
      }
      await fn(nReq, res);
    });
  }

  listen(...args) {
    this.Ourobous.listen(...args);
  }
}

module.exports = Interface;
