var utils = require('./utils')
  , async = require('async')
  , path = require('path')
  , fs = require('fs');

function Watcher(options) {
  this.pagesPath = options.pagesPath;
  this.staticPath = options.staticPath;
}

var proto = Watcher.prototype;

/**
 *
 */
proto.bind = function(conn, url) {
  var ext = path.extname(url);

  url = url.substr(1);
  url = url.replace(ext, '');
  url = url.split('/');
  ext = ext.substr(1);

  var templatePath   = utils.getPageTmplPath(this.pagesPath, ext, url[0], url[1])
    , assetsPagePath = utils.getPageAssetsPath(this.pagesPath, url[0])
    , assetsCmnPath  = utils.getCmnAssetsPath(this.pagesPath);
    
  var watchers = [];
  var watch = [
    templatePath
  , assetsPagePath
  , assetsCmnPath
  ];

  var self = this;

  async.waterfall([
    function(cb) {
      utils.loadDevAssets(assetsCmnPath, assetsPagePath, cb);
    },
    function(assets, cb) {
      assets = utils.flattenAssets(assets);
      assets.forEach(function(asset) {
        watch.push(path.join(self.staticPath, asset));
      });

      self.getIncludes(templatePath, cb);
    },
    function(incls) {
      watch = watch.concat(incls);
      watch.forEach(function(asset) {
        try {
          watchers.push(fs.watch(asset, {interval: 1000}, onUpdate));
        } catch (err) {
          console.error(' error: cannot watch asset %s', asset);
        }
      });
    }
  ]);

  function onUpdate() {
    conn.write(JSON.stringify({
      type: 'reload'
    }));
  }
  
  conn.on('close', function() {
    if (!watchers.length) return;
    watchers.forEach(function(watcher) {
      watcher.close();
    });
    watchers.length = 0;
  });
};

/**
 *
 */
proto.getIncludes = function(tmplPath, cb) {
  var re = /include ([^ ,%]+)/g;
  var self = this;
  
  fs.readFile(tmplPath, 'utf8', function(err, cont) {
    if (err) return cb(null, []);

    var incls = cont.match(re);

    if (!incls) return cb(null, []);
    
    incls = incls.map(function(incl) {
      incl = incl.replace('include ', '');
      incl = incl.split('"').join('');

      if (~incl.indexOf('swig')) {
        return path.resolve(self.pagesPath, incl);
      }
      return path.resolve(path.dirname(tmplPath), incl);
    });

    async.concat(incls, function(include, cb) {
      self.getIncludes(include, cb);
    }, function(err, inner) {
      cb(null, incls.concat(inner));
    });
  });
};

module.exports = Watcher;