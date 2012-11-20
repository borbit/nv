/**
 * Module dependencies.
 */
 var path = require('path');

/**
 * Config
 */
var cfg = module.exports;

// Root directory path of the "static" staff (blocks, css, js).
cfg.STATIC_ROOT = process.env.STATIC_ROOT || __dirname;

// Root directory path "pages" staff (assets lists, layouts).
cfg.PAGES_ROOT = process.env.PAGES_ROOT || path.join(__dirname, 'pages');

// Root directory path of distributions builds.
cfg.DISTS_ROOT = process.env.DISTS_ROOT || path.join(__dirname, 'dists');

// Root directory path for temporary directories used for distributions builds.
cfg.TEMPS_ROOT = process.env.TEMPS_ROOT || '/tmp';

// Path to the file contains the latest version of static distribution.
cfg.VERSION_FILE = process.env.VERSION_FILE || path.join(__dirname, '/../version.json');

// Path to the file contains the latest assets map of static distribution.
cfg.MAP_FILE = process.env.MAP_FILE || path.join(__dirname, '/../map.json');

//Assets host url to be used for "background" images in the css build.
cfg.ASSETS_HOSTS = process.env.ASSETS_HOSTS || 'http://media.modnakasta.ua/site_media/static/';
