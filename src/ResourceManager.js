function ResourceManager(options) {
  var t = this;
  // exports
  t.fetchResources = fetchResources;
  t.setResources = setResources;

  // locals
  var resourceSources = [];
  var cache;
  // initialize the resources.
  setResources(options.resources);
  // add the resource sources

  function setResources(sources) {
    resourceSources = [];
    var resource;
    if ($.isFunction(sources)) {
      // is it a function?
      resource = {
        resources: sources
      };
      resourceSources.push(resource);
      cache = undefined;
    } else if (typeof sources == 'string') {
      // is it a URL string?
      resource = {
        url: sources
      };
      resourceSources.push(resource);
      cache = undefined;
    } else if (typeof sources == 'object' && sources != null) {
      // is it json object?
      for (var i = 0; i < sources.length; i++) {
        var s = sources[i];
        normalizeSource(s);
        resource = {
          resources: s
        };
        resourceSources.push(resource);
      }
      cache = undefined;
    }
  }
  /**
   * ----------------------------------------------------------------
   * Fetch resources from source array
   * ----------------------------------------------------------------
   */

  function fetchResources(useCache, currentView) {
    // if useCache is not defined, default to true
    useCache = (typeof useCache !== 'undefined' ? useCache : true);
    if (cache !== undefined && useCache) {
      // get from cache
      return cache;
    } else {
      // do a fetch resource from source, rebuild cache
      cache = [];
      var len = resourceSources.length;
      for (var i = 0; i < len; i++) {
        var resources = fetchResourceSource(resourceSources[i], currentView);
        cache = cache.concat(resources);
      }
      return cache;
    }
  }

  /**
   * ----------------------------------------------------------------
   * Fetch resources from each source.  If source is a function, call
   * the function and return the resource.  If source is a URL, get
   * the data via synchronized ajax call.  If the source is an
   * object, return it as is.
   * ----------------------------------------------------------------
   */

  function fetchResourceSource(source, currentView) {
    var resources = source.resources;
    if (resources) {
      if ($.isFunction(resources)) {
        return resources();
      }
    } else {
      var url = source.url;
      if (url) {
        var data = {};
        if (typeof currentView === 'object') {
          var startParam = options.startParam;
          var endParam = options.endParam;
          if (startParam) {
            data[startParam] = Math.round(+currentView.intervalStart / 1000);
          }
          if (endParam) {
            data[endParam] = Math.round(+currentView.intervalEnd / 1000);
          }
        }
        $.ajax($.extend({}, ajaxDefaults, source, {
          data: data,
          dataType: 'json',
          cache: false,
          success: function(res) {
            res = res || [];
            resources = res;
          },
          error: function() {
            // TODO - need to rewrite callbacks, etc.
            //alert("ajax error getting json from " + url);
          },
          async: false // too much work coordinating callbacks so dumb it down
        }));
      }
    }
    return resources;
  }
  /**
   * ----------------------------------------------------------------
   * normalize the source object
   * ----------------------------------------------------------------
   */

  function normalizeSource(source) {
    if (source.className) {
      if (typeof source.className == 'string') {
        source.className = source.className.split(/\s+/);
      }
    } else {
      source.className = [];
    }
    var normalizers = fc.sourceNormalizers;
    for (var i = 0; i < normalizers.length; i++) {
      normalizers[i](source);
    }
  }
}