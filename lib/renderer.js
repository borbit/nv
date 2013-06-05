var cons = require('consolidate');
var utils = require('./utils');

function Renderer(options) {
  this.pagesRoot = options.pagesRoot;
  this.distsRoot = options.distsRoot;
  this.assetsMapFile = options.assetsMapFile;
  this.imagesMapFile = options.imagesMapFile;
  this.versionFile = options.versionFile;
  this.production = options.production;
}

var Proto = Renderer.prototype;

Proto.render = function(page, layout, engine, cb) {
  var tpl = utils.getPageTmplPath(this.pagesRoot, engine, page, layout);

  this.loadPageData(page, function(err, data) {
    if (err) return cb(err);

    try {
      cons[engine](tpl, data, cb);
    } catch(err) {
      cb(err);
    }
  });
};

Proto.loadPageData = function(page, cb) {
  if (this.production) {
    this.loadProdAssets(page, cb);
  } else {
    this.loadDevAssets(page, cb);
  }
};

Proto.loadDevAssets = function(page, cb) {
  utils.loadDevAssets(
    utils.getCmnAssetsPath(this.pagesRoot)
  , utils.getPageAssetsPath(this.pagesRoot, page)
  , utils.getPageMocksPath(this.pagesRoot, page)
  , function(err, assets) {
    if (err) return cb(err);

    var data = assets.mocks;
    data.production = false;
    data.assets = assets;
    data.page = page;
    cb(null, data);
  });
}

Proto.loadProdAssets = function(page, cb) {
  var self = this;

  utils.loadJSON(this.versionFile, function(err, version) {
    var assetsFilePath = utils.getAssetsFilePath(self.distsRoot, version);
    var imagesFilePath = utils.getImagesFilePath(self.distsRoot, version);
    var mocksFilePath = utils.getPageMocksPath(self.pagesRoot, page);

    if (self.assetsMapFile) {
      assetsFilePath = self.assetsMapFile;
    }
    if (self.imagesMapFile) {
      imagesFilePath = self.imagesMapFile;
    }

    utils.loadProdAssets(
      assetsFilePath
    , imagesFilePath
    , mocksFilePath
    , function(err, assets) {
      if (err) return cb(err);

      var data = assets.mocks;
      data.host = '/dists/' + version;
      data.production = true;
      data.assets = assets.assets;
      data.page = page;
      cb(null, data);
    });
  });
};

module.exports = Renderer;