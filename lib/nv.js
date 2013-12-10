var async = require('async');
var path = require('path');
var fs = require('fs');

var nv = module.exports;
var cwd = process.cwd();
var config = nv.config = {
  PAGES_ROOT      : path.join(cwd, 'pages')
, STATIC_ROOT     : path.join(cwd)
, TEMPLATE_ENGINE : 'ejs'
, ENV             : 'development'

, DISTS_ROOT      : path.join(cwd, 'dists')
, VERSION_FILE    : path.join(cwd, 'dists', 'version.json')
, ASSETS_MAP_FILE : false
, IMAGES_MAP_FILE : false
, ASSETS_HOST     : ''

, LOCALES         : false
, LOCALE_DEFAULT  : 'en'
, LOCALES_LIST    : ['en']
};

nv.getCmnAssetsPath = function() {
  return path.join(config.PAGES_ROOT, 'cmn.json');
};

nv.getPageAssetsPath = function(page) {
  return path.join(config.PAGES_ROOT, page, page + '.json');
};

nv.getPageMocksPath = function(page) {
  return path.join(config.PAGES_ROOT, page, page + '.mocks');
};

nv.getPageTmplPath = function(page, layout) {
  return path.join(config.PAGES_ROOT, page, (layout || page) + '.' + config.TEMPLATE_ENGINE);
};

nv.getAssetsFilePath = function(version) {
  return path.join(config.DISTS_ROOT, version, 'assets.json')
};

nv.getImagesFilePath = function(version) {
  return path.join(config.DISTS_ROOT, version, 'images.json')
};

/**
 *
 */
nv.loadPageAssets = function(page, cb) {
  async.series({
    cmn: function(cb) {
      nv.loadJSON(nv.getCmnAssetsPath(), cb);
    },
    page: function(cb) {
      nv.loadJSON(nv.getPageAssetsPath(page), cb);
    },
    mocks: function(cb) {
      nv.loadMocks(nv.getPageMocksPath(page), cb);
    }
  }, cb);
};

/**
 *
 */
nv.loadFlattenPageAssets = function(page, cb) {
  async.series({
    cmn: function(cb) {
      nv.loadJSON(nv.getCmnAssetsPath(), cb);
    },
    page: function(cb) {
      nv.loadJSON(nv.getPageAssetsPath(page), cb);
    },
    mocks: function(cb) {
      nv.loadJSON(nv.getPageMocksPath(page), cb);
    }
  }, function(err, data) {
    if (err) return cb(err);

    var res = [];
    res = res.concat(nv.flattenAssets(data.cmn));
    res = res.concat(nv.flattenAssets(data.page));
    res = res.concat(nv.flattenMocks(data.mocks));
    cb(null, res);
  });
};

/**
 *
 */
nv.loadProdAssets = function(page, cb) {
  nv.loadJSON(config.VERSION_FILE, function(err, version) {
    if (err) return cb(err);

    var assetsFilePath = nv.getAssetsFilePath(version);
    var imagesFilePath = nv.getImagesFilePath(version);

    if (config.ASSETS_MAP_FILE) {
      assetsFilePath = config.ASSETS_MAP_FILE;
    }
    if (config.IMAGES_MAP_FILE) {
      imagesFilePath = config.IMAGES_MAP_FILE;
    }

    async.series({
      assets: function(cb) {
        nv.loadJSON(assetsFilePath, cb);
      },
      images: function(cb) {
        nv.loadJSON(imagesFilePath, cb);
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
nv.loadMocks = function(filePath, cb) {
  var mocks = {};
  nv.loadJSON(filePath, function(err, list) {
    if (err) return cb(err);
    async.forEach(Object.keys(list), function(name, cb) {
      if (typeof list[name] !== 'string') {
        mocks[name] = list[name];
        return cb();
      }
      var file = path.join(config.STATIC_ROOT, list[name]);
      nv.loadJSON(file, function(err, mock) {
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
nv.loadJSON = function(filePath, cb) {
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
nv.flattenAssets = function(assets) {
  var res = [];
  for (var i in assets) {
    assets[i].push && // check if it is an array
    assets[i].forEach(function(asset) {
      res.push(path.join(config.STATIC_ROOT, asset));
    });
  }
  return res;
};

/**
 *
 */
nv.flattenMocks = function(mocks) {
  var res = [];
  for (var i in mocks) {
    if (typeof mocks[i] === 'string') {
      res.push(path.join(config.STATIC_ROOT, mocks[i]));
    }
  }
  return res;
};
