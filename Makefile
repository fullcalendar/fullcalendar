
FILES =\
	*.js\
	*.css\
	jquery\
	examples
	
VER  = `cat version.txt`
DATE = `svn info . | grep Date: | sed 's/.*: //g'`
REV  = `svn info . | grep Rev: | sed 's/.*: //g'`
	
zip:
	@mkdir -p fullcalendar
	@cp -rt fullcalendar ${FILES}
	@rm -rf `find fullcalendar -type d -name .svn`
	
	@sed -i "s/FullCalendar/& v${VER}/" fullcalendar/fullcalendar.js
	@sed -i "s/Date:/& ${DATE}/" fullcalendar/fullcalendar.js
	@sed -i "s/Revision:/& ${REV}/" fullcalendar/fullcalendar.js
	
	@mkdir -p dist
	@zip -r dist/fullcalendar-${VER}.zip fullcalendar
	@rm -rf fullcalendar
	
clean:
	@rm -rf dist/*
