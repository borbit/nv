<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>{{ title | capitalize }}</title>

  <!-- 
  <meta name="apple-mobile-web-app-title" content="title"/>
  <meta name="apple-itunes-app" content="app-id=[app-id]"/>

  <link rel="apple-touch-icon" sizes="144x144" href="apple-touch-icon-144x144.png"/>
  <link rel="apple-touch-icon" sizes="114x114" href="apple-touch-icon-114x114.png"/>
  <link rel="apple-touch-icon" sizes="72x72" href="apple-touch-icon-72x72.png"/>
  <link rel="apple-touch-icon-precomposed" href="apple-touch-icon-57x57.png"/>
  -->

  {% if not production -%}
  {% if assets.cmn.css_base -%}
  <!-- css cmn base -->
  {% for src in assets.cmn.css_base -%}
  <link rel="stylesheet" href="/{{ src }}"/>
  {% endfor -%}
  {% endif -%}

  {% if assets.page.css_base -%}
  <!-- css page base -->
  {% for src in assets.page.css_base -%}
  <link rel="stylesheet" href="/{{ src }}"/>
  {% endfor -%}
  {% endif -%}

  {% if assets.cmn.less_base || assets.page.less_base -%}
  <style type="text/less">
  {% if assets.cmn.includes -%}
    /* less cmn includes */
  {% for src in assets.cmn.includes -%}
    @import "/{{ src }}";
  {% endfor -%}
  {% endif -%}

  {% if assets.cmn.less_base -%}
    /* less cmn base */
  {% for src in assets.cmn.less_base -%}
    @import "/{{ src }}";
  {% endfor -%}
  {% endif -%}

  {% if assets.page.less_base -%}
    /* less page base */
  {% for src in assets.page.less_base -%}
    @import "/{{ src }}";
  {% endfor -%}
  {% endif -%}
  </style>
  {% endif -%}

  {% if assets.cmn.less_ie7 || assets.page.less_ie7 -%}
  <!--[if IE 7]>
  <style type="text/less">
  {% if assets.cmn.includes -%}
    /* less cmn includes */
  {% for src in assets.cmn.includes -%}
    @import "/{{ src }}";
  {% endfor -%}
  {% endif -%}

  {% if assets.cmn.less_ie7 -%}
    /* less cmn ie7 */
  {% for src in assets.cmn.less_ie7 -%}
    @import "/{{ src }}";
  {% endfor -%}
  {% endif -%}

  {% if assets.page.less_ie7 -%}
    /* less page ie7 */
  {% for src in assets.page.less_ie7 -%}
    @import "/{{ src }}";
  {% endfor -%}
  {% endif -%}
  </style>
  <![endif]-->
  {% endif -%}

  {% if assets.cmn.less_ie8 || assets.page.less_ie8 -%}
  <!--[if IE 8]>
  <style type="text/less">
  {% if assets.cmn.includes -%}
    /* less cmn includes */
  {% for src in assets.cmn.includes -%}
    @import "/{{ src }}";
  {% endfor -%}
  {% endif -%}

  {% if assets.cmn.less_ie8 -%}
    /* less cmn ie8 */
  {% for src in assets.cmn.less_ie8 -%}
    @import "/{{ src }}";
  {% endfor -%}
  {% endif -%}

  {% if assets.page.less_ie8 -%}
    /* less page ie8 */
  {% for src in assets.page.less_ie8 -%}
    @import "/{{ src }}";
  {% endfor -%}
  {% endif -%}
  </style>
  <![endif]-->
  {% endif -%}

  {% if assets.cmn.less_ie9 || assets.page.less_ie9 -%}
  <!--[if IE 9]>
  <style type="text/less">
  {% if assets.cmn.includes -%}
    /* less cmn includes */
  {% for src in assets.cmn.includes -%}
    @import "/{{ src }}";
  {% endfor -%}
  {% endif -%}

  {% if assets.cmn.less_ie9 -%}
    /* less cmn ie9 */
  {% for src in assets.cmn.less_ie9 -%}
    @import "/{{ src }}";
  {% endfor -%}
  {% endif -%}

  {% if assets.page.less_ie9 -%}
    /* less page ie9 */
  {% for src in assets.page.less_ie9 -%}
    @import "/{{ src }}";
  {% endfor -%}
  {% endif -%}
  </style>
  <![endif]-->
  {% endif -%}
  {% endif %}
</head>
<body>
  {% block content %}{% endblock %}
  
  {% if not production %}
  <!-- js for the development env -->
  <script src="http://cdn.sockjs.org/sockjs-0.3.min.js"></script>
  <script src="/js/libs/less.js"></script>
  <script src="/js/libs/reload.js"></script>

  {% if assets.cmn.js_base -%}
  <!-- js cmn base -->
  {% for src in assets.cmn.js_base -%}
  <script src="/{{ src }}"></script>
  {% endfor -%}
  {% endif -%}

  {% if assets.page.js_base -%}
  <!-- js page base -->
  {% for src in assets.page.js_base -%}
  <script src="/{{ src }}"></script>
  {% endfor -%}
  {% endif -%}
  
  {% if assets.cmn.js_ie7 || assets.page.js_ie7 -%}
  <!--[if IE 7]>
  {% if assets.cmn.js_ie7 -%}
  <!-- js cmn ie7 -->
  {% for src in assets.cmn.js_ie7 -%}
  <script src="/{{ src }}"></script>
  {% endfor -%}
  {% endif -%}
  {% if assets.page.js_ie7 -%}
  <!-- js page ie7 -->
  {% for src in assets.page.js_ie7 -%}
  <script src="/{{ src }}"></script>
  {% endfor -%}
  {% endif -%}
  <![endif]-->
  {% endif -%}

  {% if assets.cmn.js_ie8 || assets.page.js_ie8 -%}
  <!--[if IE 8]>
  {% if assets.cmn.js_ie8 -%}
  <!-- js cmn ie8 -->
  {% for src in assets.cmn.js_ie8 -%}
  <script src="/{{ src }}"></script>
  {% endfor -%}
  {% endif -%}
  {% if assets.page.js_ie8 -%}
  <!-- js page ie8 -->
  {% for src in assets.page.js_ie8 -%}
  <script src="/{{ src }}"></script>
  {% endfor -%}
  {% endif -%}
  <![endif]-->
  {% endif -%}

  {% if assets.cmn.js_ie9 || assets.page.js_ie9 -%}
  <!--[if IE 9]>
  {% if assets.cmn.js_ie9 -%}
  <!-- js cmn ie9 -->
  {% for src in assets.cmn.js_ie9 -%}
  <script src="/{{ src }}"></script>
  {% endfor -%}
  {% endif -%}
  {% if assets.page.js_ie9 -%}
  <!-- js page ie9 -->
  {% for src in assets.page.js_ie9 -%}
  <script src="/{{ src }}"></script>
  {% endfor -%}
  {% endif -%}
  <![endif]-->
  {% endif -%}
  {% endif %}
</body>
</html>