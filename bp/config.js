var path = require('path');
var c = module.exports;

// nv
c.PAGES_ROOT      = process.env.PAGES_ROOT      || path.join(__dirname, 'pages');
c.STATIC_ROOT     = process.env.STATIC_ROOT     || __dirname;
c.TEMPLATE_ENGINE = process.env.TEMPLATE_ENGINE || '<%=engine%>';
c.ENV             = process.env.NODE_ENV        || 'development';

// nv && production
c.ASSETS_HOST     = process.env.ASSETS_HOST     || '';

// nv-pack & production
c.TEMPS_ROOT      = process.env.TEMPS_ROOT      || '/tmp';
c.DISTS_ROOT      = process.env.DISTS_ROOT      || path.join(__dirname, 'dists');
c.VERSION_FILE    = process.env.VERSION_FILE    || path.join(__dirname, 'dists', 'version.json');
c.ASSETS_MAP_FILE = process.env.ASSETS_MAP_FILE || false;
c.IMAGES_MAP_FILE = process.env.IMAGES_MAP_FILE || false;

// languages, off by default
c.LANGUAGES         = false;
c.LANGUAGE_DEFAULT  = process.env.LANGUAGE_DEFAULT || 'en';
c.LANGUAGES_LIST    = ['en']