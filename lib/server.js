/**
 * Module dependencies.
 */
var sockjs = require('sockjs')
  , express = require('express')
  , gzip = require('connect-gzip')
  , swig = require('swig')
  , http = require('http')
  , fs = require('fs');

var Watcher = require('./watcher');
var Renderer = require('./renderer');

module.exports = function(options, cfg, cb) {
  // Setup express application
  var app = express();
  app.use(express.static(cfg.STATIC_ROOT));
  app.use(express.logger('dev'));
  app.use(express.favicon());
  app.set('views', 'views');

  if (options.production) {
    app.use(gzip.staticGzip(cfg.STATIC_ROOT));
  }

  // Setup swig templates engine
  swig.init({
    allowErrors: true
  , root: cfg.PAGES_ROOT
  , cache: false
  });

  // Setup native http server passing the
  // express app instance as a requests listener
  var server = http.createServer(app);

  // Setup SockJS server for "live reload" feature
  // for the development state
  if (!options.production) {
    var io = sockjs.createServer();
    var watcher = new Watcher({
      engine: cfg.TEMPLATE_ENGINE
    , staticPath: cfg.STATIC_ROOT
    , pagesPath: cfg.PAGES_ROOT
    });

    io.on('connection', function(conn) {
      conn.on('data', function(message) {
        var message = JSON.parse(message);

        if (message.type == 'watch') {
          message.url == '/' && (message.url = '/index');
          watcher.bind(conn, message.url);
        }
      });
    });

    io.installHandlers(server, {
      prefix: '/io'
    });
  }

  // Setup renderer
  var renderer = new Renderer({
    pagesRoot: cfg.PAGES_ROOT
  , distsRoot: cfg.DISTS_ROOT
  , assetsMapFile: cfg.ASSETS_MAP_FILE
  , imagesMapFile: cfg.IMAGES_MAP_FILE
  , versionFile: cfg.VERSION_FILE
  });

  // page
  app.get('/:page.:ext', renderPage);
  app.get('/:page', renderPage);
  app.get('/', renderPage);

  // page layout
  app.get('/:page/:layout.:ext', renderPage);
  app.get('/:page/:layout', renderPage);

  function renderPage(req, res, next) {
    var ext = req.param('ext') || cfg.TEMPLATE_ENGINE;
    var page = req.param('page') || 'index';
    var layout = req.param('layout');

    renderer.render(page, layout, ext, function(err, html) {
      if (err) return next(err);
      res.end(html);
    });
  }

  // Start env http server
  server.listen(options.port, options.host, cb);
};