/*
 * Copyright (c) 2011 Lyconic, LLC.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

//todo should attach reset to changeview method in certain situations

(function ($, undefined) {
  $.fn.limitEvents = function(opts){
    if (opts.constructor === Number) opts = { maxEvents: opts };
    return this.each(function(){
      var limit = new $.fn.limitEvents.constructor($(this));

      $.extend({ maxEvents: 4 }, opts); //defaults
      $(this).fullCalendar('limitEvents', opts);
    });    
  };
  
  $.fn.limitEvents.constructor = function(calendar){
    if (!(this instanceof arguments.callee)) return new arguments.callee(calendar);
    var self = this;
  
    self.calendar = calendar;

    self.calendar.data('fullCalendar').limitEvents = function(opts){
      self.opts = opts;
      self.observers();
      self.increaseHeight(25);
      self.extendCallbacks();
    }
  };  
})(jQuery);

(function ($, undefined) {
  this.observers = function(){
    var self = this;

    $(document).mouseup(function(e){  //deselect when clicking outside of calendar or formbubble
      var $target = $(e.target),
          isFormBubble = $target.parents('.form-bubble').length || $target.hasClass('form-bubble'),
          isInsideOfCalendar = $target.parents('.fc-content').length || $target.hasClass('fc-content');

      if (!isInsideOfCalendar && !isFormBubble) self.calendar.fullCalendar('unselect');
    });

    self.calendar.delegate('.fc-event','mousedown', function(){ //close currently open form bubbles when user clicks an existing event
      $.fn.formBubble.close();
    });
    
    self.calendar.delegate('.fc-button-prev, .fc-button-next', 'click', function(){
      resetEventsRangeCounts();
    });
  };
  
  this.increaseHeight = function(height, windowResized, td){
    var cal = this.calendar,
          cells = td || cal.find('.fc-view-month tbody tr td'),
          fcDayContent = cells.find('.fc-day-content'),
          cellHeight, fcDayContentHeight;
          
    if (windowResized) fcDayContent.height(1);
          
    cellHeight = cells.eq(0).height(),
    fcDayContentHeight = cellHeight - cells.eq(0).find('.fc-day-number').height();
    
    fcDayContent.height(fcDayContentHeight);
  };

  this.extendCallbacks = function(){
    var self = this,
        opt = self.calendar.fullCalendar('getView').calendar.options,
        _eventRender = opt.eventRender,
        _eventDrop = opt.eventDrop,
        _eventResize = opt.eventResize,
        _viewDisplay = opt.viewDisplay,
        _events = opt.events,
        _windowResize = opt.windowResize;

    $.extend(opt, {
        eventRender: function(event, element){
            var currentView = self.calendar.fullCalendar('getView').name,
                dateFormat = (event.allDay) ? 'MM/dd/yyyy' : 'hh:mmtt',
                startDateLink = $.fullCalendar.formatDate(event.start, dateFormat),
                endDateLink = $.fullCalendar.formatDate(event.end, dateFormat),
                maxEvents = self.opts.maxEvents,
                allEvents = self.calendar.fullCalendar('clientEvents'),
                eventDate = $.fullCalendar.formatDate(event.end || event.start,'MM/dd/yy'),
                td, viewMoreButton;
    
            event.element = element;
            event.startDateLink = startDateLink;
            event.endDateLink = endDateLink;
    
            if (currentView === 'month') {
                doEventsRangeCount(event, self.calendar); //add event quantity to range for event and day
                td = getCellFromDate(eventDate, self.calendar);
    
                if (td.data('apptCount') > maxEvents) {
                    if (!td.find('.events-view-more').length) {
                        td.data('viewMore', true);
                        viewMoreButton = $('<div class="events-view-more"><a href="#view-more"><span>View More</span></a></div>')
                        .appendTo(td)
                        .click(function () {
                          var viewMoreClick = self.opts.viewMoreClick;
                          
                            if (viewMoreClick && $.isFunction(viewMoreClick)) self.opts.viewMoreClick();
                            else viewMore(td, self.calendar); //show events in formBubble overlay
                            
                            return false;
                        });
                        
                        if (!td.data('viewMore')) self.increaseHeight(25, false, td);                          
                    }
                    if ($.isFunction(_eventRender)) _eventRender(event, element);
                    return false; //prevents event from being rendered
                }else{
                  td.data('viewMore', false);
                }
            }
            if ($.isFunction(_eventRender)) _eventRender(event, element);
            return true; //renders event
        },
        eventDrop: function (event, dayDelta, minuteDelta, allDay, revertFunc) {
          resetEventsRangeCounts();
          if ($.isFunction(_eventDrop)) _eventDrop(event, dayDelta, minuteDelta, allDay, revertFunc);
        },
        eventResize: function(event){
          resetEventsRangeCounts();
          if ($.isFunction(_eventResize)) _eventResize(event);
        },
        viewDisplay: function(view){
          $.fn.formBubble.close();
          if (view.name !== 'month') resetEventsRangeCounts();
          if ($.isFunction(_viewDisplay)) _viewDisplay(view);
        },
        events: function(start, end, callback) {
          resetEventsRangeCounts();
          if ($.isFunction(_events)) _events(start, end, callback);
        },
        windowResize: function(view){ //fired AFTER events are rendered
          if ($.isFunction(_windowResize)) _windowResize(view);
          self.increaseHeight(25, true);
          resetEventsRangeCounts();
          self.calendar.fullCalendar('render'); //manually render to avoid layout bug
        }
    });
  };
  
  function doEventsRangeCount(event, calInstance){
    var eventStart = event._start,
        eventEnd = event._end || event._start,
        dateRange = expandDateRange(eventStart, eventEnd),
        eventElement = event.element;
    
    $(dateRange).each(function(i){
        var td = getCellFromDate($.fullCalendar.formatDate(dateRange[i],'MM/dd/yy'), calInstance),
                currentCount = (td.data('apptCount') || 0) + 1;

        td.data('apptCount', currentCount);
        
        if (td.data().appointments === undefined) td.data().appointments = [event];
        else td.data().appointments.push(event);
    });
  }
  
  function expandDateRange(start, end){
    var value = new Date(start.getFullYear(), start.getMonth(), start.getDate()),
        values = [];

    end = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    if (value > end) throw "InvalidRange";

    while (value <= end) {
      values.push(value);
      value = new Date(value.getFullYear(), value.getMonth(), value.getDate() + 1);
    }
    
    return values;
  }
  
  function resetEventsRangeCounts(){
    $('.fc-view-month td').each(function(i){
        $(this).find('.events-view-more').remove();
        $.removeData(this, "apptCount");
        $.removeData(this, "appointments");
    });
  }
  
  function viewMore(day, calInstance){
    var appointments = day.data('appointments'),
        elemWidth = day.outerWidth() + 1,
        self = this;
    
    day.formBubble({
      graphics: {
        close: true,
        pointer: false
      },
      offset: {
        x: -elemWidth,
        y: 0
      },
      animation: {
          slide: false,
          speed: 0
      },
      callbacks: {
        onOpen: function(){
          var bubble = $.fn.formBubble.bubbleObject;
          
          bubble.addClass('overlay');
        },
        onClose: function(){
          calInstance.fullCalendar('unselect');
        }
      },
      content: function(){
        var startDate =  getDateFromCell(day, calInstance),
            startDateLabel = startDate.toString("MMM dS"),
            dayValue = parseInt(day.find('.fc-day-number').text()),
            eventList=$('<ul></ul>').prepend('<li><h5>' + startDateLabel + '</h5></li>');
            
        elemWidth = elemWidth - 30;

        $(appointments).each(function(){
            var apptStartDay = parseInt($.fullCalendar.formatDate(this.start,'d')), //should be comparing date instead of day (bug with gray dates) <-- fix
                    apptEndDay = parseInt($.fullCalendar.formatDate(this.end,'d')),
                    event = this.element.clone(false).attr('style', '').css('width', elemWidth);

            if (apptStartDay < dayValue) $(event).addClass('arrow-left');
            if (apptEndDay > dayValue) $(event).addClass('arrow-right');
            
            event.appendTo(eventList).wrap('<li>');
        });
        
        eventList.wrap('<div>');
        return eventList.parent('div').html();
      }
    });
  }
  
  function getCellFromDate(thisDate, calInstance){ //ties events to actual table cells, and also differentiates between "gray" dates and "black" dates
    var start = calInstance.fullCalendar('getView').start,
        end = calInstance.fullCalendar('getView').end,
        td;

    thisDate = Date.parse(thisDate);
            
    td = $('.fc-day-number').filter(function(){
      return $(this).text()===$.fullCalendar.formatDate(thisDate,'d')
    }).closest('td');
            
    if (thisDate < start){ //date is in last month
        td = td.filter(':first');
    }else if (thisDate >= end){  //date is in next month
        td = td.filter(':last');
    }else{ //date is in this month
        td = td.filter(function(){
            return $(this).hasClass('fc-other-month')===false;
        });
    }
    
    return td;
  }
  
  function getDateFromCell(td, calInstance){
    var cellPos = {
        row: td.parent().parent().children().index(td.parent()),
        col: td.parent().children().index(td)
    };

    return calInstance.fullCalendar('getView').cellDate(cellPos);
  }
  
}).call(jQuery.fn.limitEvents.constructor.prototype, jQuery);
