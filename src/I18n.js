var applyLocale = function(locale) {
  setDefaults({
    isRTL:  locale.isRTL,
    firstDay: locale.firstDay,
    monthNames: locale.monthNames,
    monthNamesShort: locale.monthNamesShort,
    dayNames: locale.dayNames,
    dayNamesShort: locale.dayNamesShort,
    buttonText: {
      today: locale.currentText
    }
  });
  
}

$.fullCalendar.applyLocale = function(locale) {
  applyLocale(locale);
}
