var nv = require('./lib/nv');

function init(config) {
  /**
   * Extend default config
   */
  for (var i in config) {
    nv.config[i] = config[i];
  }

  var c = nv.config;

  /** 
   * Setup i18n 
   */
  if (c.LOCALES) {
    var i18n = require('i18n');

    i18n.configure({
      locales       : c.LOCALES_LIST
    , defaultLocale : c.LOCALE_DEFAULT
    , directory     : c.LOCALES_ROOT
    , indent        : '  ',
    });
  }
}

module.exports = {
  server : require('./lib/server')
, render : require('./lib/render')
, watch  : require('./lib/watch')
, config : nv.config
, init   : init
};