var path = require('path');
var i18n = require('i18n');
var cons = require('consolidate');
var moment = require('moment');

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
    assets.__n = i18n.__n;
    assets.__ = i18n.__;

    try {
      if (op.lang || config.LOCALES) {
        assets.lang = op.lang || config.LOCALE_DEFAULT;
        i18n.setLocale(assets.lang);
        moment.lang(assets.lang);
      }
    } catch (err) {
      return cb(new Error('Cannot load locale "' + assets.lang + '"'))
    }

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
    
    data.host = path.relative(config.STATIC_ROOT, host);
    data.production = true;
    data.assets = assets.assets;
    data.page = page;

    delete assets.mocks;

    cb(null, data);
  });
}