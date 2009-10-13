/*!
 * FullCalendar v1.2.3 Google Calendar Extension
 *
 * Visit http://arshaw.com/fullcalendar/docs/#google-calendar
 * for docs and examples.
 *
 * Copyright (c) 2009 Adam Shaw
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Date: 2009-09-21 02:53:03 -0700 (Mon, 21 Sep 2009)
 * Revision: 44
 */
 
(function($) {

	$.fullCalendar.gcalFeed = function(feedUrl, options) {
		
		feedUrl = feedUrl.replace(/\/basic$/, '/full');
		options = options || {};
		var draggable = options.draggable || false;
		
		return function(start, end, callback) {
			$.getJSON(feedUrl + "?alt=json-in-script&callback=?",
				{
					'start-min': $.fullCalendar.formatDate(start, 'c'),
					'start-max': $.fullCalendar.formatDate(end, 'c'),
					'singleevents': true,
					'max-results': 9999
				},
				function(data) {
					var events = [];
					if (data.feed.entry)
						$.each(data.feed.entry, function(i, entry) {
							var url;
							$.each(entry['link'], function(j, link) {
								if (link.type == 'text/html') url = link.href;
							});
							var showTime = entry['gd$when'][0]['startTime'].indexOf('T') != -1;
							var classNames = [];
							if (showTime) {
								classNames.push('nobg');
							}
							if (options.className) {
								if (typeof options.className == 'string') {
									classNames.push(options.className);
								}else{
									classNames = classNames.concat(options.className);
								}
							}
							events.push({
								id: entry['gCal$uid']['value'],
								url: url,
								title: entry['title']['$t'],
								start: $.fullCalendar.parseDate(entry['gd$when'][0]['startTime']),
								end: $.fullCalendar.parseDate(entry['gd$when'][0]['endTime']),
								location: entry['gd$where'][0]['valueString'],
								description: entry['content']['$t'],
								showTime: showTime,
								className: classNames,
								draggable: draggable
							});
						});
					callback(events);
				});
		}
			
	}

})(jQuery);
