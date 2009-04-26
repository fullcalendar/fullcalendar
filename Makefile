
FILES =\
	*.js\
	*.css\
	jquery\
	examples
	
VER  = `cat version.txt`
DATE = `svn info . | grep Date: | sed 's/.*: //g'`
REV  = `svn info . | grep Rev: | sed 's/.*: //g'`
	
zip:
	@mkdir -p build/full_calendar
	@cp -rt build/full_calendar ${FILES}
	@rm -rf `find build -type d -name .svn`
	@sed -i "s/FullCalendar/& v${VER}/" build/full_calendar/full_calendar.js
	@sed -i "s/Date:/& ${DATE}/" build/full_calendar/full_calendar.js
	@sed -i "s/Revision:/& ${REV}/" build/full_calendar/full_calendar.js
	@mkdir -p dist
	@cd build;\
		zip -r ../dist/full_calendar_`cat ../version.txt`.zip full_calendar
	
clean:
	@rm -rf build/*
	@rm -rf dist/*
