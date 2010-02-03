/*
 * FullCalendar v1.4.4 Google Calendar Extension
 *
 * Copyright (c) 2009 Adam Shaw
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Date: Wed Feb 3 22:56:20 2010 -0800
 *
 */

(function($) {

	$.fullCalendar.gcalFeed = function(feedUrl, options) {
		
		feedUrl = feedUrl.replace(/\/basic$/, '/full');
		options = options || {};
		
		return function(start, end, callback) {
			var params = {
				'start-min': $.fullCalendar.formatDate(start, 'u'),
				'start-max': $.fullCalendar.formatDate(end, 'u'),
				'singleevents': true,
				'max-results': 9999
			};
			var ctz = options.currentTimezone;
			if (ctz) {
				params.ctz = ctz = ctz.replace(' ', '_');
			}
			$.getJSON(feedUrl + "?alt=json-in-script&callback=?", params, function(data) {
				var events = [];
				if (data.feed.entry) {
					$.each(data.feed.entry, function(i, entry) {
						var startStr = entry['gd$when'][0]['startTime'],
							start = $.fullCalendar.parseISO8601(startStr, true),
							end = $.fullCalendar.parseISO8601(entry['gd$when'][0]['endTime'], true),
							allDay = startStr.indexOf('T') == -1,
							url;
						$.each(entry.link, function() {
							if (this.type == 'text/html') {
								url = this.href;
								if (ctz) {
									url += (url.indexOf('?') == -1 ? '?' : '&') + 'ctz=' + ctz;
								}
							}
						});
						if (allDay) {
							$.fullCalendar.addDays(end, -1); // make inclusive
						}
						events.push({
							id: entry['gCal$uid']['value'],
							title: entry['title']['$t'],
							url: url,
							start: start,
							end: end,
							allDay: allDay,
							location: entry['gd$where'][0]['valueString'],
							description: entry['content']['$t'],
							className: options.className,
							editable: options.editable || false
						});
					});
				}
				callback(events);
			});
		}
		
	}

})(jQuery);
