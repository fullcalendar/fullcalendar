function ResourceManager(options) {
  var t = this;
  // exports
  t.fetchResources = fetchResources;
  t.setResources = setResources;
  t.mutateResourceEvent = mutateResourceEvent;
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
    var resources;

    // if useCache is not defined, default to true
    if (useCache || useCache === undefined || cache === undefined) {
      // do a fetch resource from source, rebuild cache
      cache = [];
      var len = resourceSources.length;
      for (var i = 0; i < len; i++) {
        cache = cache.concat(fetchResourceSource(resourceSources[i], currentView));
      }
    }

    if($.isFunction(options.resourceFilter)) {
      resources = $.grep(cache, options.resourceFilter);
    }
    else {
      resources = cache;
    }

    if($.isFunction(options.resourceSort)) {
      //todo! does it need to copy array first?
      resources.sort(options.resourceSort);
    }

    return resources;
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

  /* Event Modification Math
  -----------------------------------------------------------------------------------------*/


  // Modify the date(s) of an event and make this change propagate to all other events with
  // the same ID (related repeating events).
  //
  // If `newStart`/`newEnd` are not specified, the "new" dates are assumed to be `event.start` and `event.end`.
  // The "old" dates to be compare against are always `event._start` and `event._end` (set by EventManager).
  //
  // Returns an object with delta information and a function to undo all operations.
  //
  function mutateResourceEvent(event, newResources, newStart, newEnd) {
    var oldAllDay = event._allDay;
    var oldStart = event._start;
    var oldEnd = event._end;
    var clearEnd = false;
    var newAllDay;
    var dateDelta;
    var durationDelta;
    var undoFunc;

    // if no new dates were passed in, compare against the event's existing dates
    if (!newStart && !newEnd) {
      newStart = event.start;
      newEnd = event.end;
    }

    // NOTE: throughout this function, the initial values of `newStart` and `newEnd` are
    // preserved. These values may be undefined.

    // detect new allDay
    if (event.allDay != oldAllDay) { // if value has changed, use it
      newAllDay = event.allDay;
    }
    else { // otherwise, see if any of the new dates are allDay
      newAllDay = !(newStart || newEnd).hasTime();
    }

    // normalize the new dates based on allDay
    if (newAllDay) {
      if (newStart) {
        newStart = newStart.clone().stripTime();
      }
      if (newEnd) {
        newEnd = newEnd.clone().stripTime();
      }
    }

    // compute dateDelta
    if (newStart) {
      if (newAllDay) {
        dateDelta = dayishDiff(newStart, oldStart.clone().stripTime()); // treat oldStart as allDay
      }
      else {
        dateDelta = dayishDiff(newStart, oldStart);
      }
    }

    if (newAllDay != oldAllDay) {
      // if allDay has changed, always throw away the end
      clearEnd = true;
    }
    else if (newEnd) {
      durationDelta = dayishDiff(
        // new duration
        newEnd || t.getDefaultEventEnd(newAllDay, newStart || oldStart),
        newStart || oldStart
      ).subtract(dayishDiff(
        // subtract old duration
        oldEnd || t.getDefaultEventEnd(oldAllDay, oldStart),
        oldStart
      ));
    }

    undoFunc = mutateResourceEvents(
      t.clientEvents(event._id), // get events with this ID
      clearEnd,
      newAllDay,
      dateDelta,
      durationDelta,
      newResources
    );

    return {
      dateDelta: dateDelta,
      durationDelta: durationDelta,
      undo: undoFunc
    };
  }


  // Modifies an array of events in the following ways (operations are in order):
  // - clear the event's `end`
  // - convert the event to allDay
  // - add `dateDelta` to the start and end
  // - add `durationDelta` to the event's duration
  //
  // Returns a function that can be called to undo all the operations.
  //
  function mutateResourceEvents(events, clearEnd, forceAllDay, dateDelta, durationDelta, newResources) {
    var isAmbigTimezone = t.getIsAmbigTimezone();
    var undoFunctions = [];

    $.each(events, function(i, event) {
      var oldResources = event.resources;
      var oldAllDay = event._allDay;
      var oldStart = event._start;
      var oldEnd = event._end;
      var newAllDay = forceAllDay != null ? forceAllDay : oldAllDay;
      var newStart = oldStart.clone();
      var newEnd = (!clearEnd && oldEnd) ? oldEnd.clone() : null;

      // NOTE: this function is responsible for transforming `newStart` and `newEnd`,
      // which were initialized to the OLD values first. `newEnd` may be null.

      // normlize newStart/newEnd to be consistent with newAllDay
      if (newAllDay) {
        newStart.stripTime();
        if (newEnd) {
          newEnd.stripTime();
        }
      }
      else {
        if (!newStart.hasTime()) {
          newStart = t.rezoneDate(newStart);
        }
        if (newEnd && !newEnd.hasTime()) {
          newEnd = t.rezoneDate(newEnd);
        }
      }

      // ensure we have an end date if necessary
      if (!newEnd && (options.forceEventDuration || +durationDelta)) {
        newEnd = t.getDefaultEventEnd(newAllDay, newStart);
      }

      // translate the dates
      newStart.add(dateDelta);
      if (newEnd) {
        newEnd.add(dateDelta).add(durationDelta);
      }

      // if the dates have changed, and we know it is impossible to recompute the
      // timezone offsets, strip the zone.
      if (isAmbigTimezone) {
        if (+dateDelta || +durationDelta) {
          newStart.stripZone();
          if (newEnd) {
            newEnd.stripZone();
          }
        }
      }

      event.allDay = newAllDay;
      event.start = newStart;
      event.end = newEnd;
      event.resources = newResources;
      backupEventDates(event);

      undoFunctions.push(function() {
        event.allDay = oldAllDay;
        event.start = oldStart;
        event.end = oldEnd;
        event.resources = oldResources;
        backupEventDates(event);
      });
    });

    return function() {
      for (var i=0; i<undoFunctions.length; i++) {
        undoFunctions[i]();
      }
    };
  }
}
