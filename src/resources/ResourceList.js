
function ResourceList(calendar, options) {
	var t = this;

	// exports
	t.render = render;
	t.destroy = destroy;
	
	// locals
	var element = $([]);
	var tm;
	
	var resources = [];
	
	// Core render function
	function render() {
		tm = options.theme ? 'ui' : 'fc';
		resources = options.resources
		if (resources) {
			element = $("<div class=\"fc-content\" style=\"position: relative; min-height: 1px; padding-bottom: 15px;\"><table  style=\"width: 100%\" cellspacing=\"0\"><tbody><tr>");
				
				
					$.each(resources, function(i, val) {
						element.append(renderResource(val));
						}
					)
			return element;
		}
	}
	
	function destroy() {
		element.remove();
	}
	
	function renderResource(resource) {
		var e = $("<td style=\"width: 127px;\">" +                
                            "<div class=\"fc-event fc-event-skin fc-event-hori fc-corner-left fc-corner-right\" style=\"width: 121px; margin: 0 auto\;background-color: " + resource.color + ";border-color: " + resource.color +";\">" +
                                "<div class=\"fc-event-inner fc-event-skin\" style=\"background-color: " + resource.color + ";border-color: " + resource.color +";\">" +
                                    "<span class=\"fc-event-title\">" + resource.name + "</span>" +
                                "</div>" +
                            "</div>" +
                        "</td>");
						
		return e;
	}
	
	
	function renderSection(position) {
		var e = $("<td class='fc-header-" + position + "'/>");
		var buttonStr = options.header[position];
		if (buttonStr) {
			$.each(buttonStr.split(' '), function(i) {
				if (i > 0) {
					e.append("<span class='fc-header-space'/>");
				}
				var prevButton;
				$.each(this.split(','), function(j, buttonName) {
					if (buttonName == 'title') {
						e.append("<span class='fc-header-title'><h2>&nbsp;</h2></span>");
						if (prevButton) {
							prevButton.addClass(tm + '-corner-right');
						}
						prevButton = null;
					}else{
						var buttonClick;
						if (calendar[buttonName]) {
							buttonClick = calendar[buttonName]; // calendar method
						}
						else if (fcViews[buttonName]) {
							buttonClick = function() {
								button.removeClass(tm + '-state-hover'); // forget why
								calendar.changeView(buttonName);
							};
						}
						if (buttonClick) {
							var icon = options.theme ? smartProperty(options.buttonIcons, buttonName) : null; // why are we using smartProperty here?
							var text = smartProperty(options.buttonText, buttonName); // why are we using smartProperty here?
							var button = $(
								"<span class='fc-button fc-button-" + buttonName + " " + tm + "-state-default'>" +
									"<span class='fc-button-inner'>" +
										"<span class='fc-button-content'>" +
											(icon ?
												"<span class='fc-icon-wrap'>" +
													"<span class='ui-icon ui-icon-" + icon + "'/>" +
												"</span>" :
												text
												) +
										"</span>" +
										"<span class='fc-button-effect'><span></span></span>" +
									"</span>" +
								"</span>"
							);
							if (button) {
								button
									.click(function() {
										if (!button.hasClass(tm + '-state-disabled')) {
											buttonClick();
										}
									})
									.mousedown(function() {
										button
											.not('.' + tm + '-state-active')
											.not('.' + tm + '-state-disabled')
											.addClass(tm + '-state-down');
									})
									.mouseup(function() {
										button.removeClass(tm + '-state-down');
									})
									.hover(
										function() {
											button
												.not('.' + tm + '-state-active')
												.not('.' + tm + '-state-disabled')
												.addClass(tm + '-state-hover');
										},
										function() {
											button
												.removeClass(tm + '-state-hover')
												.removeClass(tm + '-state-down');
										}
									)
									.appendTo(e);
								if (!prevButton) {
									button.addClass(tm + '-corner-left');
								}
								prevButton = button;
							}
						}
					}
				});
				if (prevButton) {
					prevButton.addClass(tm + '-corner-right');
				}
			});
		}
		return e;
	}
}
