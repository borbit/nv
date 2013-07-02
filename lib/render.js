var path = require('path');
var moment = require('moment');
var utils = require('./utils');
var cons = require('consolidate');
var cfg = utils.loadConfig();

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

  var tpl = utils.getPageTmplPath(page, layout);

  if (prod) {
    loadProdAssets(page, onload);
  } else {
    loadDevAssets(page, onload);
  }

  function onload(err, assets) {
    if (err) return cb(err);
    for (var i in assets) {
      data[i] = assets[i];
    }
    data.moment = moment;
    try {
      cons[cfg.TEMPLATE_ENGINE](tpl, data, cb);
    } catch(err) {
      cb(err);
    }
  }
};

/**
 *
 */
function loadDevAssets(page, cb) {
  utils.loadDevAssets(page, function(err, assets) {
    if (err) return cb(err);

    var data = assets.mocks;
    data.production = false;
    data.assets = assets;
    data.page = page;

    cb(null, data);
  });
}

/**
 *
 */
function loadProdAssets(page, cb) {
  utils.loadProdAssets(page, function(err, assets) {
    if (err) return cb(err);

    var data = assets.mocks;
    var host = path.join(cfg.DISTS_ROOT, assets.version);
    
    data.host = path.relative(process.cwd(), host);
    data.production = true;
    data.assets = assets.assets;
    data.page = page;

    cb(null, data);
  });
}