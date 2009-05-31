
FILES =\
	fullcalendar\
	jquery\
	examples\
	changelog.txt
	
VER  = `cat version.txt`
DATE = `svn info fullcalendar.js | grep Date: | sed 's/.*: //g'`
REV  = `svn info fullcalendar.js | grep Rev: | sed 's/.*: //g'`

hey:
	@for f in fullcalendar/*.js; do echo $$f; done
	
zip:
	@mkdir -p build/F
	@cp -rt build/F ${FILES}
	#@rm -rf `find build/fullcalendar -type d -name .svn`
	
q:
	@for f in fullcalendar/*.js; do\
		echo `svn info $$f`;\
		done
		
yo:
		
		#sed -i "s/FullCalendar/& v`cat version.txt`/" $$f;\
		#sed -i "s/Date:/& `svn info $$f | grep Date: | sed 's/.*: //g'`/" $$f;\
		#sed -i "s/Revision:/& `svn info $$f | grep Rev: | sed 's/.*: //g'`/" $$f;\
	
	
	#@cd build/fullcalendar; zip -r fullcalendar-`cat ../../version.txt`.zip *
	#@mv build/fullcalendar/fullcalendar-`cat version.txt`.zip dist
	#@rm -rf build/fullcalendar
	
something:
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
