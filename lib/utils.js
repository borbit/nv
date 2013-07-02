var async = require('async')
  , path = require('path')
  , fs = require('fs');

var utils = module.exports;
var cwd = process.cwd();

utils.loadConfig = function() {
  try {
    return require(path.join(cwd, '/nv'));
  } catch (err) {
    return null;
  }
};

var cfg = utils.loadConfig();

/**
 *
 */
utils.getCmnAssetsPath = function() {
  return path.join(cfg.PAGES_ROOT, 'cmn.json');
};

utils.getPageAssetsPath = function(page) {
  return path.join(cfg.PAGES_ROOT, page, page + '.json');
};

utils.getPageMocksPath = function(page) {
  return path.join(cfg.PAGES_ROOT, page, page + '.mocks');
};

utils.getPageTmplPath = function(page, layout) {
  return path.join(cfg.PAGES_ROOT, page, (layout || page) + '.' + cfg.TEMPLATE_ENGINE);
};

utils.getAssetsFilePath = function(version) {
  return path.join(cfg.DISTS_ROOT, version, 'assets.json')
};

utils.getImagesFilePath = function(version) {
  return path.join(cfg.DISTS_ROOT, version, 'images.json')
};

/**
 *
 */
utils.loadDevAssets = function(page, cb) {
  async.series({
    cmn: function(cb) {
      utils.loadJSON(utils.getCmnAssetsPath(), cb);
    },
    page: function(cb) {
      utils.loadJSON(utils.getPageAssetsPath(page), cb);
    },
    mocks: function(cb) {
      utils.loadMocks(utils.getPageMocksPath(page), cb);
    }
  }, cb);
};

/**
 *
 */
utils.loadFlattenDevAssets = function(page, cb) {
  async.series({
    cmn: function(cb) {
      utils.loadJSON(utils.getCmnAssetsPath(), cb);
    },
    page: function(cb) {
      utils.loadJSON(utils.getPageAssetsPath(page), cb);
    },
    mocks: function(cb) {
      utils.loadJSON(utils.getPageMocksPath(page), cb);
    }
  }, function(err, data) {
    if (err) return cb(err);

    var res = [];
    res = res.concat(utils.flattenAssets(data.cmn));
    res = res.concat(utils.flattenAssets(data.page));
    res = res.concat(utils.flattenMocks(data.mocks));
    cb(null, res);
  });
};

/**
 *
 */
utils.loadProdAssets = function(page, cb) {
  utils.loadJSON(cfg.VERSION_FILE, function(err, version) {
    if (err) return cb(err);

    var assetsFilePath = utils.getAssetsFilePath(version);
    var imagesFilePath = utils.getImagesFilePath(version);
    var mocksFilePath = utils.getPageMocksPath(page);

    if (cfg.ASSETS_MAP_FILE) {
      assetsFilePath = cfg.ASSETS_MAP_FILE;
    }
    if (cfg.IMAGES_MAP_FILE) {
      imagesFilePath = cfg.IMAGES_MAP_FILE;
    }

    async.series({
      assets: function(cb) {
        utils.loadJSON(assetsFilePath, cb);
      },
      images: function(cb) {
        utils.loadJSON(imagesFilePath, cb);
      },
      mocks: function(cb) {
        utils.loadMocks(mocksFilePath, cb);
      }
    }, function(err, data) {
      if (err) return cb(err);
      data.version = version;
      cb(null, data);
    });
  });
};

/**
 *
 */
utils.loadMocks = function(filePath, cb) {
  var mocks = {};
  utils.loadJSON(filePath, function(err, list) {
    if (err) return cb(err);
    async.forEach(Object.keys(list), function(name, cb) {
      var file = path.join(cwd, list[name]);
      utils.loadJSON(file, function(err, mock) {
        if (err) return cb(err);
        mocks[name] = mock;
        cb();
      });
    }, function(err) {
      if (err) return cb(err);
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
    if (err) return cb(null, json);
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
      res.push(path.join(cfg.STATIC_ROOT, asset));
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
