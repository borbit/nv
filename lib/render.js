var path = require('path');
var cons = require('consolidate');
var utils = require('./utils');
var cfg = utils.loadConfig();

/**
 *
 */
module.exports = function(page, layout, production, cb) {
  // Consider layout is not passed if
  // length of arguments is 3
  if (arguments.length == 3) {
    cb = production;
    production = layout;
    layout = null;
  }

  var tpl = utils.getPageTmplPath(page, layout);

  if (production) {
    loadProdAssets(page, onload);
  } else {
    loadDevAssets(page, onload);
  }

  function onload(err, data) {
    if (err) return cb(err);
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