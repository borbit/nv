var path = require('path');
var c = module.exports;

// nv
c.PAGES_ROOT      = process.env.PAGES_ROOT      || path.join(__dirname, 'pages');
c.STATIC_ROOT     = process.env.STATIC_ROOT     || __dirname;
c.TEMPLATE_ENGINE = process.env.TEMPLATE_ENGINE || '<%=engine%>';

// nv-pack & production
c.TEMPS_ROOT      = process.env.TEMPS_ROOT      || '/tmp';
c.DISTS_ROOT      = process.env.DISTS_ROOT      || path.join(__dirname, 'dists');
c.VERSION_FILE    = process.env.VERSION_FILE    || path.join(c.DISTS_ROOT, 'version.json');
c.ASSETS_MAP_FILE = process.env.ASSETS_MAP_FILE || false;
c.IMAGES_MAP_FILE = process.env.IMAGES_MAP_FILE || false;
c.ASSETS_HOSTS    = process.env.ASSETS_HOSTS    || '';

// locales
c.LOCALE_DEFAULT  = process.env.LOCALE_DEFAULT || 'en';
c.LOCALES_ROOT    = process.env.LOCALES_ROOT   || path.join(__dirname, 'i18n');
c.LOCALES         = ['en']