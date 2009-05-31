
FILES =\
	fullcalendar\
	jquery\
	examples\
	changelog.txt
	
min:
	@java -jar build/yuicompressor-2.4.2.jar -o build/fullcalendar.min.js fullcalendar/fullcalendar.js
	sed -i "s/* FullCalendar/& v`cat version.txt`/" build/fullcalendar.min.js
	sed -i "s/* Date:/& `svn info fullcalendar/fullcalendar.js | grep Date: | sed 's/.*: //g'`/" build/fullcalendar.min.js
	sed -i "s/* Revision:/& `svn info fullcalendar/fullcalendar.js | grep Rev: | sed 's/.*: //g'`/" build/fullcalendar.min.js
	
zip:
	@mkdir -p build/F
	@cp -rt build/F ${FILES} .svn
	@for f in build/F/fullcalendar/*.js; do\
		sed -i "s/* FullCalendar/& v`cat version.txt`/" $$f;\
		sed -i "s/* Date:/& `svn info $$f | grep Date: | sed 's/.*: //g'`/" $$f;\
		sed -i "s/* Revision:/& `svn info $$f | grep Rev: | sed 's/.*: //g'`/" $$f;\
		done
	@rm -rf `find build/F -type d -name .svn`
	@if [ -e build/fullcalendar.min.js ];\
		then cp build/fullcalendar.min.js build/F/fullcalendar;\
		else echo "WARNING: fullcalendar.js not yet minified.";\
		fi
	@cd build/F; zip -r fullcalendar-`cat ../../version.txt`.zip *
	@mv build/F/fullcalendar-*.zip dist
	@rm -rf build/F
	@rm -f build/fullcalendar.min.js
	
clean:
	@rm -rf dist/*
	@rm -f build/*.js
