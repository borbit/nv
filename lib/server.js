/**
 * Module dependencies.
 */
var sockjs = require('sockjs')
  , express = require('express')
  , cons = require('consolidate')
  , async = require('async')
  , swig = require('swig')
  , path = require('path')
  , http = require('http')
  , fs = require('fs');

module.exports = function(port, host, cfg, cb) {
  // Setup express application
  var app = express();
  app.use(express.static(cfg.STATIC_ROOT));
  app.use(express.logger('dev'));
  app.engine('.html', cons.swig);
  app.set('view engine', 'html');
  app.set('views', 'views');

  // Setup swig templates engine
  swig.init({
    allowErrors: true
  , tags: require('./tags')
  , root: cfg.PAGES_ROOT
  , cache: false
  });

  // Setup native http server passing the
  // express app instance as a requests listener
  var server = http.createServer(app);

  // Setup SockJS server for "live reload" feature
  var io = sockjs.createServer();
  io.on('connection', function(conn) {
    conn.on('data', function(message) {
      message = JSON.parse(message);

      if (message.type == 'watch') {
        watchUpdates(conn, message.url);
      }
    });
  });

  io.installHandlers(server, {prefix: '/io'});

  app.get('/:name.html', function(req, res) {
    var name = req.param('name');
    var pathes = getPathes(name);

    loadAssets(pathes, function(err, assets) {
      res.render(pathes.template, {title: name, assets: assets});
    });
  });

  app.get('/:name/:layout.html', function(req, res) {
    var name = req.param('name');
    var layout = req.param('layout');
    var pathes = getPathes(name, layout);

    loadAssets(pathes, function(err, assets) {
      res.render(pathes.template, {title: name, assets: assets});
    });
  });

  // Start env http server
  server.listen(port, host, cb);

  /**
   *
   */
  function loadAssets(pathes, cb) {
    loadJSON(pathes.assetsCmn, function(err, assetsCmn) {
      loadJSON(pathes.assetsPage, function(err, assetsPage) {
        cb(null, {page: assetsPage, cmn: assetsCmn})
      });
    });
  }

  /**
   *
   */
  function flattenAssets(assets) {
    var res = [];

    Object.keys(assets).forEach(function(t) {
      Object.keys(assets[t]).forEach(function(g) {
        assets[t][g].forEach(function(asset) {
          !~res.indexOf(asset) && res.push(asset);
        });
      });
    });

    return res;
  }

  /**
   *
   */
  function getPathes(name, layout) {
    return {
      assetsCmn  : path.join(cfg.PAGES_ROOT, 'cmn.json')
    , assetsPage : path.join(cfg.PAGES_ROOT, name, name + '.json')
    , template   : path.join(cfg.PAGES_ROOT, name, (layout || name) + '.html')
    , layout     : path.join(cfg.PAGES_ROOT, 'layout.html')
    };
  }

  /**
   *
   */
  function loadJSON(filePath, cb) {
    fs.readFile(filePath, function(err, cont) {
      var json = {};
      if (cont && cont.length) {
        json = JSON.parse(cont);
      }
      cb(null, json);
    });
  }

  /**
   *
   */
  function watchUpdates(conn, url) {
    url = url.substr(1);
    url = url.replace('.html', '');
    url = url.split('/');

    var pathes = getPathes(url[0], url[1]);
    var watchers = [];
    var watch = [
      pathes.layout
    , pathes.template
    , pathes.assetsPage
    , pathes.assetsCmn
    ];

    async.waterfall([
      function(cb) {
        loadAssets(pathes, cb);
      },
      function(assets, cb) {
        assets = flattenAssets(assets);
        assets.forEach(function(asset) {
          watch.push(path.join(cfg.STATIC_ROOT, asset));
        });

        getIncludes(pathes.template, cb);
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
    })
  }

  /**
   *
   */
  function getIncludes(tmplPath, cb) {
    var re = /include \"([^\"]+)\"/g;
    
    fs.readFile(tmplPath, 'utf8', function(err, cont) {
      if (err) return cb(null, []);

      var incls = cont.match(re);

      if (!incls) return cb(null, []);
      
      incls = incls.map(function(incl) {
        incl = incl.replace('include "', '');
        incl = incl.replace('"', '');
        return path.resolve(cfg.PAGES_ROOT, incl);
      });

      async.concat(incls, getIncludes, function(err, test) {
        cb(null, incls.concat(test));
      });
    });
  }
};