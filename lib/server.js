/**
 * Module dependencies.
 */
var express = require('express')
  , cons = require('consolidate')
  , swig = require('swig')
  , path = require('path')
  , fs = require('fs');

module.exports = function(port, host, cfg, cb) {
  var app = express();
  app.engine('.html', cons.swig);
  app.set('view engine', 'html');
  app.set('views', 'views');

  swig.init({
    allowErrors: true
  , tags: require('./tags')
  , root: cfg.PAGES_ROOT
  , cache: false
  });

  app.get('/:name.html', function(req, res) {
    var name = req.param('name');

    var assetsCmnPath  = path.join(cfg.PAGES_ROOT, 'cmn.json');
    var assetsPagePath = path.join(cfg.PAGES_ROOT, name, name + '.json');
    var templatePath   = path.join(cfg.PAGES_ROOT, name, name + '.html');

    json(assetsCmnPath, function(err, assetsCmn) {
      json(assetsPagePath, function(err, assetsPage) {
        var assets = {
          page: assetsPage
        , cmn: assetsCmn
        };
        res.render(templatePath, {
          assets: assets
        , title: name
        });
      });
    });
  });

  app.listen(port, host, cb);
};

function json(file, cb) {
  fs.readFile(file, function(err, cont) {
    var json = {};
    if (cont && cont.length) {
      json = JSON.parse(cont);
    }
    cb(null, json);
  });
}