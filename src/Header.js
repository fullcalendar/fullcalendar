
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
			element = $("<table class='fc-header'/>")
				.append($("<tr/>")
					.append($("<td class='fc-header-left'/>")
						.append(renderSection(sections.left)))
					.append($("<td class='fc-header-center'/>")
						.append(renderSection(sections.center)))
					.append($("<td class='fc-header-right'/>")
						.append(renderSection(sections.right))));
			return element;
		}
	}
	
	
	function destroy() {
		element.remove();
	}
	
	
	function renderSection(buttonStr) {
		if (buttonStr) {
			var tr = $("<tr/>");
			$.each(buttonStr.split(' '), function(i) {
				if (i > 0) {
					tr.append("<td><span class='fc-header-space'/></td>");
				}
				var prevButton;
				$.each(this.split(','), function(j, buttonName) {
					if (buttonName == 'title') {
						tr.append("<td><h2 class='fc-header-title'>&nbsp;</h2></td>");
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
							if (prevButton) {
								prevButton.addClass(tm + '-no-right');
							}
							var button;
							var icon = options.theme ? smartProperty(options.buttonIcons, buttonName) : null;
							var text = smartProperty(options.buttonText, buttonName);
							if (icon) {
								button = $("<div class='fc-button-" + buttonName + " ui-state-default'>" +
									"<a><span class='ui-icon ui-icon-" + icon + "'/></a></div>");
							}
							else if (text) {
								button = $("<div class='fc-button-" + buttonName + " " + tm + "-state-default'>" +
									"<a><span>" + text + "</span></a></div>");
							}
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
									.appendTo($("<td/>").appendTo(tr));
								if (prevButton) {
									prevButton.addClass(tm + '-no-right');
								}else{
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
			return $("<table/>").append(tr);
		}
	}
	
	
	function updateTitle(html) {
		element.find('h2.fc-header-title')
			.html(html);
	}
	
	
	function activateButton(buttonName) {
		element.find('div.fc-button-' + buttonName)
			.addClass(tm + '-state-active');
	}
	
	
	function deactivateButton(buttonName) {
		element.find('div.fc-button-' + buttonName)
			.removeClass(tm + '-state-active');
	}
	
	
	function disableButton(buttonName) {
		element.find('div.fc-button-' + buttonName)
			.addClass(tm + '-state-disabled');
	}
	
	
	function enableButton(buttonName) {
		element.find('div.fc-button-' + buttonName)
			.removeClass(tm + '-state-disabled');
	}


}
