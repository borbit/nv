var async = require('async')
  , path = require('path')
  , fs = require('fs');

var utils = module.exports;

/**
 *
 */
utils.getCmnAssetsPath = function(rootPath) {
  return path.join(rootPath, 'cmn.json');
};

utils.getPageAssetsPath = function(rootPath, page) {
  return path.join(rootPath, page, page + '.json');
};

utils.getPageTmplPath = function(rootPath, ext, page, layout) {
  return path.join(rootPath, page, (layout || page) + '.' + ext);
};

utils.getLayoutPath = function(rootPath, ext) {
  return path.join(rootPath, 'layout.' + ext);
};

/**
 *
 */
utils.loadDevAssets = function(assetsCmnPath, assetsPagePath, cb) {
  utils.loadJSON(assetsCmnPath, function(err, assetsCmn) {
    utils.loadJSON(assetsPagePath, function(err, assetsPage) {
      cb(null, {page: assetsPage, cmn: assetsCmn})
    });
  });
};

/**
 *
 */
utils.loadProdAssets = function(pathes, cb) {
  utils.loadJSON(pathes.assetsCmn, function(err, assetsCmn) {
    utils.loadJSON(pathes.assetsPage, function(err, assetsPage) {
      cb(null, {page: assetsPage, cmn: assetsCmn})
    });
  });
};

/**
 *
 */
utils.loadJSON = function(filePath, cb) {
  fs.readFile(filePath, function(err, cont) {
    var json = {};
    if (cont && cont.length) {
      json = JSON.parse(cont);
    }
    cb(null, json);
  });
};

/**
 *
 */
utils.flattenAssets = function(assets) {
  var res = [];

  Object.keys(assets).forEach(function(t) {
    Object.keys(assets[t]).forEach(function(g) {
      assets[t][g].forEach(function(asset) {
        !~res.indexOf(asset) && res.push(asset);
      });
    });
  });

  return res;
};