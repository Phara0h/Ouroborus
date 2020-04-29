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
