var async = require('async')
  , path = require('path')
  , fs = require('fs');

var utils = module.exports;
var cwd = process.cwd();

/**
 *
 */
utils.getCmnAssetsPath = function(rootPath) {
  return path.join(rootPath, 'cmn.json');
};

utils.getPageAssetsPath = function(rootPath, page) {
  return path.join(rootPath, page, page + '.json');
};

utils.getPageMocksPath = function(rootPath, page) {
  return path.join(rootPath, page, page + '.mocks');
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
utils.loadDevAssets = function(assetsCmnPath, assetsPagePath, mocksPagePath, cb) {
  utils.loadJSON(assetsCmnPath, function(err, assetsCmn) {
    utils.loadJSON(assetsPagePath, function(err, assetsPage) {
      utils.loadMocks(mocksPagePath, function(err, mocks) {
        cb(null, {page: assetsPage, cmn: assetsCmn, mocks: mocks})
      });
    });
  });
};

/**
 *
 */
utils.loadFlattenDevAssets = function(assetsCmnPath, assetsPagePath, mocksPagePath, cb) {
  utils.loadJSON(assetsCmnPath, function(err, assetsCmn) {
    utils.loadJSON(assetsPagePath, function(err, assetsPage) {
      utils.loadJSON(mocksPagePath, function(err, mocksList) {
        var res = [];
        res = res.concat(utils.flattenAssets(assetsCmn));
        res = res.concat(utils.flattenAssets(assetsPage));
        res = res.concat(utils.flattenMocks(mocksList));
        cb(null, res);
      });
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
utils.loadMocks = function(filePath, cb) {
  var mocks = {};
  utils.loadJSON(filePath, function(err, list) {
    async.forEach(Object.keys(list), function(name, cb) {
      var file = path.join(cwd, list[name]);
      utils.loadJSON(file, function(err, mock) {
        mocks[name] = mock;
        cb();
      });
    }, function(err) {
      cb(null, mocks);
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
      try {
        json = JSON.parse(cont);
      } catch (err) {
        return cb(err);
      }
    }
    cb(null, json);
  });
};

/**
 *
 */
utils.flattenAssets = function(assets) {
  var res = [];
  for (var i in assets) {
    assets[i].forEach(function(asset) {
      res.push(path.join(cwd, asset));
    });
  }
  return res;
};

/**
 *
 */
utils.flattenMocks = function(mocks) {
  var res = [];
  for (var i in mocks) {
    res.push(path.join(cwd, mocks[i]));
  }
  return res;
};
