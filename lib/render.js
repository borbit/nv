var path = require('path');
var cons = require('consolidate');
var Gettext = require('node-gettext');
var moment = require('moment');
var async = require('async');
var path = require('path');
var fs = require('fs');

var gt = new Gettext();
var nv = require('./nv');
var config = nv.config;

/**
 * page, layout, data, lang
 */
module.exports = function(op, cb) {
  var tpl = nv.getPageTmplPath(op.page, op.layout);

  if (config.ENV == 'production' || op.prod) {
    loadProdAssets(op.page, onload);
  } else {
    loadDevAssets(op.page, onload);
  }

  function onload(err, assets) {
    if (err) return cb(err);
    
    op.data || (op.data = {});
    for (var i in op.data) {
      assets[i] = op.data[i];
    }

    assets.moment = moment;
    assets.gt = gt;

    if (op.lang || config.LANGUAGES) {
      
      return loadText(assets.assets, function(err) {
        if (err) return cb(err);
        
        assets.lang = op.lang || config.LANGUAGE_DEFAULT;
        gt.textdomain(assets.lang);
        moment.lang(assets.lang);

        render(assets);
      });
    }
    
    render(assets);
  }

  function render(assets) {
    try {
      cons[config.TEMPLATE_ENGINE](tpl, assets, cb);
    } catch(err) {
      cb(err);
    }
  }
};

/**
 *
 */
function loadDevAssets(page, cb) {
  nv.loadDevAssets(page, function(err, assets) {
    if (err) return cb(err);

    var data = assets.mocks;
    data.production = false;
    data.assets = assets;
    data.page = page;

    delete assets.mocks;

    cb(null, data);
  });
}

/**
 *
 */
function loadProdAssets(page, cb) {
  nv.loadProdAssets(page, function(err, assets) {
    if (err) return cb(err);

    var data = assets.mocks;
    var host = path.join(config.DISTS_ROOT, assets.version);
    
    data.host = config.ASSETS_HOST + '/' + path.relative(config.STATIC_ROOT, host);
    data.assets = assets.assets;
    data.production = true;
    data.page = page;

    delete assets.mocks;

    cb(null, data);
  });
}

/**
 *
 */
function loadText(assets, cb) {
  var files = {};

  ['cmn', 'page'].forEach(function(type) {
    if (!assets[type].text) return;

    for (var lang in assets[type].text) {
      files[lang] || (files[lang] = []);
      files[lang] = files[lang].concat(assets[type].text[lang]);
    }
  });

  async.forEach(Object.keys(files), function(lang, cb) {
    async.forEach(files[lang], function(file, cb) {
      var po = path.join(config.STATIC_ROOT, file);
      
      fs.readFile(po, function(err, content) {
        if (err) return cb(err);
        gt.addTextdomain(lang, content);
        cb();
      })
    }, cb);
  }, cb);
}