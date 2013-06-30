var fs = require('fs');
var path = require('path');
var async = require('async');
var utils = require('./utils');
var cfg = utils.loadConfig();

/**
 *
 */
module.exports = function(conn, url) {
  var ext = path.extname(url);

  url = url.substr(1);
  url = url.replace(ext, '');
  url = url.split('/');
  ext = ext.substr(1);

  ext || (ext = cfg.TEMPLATE_ENGINE);

  var page = url[0];
  var layout = url[1];
  var templatePath   = utils.getPageTmplPath(page, layout)
    , assetsPagePath = utils.getPageAssetsPath(page)
    , mocksPagePath  = utils.getPageMocksPath(page)
    , assetsCmnPath  = utils.getCmnAssetsPath();

  var watchers = [];
  var watch = [
    templatePath
  , assetsPagePath
  , assetsCmnPath
  , mocksPagePath
  ];

  async.waterfall([
    function(cb) {
      utils.loadFlattenDevAssets(page, cb);
    },
    function(assets, cb) {
      watch = watch.concat(assets);
      getIncludes(templatePath, cb);
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
function getIncludes(tmplPath, cb) {
  var re = /include ([^ ,%]+)/g;

  fs.readFile(tmplPath, 'utf8', function(err, cont) {
    if (err) return cb(null, []);

    var incls = cont.match(re);

    if (!incls) return cb(null, []);

    incls = incls.map(function(incl) {
      incl = incl.replace('include ', '');
      incl = incl.split('"').join('');

      if (~incl.indexOf('swig')) {
        return path.resolve(cfg.PAGES_ROOT, incl);
      }
      return path.resolve(path.dirname(tmplPath), incl);
    });

    async.concat(incls, function(include, cb) {
      getIncludes(include, cb);
    }, function(err, inner) {
      cb(null, incls.concat(inner));
    });
  });
};