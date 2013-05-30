/**
 * Module dependencies.
 */
var sockjs = require('sockjs')
  , express = require('express')
  , gzip = require('connect-gzip')
  , cons = require('consolidate')
  , swig = require('swig')
  , http = require('http')
  , fs = require('fs');

var Watcher = require('./watcher');
var utils = require('./utils');

module.exports = function(options, cfg, cb) {
  // Setup express application
  var app = express();
  app.use(express.static(cfg.STATIC_ROOT));
  app.use(express.logger('dev'));
  app.use(express.favicon());
  app.engine('.swig', cons.swig);
  app.engine('.ejs', cons.ejs);
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

  // page
  app.get('/:page.:ext', renderPage);
  app.get('/:page', renderPage);
  app.get('/', renderPage);
  // page layout
  app.get('/:page/:layout.:ext', renderPage);
  app.get('/:page/:layout', renderPage);

  function renderPage(req, res) {
    var ext = req.param('ext');
    var page = req.param('page');
    var layout = req.param('layout');

    // use default template engine if it
    // isn't provided explicitly
    ext || (ext = cfg.TEMPLATE_ENGINE);
    // use "index" as a page name if it
    // isn't provided explicitly
    page || (page = 'index');

    var tpl = utils.getPageTmplPath(cfg.PAGES_ROOT, ext, page, layout);

    loadAssets(page, function(err, assets) {
      var data = assets.mocks;
      data.production = false;
      data.assets = assets;
      data.page = page;

      try {
        res.render(tpl, data);
      } catch(err) {
        res.end('404');
      }
    });
  }

  function loadAssets(page, cb) {
    if (options.production) {
      loadProdAssets(page, cb);
    } else {
      loadDevAssets(page, cb);
    }
  }

  function loadDevAssets(page, cb) {
    utils.loadDevAssets(
      utils.getCmnAssetsPath(cfg.PAGES_ROOT)
    , utils.getPageAssetsPath(cfg.PAGES_ROOT, page)
    , utils.getPageMocksPath(cfg.PAGES_ROOT, page)
    , cb);
  }

  function loadProdAssets(page, cb) {
    utils.loadJSON(cfg.VERSION_FILE, function(err, version) {
      utils.loadProdAssets({
        'assets': cfg.ASSETS_MAP_FILE
      , 'images': cfg.IMAGES_MAP_FILE
      }, cb);
    });
  }

  // Start env http server
  server.listen(options.port, options.host, cb);
};