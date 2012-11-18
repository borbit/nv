/**
 * Module dependencies.
 */
var sockjs = require('sockjs')
  , express = require('express')
  , cons = require('consolidate')
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

  console.log(express.query());

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
    var pathes = getPathes(cfg.PAGES_ROOT, name);

    loadAssets(pathes, function(err, assets) {
      res.render(pathes.template, {title: name, assets: assets});
    });
  });

  // Start env http server
  server.listen(port, host, cb);
};

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
function getPathes(root, name) {
  return {
    assetsCmn:  path.join(root, 'cmn.json')
  , assetsPage: path.join(root, name, name + '.json')
  , template:   path.join(root, name, name + '.html')
  };
}

/**
 *
 */
function loadJSON(file, cb) {
  fs.readFile(file, function(err, cont) {
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

  var pathes = getPathes('pages', url[0]);

  var watcher = fs.watch(pathes.template, {interval: 1000}, function(err) {
    conn.write('reload');
  });

  console.log('watch', pathes.template);
  conn.on('close', function() {
    console.log('close');
    watcher.close();
  })
}