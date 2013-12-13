var path = require('path');
var cons = require('consolidate');
var Gettext = require('node-gettext');
var sprintf = require('sprintf');
var moment = require('moment');
var async = require('async');
var path = require('path');
var fs = require('fs');

var gt = new Gettext();
var nv = require('./nv');
var config = nv.config;
var cache = {};

/**
 * page, layout, data, lang
 */
module.exports = function(op, cb) {
  var tpl = nv.getPageTmplPath(op.page, op.layout);
  var env = op.env || config.ENV;

  if (env == 'production' && op.cacheId && cache[op.cacheId]) {
    return process.nextTick(function() {
      cb(null, cache[op.cacheId]);
    });
  }

  loadAssets(op.page, env, function(err, assets) {
    if (err) return cb(err);
    
    op.data || (op.data = {});
    for (var i in op.data) {
      assets[i] = op.data[i];
    }

    assets.moment = moment;
    assets.config = config;
    
    assets.__n = function(msgid, count) {
      var text = gt.ngettext(msgid, msgid, count);

      if (arguments.length > 2) {
        var args = arguments;
        args = Array.prototype.slice.call(args, 0);
        args.splice(0, 2), args.unshift(text);
        text = sprintf.apply(null, args);
      }

      return text;
    };

    assets.__ = function(msgid) {
      var text = gt.gettext(msgid);

      if (arguments.length > 1) {
        var args = arguments;
        args = Array.prototype.slice.call(args, 0);
        args.shift(), args.unshift(text);
        text = sprintf.apply(null, args);
      }

      return text;
    };

    if (!op.lang && !config.LANGUAGES) {
      return render(assets);
    }
    
    loadText(assets.assets, env, function(err) {
      if (err) return cb(err);
      
      assets.lang = op.lang || config.LANGUAGE_DEFAULT;
      gt.textdomain(assets.lang);
      moment.lang(assets.lang);

      render(assets);
    });
  });

  function render(assets) {
    try {
      cons[config.TEMPLATE_ENGINE](tpl, assets, function(err, html) {
        if (err) return cb(err);
        if (env == 'production' && op.cacheId) {
          cache[op.cacheId] = html;
        }
        cb(null, html)
      });
    } catch(err) {
      cb(err);
    }
  }
};

/**
 *
 */
function loadPageAssets(page, cb) {
  nv.loadPageAssets(page, function(err, assets) {
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
  nv.loadPageAssets(page, function(err, assets) {
    if (err) return cb(err);

    nv.loadProdAssets(page, function(err, prodAssets) {
      if (err) return cb(err);

      // extend assets with prod assets
      assets.images = prodAssets.images;

      for (var p in prodAssets.assets) {
        for (var t in prodAssets.assets[p]) {
          assets[p] || (assets[p] = {});
          assets[p][t] = prodAssets.assets[p][t];
        }
      }

      var data = assets.mocks;
      var host = path.join(config.DISTS_ROOT, prodAssets.version);
      
      data.host = config.ASSETS_HOST + '/' + path.relative(config.STATIC_ROOT, host);
      data.assets = assets;
      data.production = true;
      data.page = page;

      delete assets.mocks;

      cb(null, data);
    });
  });
}

/**
 *
 */
function loadAssets(page, env, cb) {
  if (env == 'production') {
    loadProdAssets(page, cb);
  } else {
    loadPageAssets(page, cb);
  }
}

/**
 *
 */
function loadText(assets, env, cb) {
  var files = {};
  
  ['cmn', 'page'].forEach(function(type) {
    if (!assets[type] || !assets[type].text) return;

    for (var lang in assets[type].text) {
      files[lang] || (files[lang] = []);
      files[lang] = files[lang].concat(assets[type].text[lang]);
    }
  });

  async.forEach(Object.keys(files), function(lang, cb) {
    async.map(files[lang], function(file, cb) {
      var po = path.join(config.STATIC_ROOT, file);
      fs.readFile(po, cb)
    }, function(err, map) {
      if (err) return cb(err);
      gt.addTextdomain(lang, map.join(''));
      cb();
    });
  }, cb);
}