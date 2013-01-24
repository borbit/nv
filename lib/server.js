/**
 * Module dependencies.
 */
var sockjs = require('sockjs')
  , express = require('express')
  , cons = require('consolidate')
  , swig = require('swig')
  , http = require('http');

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
      staticPath: cfg.STATIC_ROOT
    , pagesPath: cfg.PAGES_ROOT
    });

    io.on('connection', function(conn) {
      conn.on('data', function(message) {
        message = JSON.parse(message);

        if (message.type == 'watch') {
          watcher.bind(conn, message.url);
        }
      });
    });

    io.installHandlers(server, {
      prefix: '/io'
    });
  }

  app.get('/:page.:ext', renderPage);
  app.get('/:page/:layout.:ext', renderPage);

  function renderPage(req, res) {
    var ext = req.param('ext');
    var page = req.param('page');
    var layout = req.param('layout');

    var tpl = utils.getPageTmplPath(cfg.PAGES_ROOT, ext, page, layout);

    loadAssets(page, function(err, assets) {
      try {
        res.render(tpl, {
          production: false
        , assets: assets
        , title: page
        });
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