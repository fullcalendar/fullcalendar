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
					'max-results': 1000
				},
				function(data) {
					var events = [];
					if (data.feed.entry)
						$.each(data.feed.entry, function(i, entry) {
							var url;
							$.each(entry['link'], function(j, link) {
								if (link.type == 'text/html') {
									url = link.href;
								}
							});
							var startStr = entry['gd$when'][0]['startTime'];
							var start = $.fullCalendar.parseDate(startStr);
							var end = $.fullCalendar.parseDate(entry['gd$when'][0]['endTime']);
							var allDay = startStr.indexOf('T') == -1;
							var classNames = [];
							if (allDay) {
								end = new Date(end - 1); // make in inclusive
							}else{
								classNames.push('fc-event-nobg');
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
								end: end,
								location: entry['gd$where'][0]['valueString'],
								description: entry['content']['$t'],
								allDay: allDay,
								className: classNames,
								editable: options.editable || false
							});
						});
					callback(events);
				});
		}
			
	}

})(jQuery);
