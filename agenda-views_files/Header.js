
function Header(calendar, options) {
	var t = this;
	
	
	// exports
	t.render = render;
	t.destroy = destroy;
	t.updateTitle = updateTitle;
	t.activateButton = activateButton;
	t.deactivateButton = deactivateButton;
	t.disableButton = disableButton;
	t.enableButton = enableButton;
	
	
	// locals
	var element = $([]);
	var tm;
	


	function render() {
		tm = options.theme ? 'ui' : 'fc';
		var sections = options.header;
		if (sections) {
			element = $("<table class='fc-header' style='width:100%'/>")
				.append(
					$("<tr/>")
						.append(renderSection('left'))
						.append(renderSection('center'))
						.append(renderSection('right'))
				);
			return element;
		}
	}
	
	
	function destroy() {
		element.remove();
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
	
	
	function updateTitle(html) {
		element.find('h2')
			.html(html);
	}
	
	
	function activateButton(buttonName) {
		element.find('span.fc-button-' + buttonName)
			.addClass(tm + '-state-active');
	}
	
	
	function deactivateButton(buttonName) {
		element.find('span.fc-button-' + buttonName)
			.removeClass(tm + '-state-active');
	}
	
	
	function disableButton(buttonName) {
		element.find('span.fc-button-' + buttonName)
			.addClass(tm + '-state-disabled');
	}
	
	
	function enableButton(buttonName) {
		element.find('span.fc-button-' + buttonName)
			.removeClass(tm + '-state-disabled');
	}


}
