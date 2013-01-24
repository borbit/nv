/**
 * Module dependencies.
 */
var path = require('path');

/**
 * Config
 */
var cfg = module.exports;

// Path to the root directory for the "static" staff (blocks, css, js).
cfg.STATIC_ROOT = process.env.STATIC_ROOT || __dirname;

// Path to the root directory for the "pages" staff (assets lists, layouts).
cfg.PAGES_ROOT = process.env.PAGES_ROOT || path.join(__dirname, 'pages');

// Path to the root directory for distribution builds.
cfg.DISTS_ROOT = process.env.DISTS_ROOT || path.join(__dirname, 'dists');

// Path to the root directory for temporary directories used for distribution builds.
cfg.TEMPS_ROOT = process.env.TEMPS_ROOT || '/tmp';

// Path to the file contains version of the latest static distribution.
cfg.VERSION_FILE = process.env.VERSION_FILE || path.join(cfg.DISTS_ROOT, 'version.json');

// Path to the file contains the assets map of the latest static distribution.
// If it is not specified than assets.json will be placed tot the dist directory.
cfg.ASSETS_MAP_FILE = process.env.ASSETS_MAP_FILE || false;

// Path to the file contains the images map of the latest static distribution.
// If it is not specified than images.json will be placed tot the dist directory.
cfg.IMAGES_MAP_FILE = process.env.IMAGES_MAP_FILE || false;

// Assets host url to be used for "background" images in the css build.
cfg.ASSETS_HOSTS = process.env.ASSETS_HOSTS || '';
