/*
 * FullCalendar Google Calendar Extension
 *
 * Copyright (c) 2009 Adam Shaw
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 */

(function($) {

	$.fullCalendar.gcalFeed = function(feedUrl, options) {
		
		feedUrl = feedUrl.replace(/\/basic$/, '/full');
		options = options || {};
		
		return function(start, end, callback) {
			$.getJSON(feedUrl + "?alt=json-in-script&callback=?",
				{
					'start-min': $.fullCalendar.formatDate(start, 'u'),
					'start-max': $.fullCalendar.formatDate(end, 'u'),
					'singleevents': true,
					'max-results': 9999
				},
				function(data) {
					var events = [];
					if (data.feed.entry) {
						$.each(data.feed.entry, function(i, entry) {
							var startStr = entry['gd$when'][0]['startTime'],
								start = $.fullCalendar.parseDate(startStr),
								end = $.fullCalendar.parseDate(entry['gd$when'][0]['endTime']),
								allDay = startStr.indexOf('T') == -1,
								classNames = [],
								url;
							$.each(entry.link, function() {
								if (this.type == 'text/html') {
									url = this.href;
								}
							});
							if (allDay) {
								end = new Date(end - 1); // make inclusive
							}
							events.push({
								id: entry['gCal$uid']['value'],
								title: entry['title']['$t'],
								url: url,
								start: $.fullCalendar.parseDate(entry['gd$when'][0]['startTime']),
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