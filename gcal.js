/*
 * gcalFullCalendar extension for fullCalendar
 * http://arshaw.com/fullcalendar/
 *
 * Same usage/options as fullCalendar.
 * However, enter your Google Calendar's public feed URL in the 'events' option.
 * Here is how to find it in the Google Calendar interface:
 *
 * -> click the arrow next to your calendar's name
 * -> click "Share this calendar"
 * -> check "Make this calendar public" and then Save
 * -> click the arrow again, then click "Calendar settings"
 * -> in the "Calendar Address" section, click the XML rectangle
 * -> the URL is displayed
 *
 * Copyright (c) 2009 Adam Shaw
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
 
(function($) {

	$.fn.gcalFullCalendar = function(options) {
		
		var feedURL;
		if (options && typeof options.events == 'string') {
			feedURL = options.events;
		}
		else return this.fullCalendar(options);
		
		feedURL = feedURL.replace(/\/basic$/, '/full');
		
		$.extend(options, {
		
			events: function(start, end, callback) {
				$.getJSON(feedURL + "?alt=json-in-script&callback=?",
					{
						'start-min': $.ISO8601String(start),
						'start-max': $.ISO8601String(end),
						'singleevents': true
					},
					function(data) {
						var events = [];
						if (data.feed.entry)
							$.each(data.feed.entry, function(i, entry) {
								var url;
								$.each(entry['link'], function(j, link) {
									if (link.type == 'text/html') url = link.href;
								});
								events.push({
									id: entry['gCal$uid']['value'],
									url: url,
									title: entry['title']['$t'],
									start: $.parseISO8601(entry['gd$when'][0]['startTime'], true),
									end: $.parseISO8601(entry['gd$when'][0]['endTime'], true),
									location: entry['gd$where'][0]['valueString'],
									description: entry['content']['$t'],
									allDay: entry['gd$when'][0]['startTime'].indexOf('T') == -1,
									draggable: false
								});
							});
						callback(events);
					});
			},
			
			eventRender: function(event, element) {
				if (!event.allDay) element.addClass('nobg');
			}
			
		});
		
		return this.fullCalendar(options);
	};

})(jQuery);
