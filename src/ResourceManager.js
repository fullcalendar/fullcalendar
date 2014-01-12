/*
 * Responsible for resources.  Resource source object is anything that provides
 * data about resources.  It can be function, a JSON object or URL to a JSON 
 * feed.
*/


function ResourceManager(options) {
    var t = this;
	
    // exports
    t.fetchResources = fetchResources;

    // local
    var sources = [];  // source array
    var cache;  // cached resources
    
    _addResourceSources(options['resources']);


    /**
     * ----------------------------------------------------------------
     * Categorize and add the provided sources
     * ----------------------------------------------------------------
     */
    function _addResourceSources(_sources) {
        var source = {};
        
        if ($.isFunction(_sources)) {
            // is it a function?
            source = {
                resources: _sources
            };
            sources.push(source);
        } else if (typeof _sources == 'string') {
            // is it a URL string?
            source = {
                url: _sources
            };
            sources.push(source);
        } else if (typeof _sources == 'object') {
            // is it json object?
            for (var i=0; i<_sources.length; i++) {
                var s = _sources[i];
                normalizeSource(s);
                source = {
                    resources: s
                };
                sources.push(source);
            }
        }
    }


    /**
     * ----------------------------------------------------------------
     * Fetch resources from source array
     * ----------------------------------------------------------------
     */
    function fetchResources(useCache, currentView) {
        // if useCache is not defined, default to true
        useCache = typeof useCache !== 'undefined' ? useCache : true;
        
        if (cache != undefined && useCache) {
            // get from cache
            return cache;
        } else {
            // do a fetch resource from source, rebuild cache
            cache = [];
            var len = sources.length;
            for (var i = 0; i < len; i++) {
                var resources = _fetchResourceSource(sources[i], currentView);
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
    function _fetchResourceSource(source, currentView) {
        var resources = source.resources;
       
        if (resources) {
            if ($.isFunction(resources)) {
                return resources();
            }
        } else {
            var url = source.url;
            if (url) {
                var data={};
                if (typeof currentView == 'object') {
                    var startParam = options.startParam;
                    var endParam = options.endParam;
                    if (startParam) {
                        data[startParam] = Math.round(+currentView.visStart / 1000);
                    }
                    if (endParam) {
                        data[endParam] = Math.round(+currentView.visEnd / 1000);
                    }
                }

                $.ajax($.extend({}, source, {
                    data: data,
                    dataType: 'json',
                    cache: false,
                    success: function(res) {
                        res = res || [];
                        resources = res;
                    },
                    error: function() {
                        alert("ajax error getting json from "+url);
                    },
                    async: false  // too much work coordinating callbacks so dumb it down
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
        }else{
            source.className = [];
        }
        var normalizers = fc.sourceNormalizers;
        for (var i=0; i<normalizers.length; i++) {
            normalizers[i](source);
        }
    }
}