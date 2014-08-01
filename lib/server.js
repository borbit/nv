var sockjs = require('sockjs');
var express = require('express');
var gzip = require('connect-gzip');
var logger = require('morgan');
var render = require('./render');
var http = require('http');
var nv = require('./nv');

module.exports = function(op, cb) {
  var config = nv.config;

  // Setup express application
  var app = express();
  app.use(express.static(config.STATIC_ROOT));
  app.use(logger('dev'));
  app.set('views', 'views');

  // Gzip static files on the fly
  // in the production mode
  if (config.ENV == 'production') {
    app.use(gzip.staticGzip(config.STATIC_ROOT));
  }

  // Setup native http server passing the
  // express app instance as a requests listener
  var server = http.createServer(app);

  // Setup SockJS server for "live reload" feature
  // for the development state
  if (config.ENV != 'production') {
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

    // Set flag in the config that says we
    // ran "watch" server
    config.WATCH = true;

    io.installHandlers(server, {
      prefix: '/io'
    });
  }

  // page
  app.get('/:lang/:page', renderPage);
  app.get('/:page', renderPage);
  app.get('/', renderPage);

  // page layout
  app.get('/:lang/:page/:layout', renderPage);
  app.get('/:page/:layout', renderPage);

  function renderPage(req, res, next) {
    render({
      page   : req.param('page')   || req.query.page || 'index'
    , layout : req.param('layout') || req.query.layout
    , lang   : req.param('lang')   || req.query.lang
    },
    function(err, html) {
      if (err) return next(err);
      res.end(html);
    });
  }

  // Start env http server
  server.listen(op.port, op.host, cb);
};