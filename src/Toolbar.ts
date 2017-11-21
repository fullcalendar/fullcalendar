import * as $ from 'jquery'
import { htmlEscape } from './util'


/* Toolbar with buttons and title
----------------------------------------------------------------------------------------------------------------------*/

export default class Toolbar {

	calendar: any
	toolbarOptions: any
	el: any = null // mirrors local `el`
	viewsWithButtons: any = []


	constructor(calendar, toolbarOptions) {
		this.calendar = calendar
		this.toolbarOptions = toolbarOptions
	}


	// method to update toolbar-specific options, not calendar-wide options
	setToolbarOptions(newToolbarOptions) {
		this.toolbarOptions = newToolbarOptions;
	}


	// can be called repeatedly and will rerender
	render() {
		let sections = this.toolbarOptions.layout
		let el = this.el

		if (sections) {
			if (!el) {
				el = this.el = $("<div class='fc-toolbar " + this.toolbarOptions.extraClasses + "'/>");
			}
			else {
				el.empty();
			}
			el.append(this.renderSection('left'))
				.append(this.renderSection('right'))
				.append(this.renderSection('center'))
				.append('<div class="fc-clear"/>');
		}
		else {
			this.removeElement();
		}
	}


	removeElement() {
		if (this.el) {
			this.el.remove();
			this.el = null;
		}
	}


	renderSection(position) {
		var calendar = this.calendar
		var theme = calendar.theme;
		var optionsManager = calendar.optionsManager;
		var viewSpecManager = calendar.viewSpecManager;
		var sectionEl = $('<div class="fc-' + position + '"/>');
		var buttonStr = this.toolbarOptions.layout[position];
		var calendarCustomButtons = optionsManager.get('customButtons') || {};
		var calendarButtonTextOverrides = optionsManager.overrides.buttonText || {};
		var calendarButtonText = optionsManager.get('buttonText') || {};

		if (buttonStr) {
			$.each(buttonStr.split(' '), (i, buttonGroupStr) => {
				var groupChildren = $();
				var isOnlyButtons = true;
				var groupEl;

				$.each(buttonGroupStr.split(','), (j, buttonName) => {
					var customButtonProps;
					var viewSpec;
					var buttonClick;
					var buttonIcon; // only one of these will be set
					var buttonText; // "
					var buttonInnerHtml;
					var buttonClasses;
					var buttonEl;

					if (buttonName == 'title') {
						groupChildren = groupChildren.add($('<h2>&nbsp;</h2>')); // we always want it to take up height
						isOnlyButtons = false;
					}
					else {

						if ((customButtonProps = calendarCustomButtons[buttonName])) {
							buttonClick = function(ev) {
								if (customButtonProps.click) {
									customButtonProps.click.call(buttonEl[0], ev);
								}
							};
							(buttonIcon = theme.getCustomButtonIconClass(customButtonProps)) ||
							(buttonIcon = theme.getIconClass(buttonName)) ||
							(buttonText = customButtonProps.text);
						}
						else if ((viewSpec = viewSpecManager.getViewSpec(buttonName))) {
							this.viewsWithButtons.push(buttonName);
							buttonClick = function() {
								calendar.changeView(buttonName);
							};
							(buttonText = viewSpec.buttonTextOverride) ||
							(buttonIcon = theme.getIconClass(buttonName)) ||
							(buttonText = viewSpec.buttonTextDefault);
						}
						else if (calendar[buttonName]) { // a calendar method
							buttonClick = function() {
								calendar[buttonName]();
							};
							(buttonText = calendarButtonTextOverrides[buttonName]) ||
							(buttonIcon = theme.getIconClass(buttonName)) ||
							(buttonText = calendarButtonText[buttonName]);
							//            ^ everything else is considered default
						}

						if (buttonClick) {

							buttonClasses = [
								'fc-' + buttonName + '-button',
								theme.getClass('button'),
								theme.getClass('stateDefault')
							];

							if (buttonText) {
								buttonInnerHtml = htmlEscape(buttonText);
							}
							else if (buttonIcon) {
								buttonInnerHtml = "<span class='" + buttonIcon + "'></span>";
							}

							buttonEl = $( // type="button" so that it doesn't submit a form
								'<button type="button" class="' + buttonClasses.join(' ') + '">' +
									buttonInnerHtml +
								'</button>'
								)
								.click(function(ev) {
									// don't process clicks for disabled buttons
									if (!buttonEl.hasClass(theme.getClass('stateDisabled'))) {

										buttonClick(ev);

										// after the click action, if the button becomes the "active" tab, or disabled,
										// it should never have a hover class, so remove it now.
										if (
											buttonEl.hasClass(theme.getClass('stateActive')) ||
											buttonEl.hasClass(theme.getClass('stateDisabled'))
										) {
											buttonEl.removeClass(theme.getClass('stateHover'));
										}
									}
								})
								.mousedown(function() {
									// the *down* effect (mouse pressed in).
									// only on buttons that are not the "active" tab, or disabled
									buttonEl
										.not('.' + theme.getClass('stateActive'))
										.not('.' + theme.getClass('stateDisabled'))
										.addClass(theme.getClass('stateDown'));
								})
								.mouseup(function() {
									// undo the *down* effect
									buttonEl.removeClass(theme.getClass('stateDown'));
								})
								.hover(
									function() {
										// the *hover* effect.
										// only on buttons that are not the "active" tab, or disabled
										buttonEl
											.not('.' + theme.getClass('stateActive'))
											.not('.' + theme.getClass('stateDisabled'))
											.addClass(theme.getClass('stateHover'));
									},
									function() {
										// undo the *hover* effect
										buttonEl
											.removeClass(theme.getClass('stateHover'))
											.removeClass(theme.getClass('stateDown')); // if mouseleave happens before mouseup
									}
								);

							groupChildren = groupChildren.add(buttonEl);
						}
					}
				});

				if (isOnlyButtons) {
					groupChildren
						.first().addClass(theme.getClass('cornerLeft')).end()
						.last().addClass(theme.getClass('cornerRight')).end();
				}

				if (groupChildren.length > 1) {
					groupEl = $('<div/>');
					if (isOnlyButtons) {
						groupEl.addClass(theme.getClass('buttonGroup'));
					}
					groupEl.append(groupChildren);
					sectionEl.append(groupEl);
				}
				else {
					sectionEl.append(groupChildren); // 1 or 0 children
				}
			});
		}

		return sectionEl;
	}


	updateTitle(text) {
		if (this.el) {
			this.el.find('h2').text(text);
		}
	}


	activateButton(buttonName) {
		if (this.el) {
			this.el.find('.fc-' + buttonName + '-button')
				.addClass(this.calendar.theme.getClass('stateActive'));
		}
	}


	deactivateButton(buttonName) {
		if (this.el) {
			this.el.find('.fc-' + buttonName + '-button')
				.removeClass(this.calendar.theme.getClass('stateActive'));
		}
	}


	disableButton(buttonName) {
		if (this.el) {
			this.el.find('.fc-' + buttonName + '-button')
				.prop('disabled', true)
				.addClass(this.calendar.theme.getClass('stateDisabled'));
		}
	}


	enableButton(buttonName) {
		if (this.el) {
			this.el.find('.fc-' + buttonName + '-button')
				.prop('disabled', false)
				.removeClass(this.calendar.theme.getClass('stateDisabled'));
		}
	}


	getViewsWithButtons() {
		return this.viewsWithButtons;
	}

}
