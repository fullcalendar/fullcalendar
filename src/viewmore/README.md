# _View More Button_ Plugin for [FullCalendar][0]

![fullCalendar.viewMore screenshot](http://dl.dropbox.com/u/18579768/limit_events.png)

This code was written by [Scott Greenfield][1] of [Lyconic][2] to address issue [#304][3].

I was looking at the list of issues for FullCalendar on Google Code, and I realized that, 
out of necessity for a company project, I had solved several of them. Anyway, I figured 
I'd start with the most "starred" enhancement, the "view more" button.

## Getting Started

**Dependencies (included in project download):**

* [jQuery](http://jquery.com) (included)
* [jQuery UI](http://jqueryui.com/) (included)
* [FullCalendar](http://arshaw.com/fullcalendar/) (included)
* [DateJS](http://www.datejs.com) (included)
* [jQuery.formBubble](http://github.com/lyconic/formbubble) (included)
* formbubble.css (included)
* viewmore.css (included)

**FullCalendar.viewMore** acts as a wrapper for FullCalendar, so that you can specify a maximum number of events per day. If the events exceed the max, a 'view more' button will be added to the date box.

The simplest way of enabling the plugin is to call `limitEvents` on an initialized fullcalendar that has events set via a function:

    $('#calendar').fullCalendar({
      editable: true,      
      events: function(start, end, callback) {
        $.ajax({
          url: '/test/get-events',
          dataType: 'json',
          success: function(data){
            callback(data);
          }
        });
      }
    });

    $('#calendar').limitEvents(4);

**Note:**  To use the limitEvents plugin with a custom click event handler, do so like this:

    $('#calendar').limitEvents({
      maxEvents: 3,
      viewMoreClick: function(){
        //your code here
      }
    });
    
If you do not require the use of the formBubble overlay, and instead would like add a custom viewMoreClick handler, then this plugin becomes no longer dependent on the formBubble plugin.

That's it! The API isn't finished, and we will be expanding its capabilities in the future, but for now this does what we need.

  [0]: http://arshaw.com/fullcalendar/
  [1]: mailto:jquery.fun@gmail.com
  [2]: http://lyconic.com/about
  [3]: http://code.google.com/p/fullcalendar/issues/detail?id=304

