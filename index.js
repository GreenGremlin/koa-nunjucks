var nunjucks = require("nunjucks");
var _ = require('lodash');

var NJ = function(options) {
  if(!(this instanceof NJ)) {
    return (new NJ(options)).middleware();
  }
  this.extname = options.extname || '.tpl';
  this.nj = nunjucks.configure(options.views, options.nunjucks);
};

NJ.prototype.createRender = function () {
  var self = this;
  return function (view, data) {
    var ctx = this;
    return function (callback) {
      callback = callback || function () {};
      var viewData = _.extend({}, ctx.state, ctx.locals || {}, data);
      self.nj.render(view + self.extname, viewData, function (e, res) {
        if(e) {
          return callback(e);
        }
        ctx.body = res;
        callback(e, res);
      });
    };
  };
};

NJ.prototype.middleware = function(options) {
  var self = this;
  return function*(next) {
    if(!this.render) {
      this.render = self.createRender();
    }
    yield next;
  };
};

module.exports = NJ;
