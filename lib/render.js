var path = require('path');
var cons = require('consolidate');
var moment = require('moment');
var i18n = require('i18n');

var nv = require('./nv');
var config = nv.config;

/**
 * 
 */
module.exports = function(page, layout, data, prod, cb) {
  // render(page, prod, cb)
  if (arguments.length == 3) {
    cb = data;
    prod = layout;
    layout = null;
    data = {};
  }
  // render(page, data, prod, cb)
  // render(page, layout, prod, cb)
  if (arguments.length == 4) {
    cb = prod;
    prod = data;
    if (typeof layout === 'string' ||
        typeof layout === 'undefined') {
      data = {};
    } else {
      data = layout;
      layout = null;
    }
  }

  var tpl = nv.getPageTmplPath(page, layout);

  if (prod) {
    loadProdAssets(page, onload);
  } else {
    loadDevAssets(page, onload);
  }

  function onload(err, assets) {
    if (err) return cb(err);
    for (var i in data) {
      assets[i] = data[i];
    }

    assets.moment = moment;
    assets.__n = i18n.__n;
    assets.__ = i18n.__;
    
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
    
    data.host = path.relative(process.cwd(), host);
    data.production = true;
    data.assets = assets.assets;
    data.page = page;

    delete assets.mocks;

    cb(null, data);
  });
}