/**
 * Module dependencies.
 */
var sockjs = require('sockjs')
  , express = require('express')
  , gzip = require('connect-gzip')
  , render = require('./render')
  , utils = require('./utils')
  , http = require('http');

module.exports = function(op, cb) {
  // Setup express application
  var app = express();
  var cfg = utils.loadConfig();

  app.use(express.static(cfg.STATIC_ROOT));
  app.use(express.logger('dev'));
  app.use(express.favicon());
  app.set('views', 'views');

  // Gzip static files on the fly
  // in the production mode
  if (op.production) {
    app.use(gzip.staticGzip(cfg.STATIC_ROOT));
  }
  
  // Setup native http server passing the
  // express app instance as a requests listener
  var server = http.createServer(app);

  // Setup SockJS server for "live reload" feature
  // for the development state
  if (!op.production) {
    var watch = require('./watch');
    var io = sockjs.createServer();

    io.on('connection', function(conn) {
      conn.on('data', function(message) {
        var message = JSON.parse(message);

        if (message.type == 'watch') {
          message.url == '/' && (message.url = '/index');
          watch(conn, message.url);
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

  function renderPage(req, res, next) {
    var page = req.param('page');
    var layout = req.param('layout');

    render(page || 'index', layout, op.production, function(err, html) {
      if (err) return next(err);
      res.end(html);
    });
  }

  // Start env http server
  server.listen(op.port, op.host, cb);
};