
FILES =\
	fullcalendar\
	jquery\
	examples\
	changelog.txt
	
VER = `cat version.txt`
VVER = `cat ../version.txt`
DATE = `svn info | grep Date: | sed 's/.*: //g'`
REV = `svn info | grep Rev: | sed 's/.*: //g'`
	
min:
	@java -jar build/yuicompressor-2.4.2.jar -o build/fullcalendar.min.js fullcalendar/fullcalendar.js
	
zip:
	@mkdir -p build/fullcalendar-${VER}
	@cp -rt build/fullcalendar-${VER} ${FILES}
	@if [ -e build/fullcalendar.min.js ];\
		then cp build/fullcalendar.min.js build/fullcalendar-${VER}/fullcalendar;\
		else echo "\n!!! WARNING: fullcalendar.js not yet minified.\n";\
		fi
	@rm -rf `find build/fullcalendar-* -type d -name .svn`
	@for f in build/fullcalendar-${VER}/fullcalendar/*.js; do\
		sed -i "s/* FullCalendar/& v${VER}/" $$f;\
		sed -i "s/* Date:/& ${DATE}/" $$f;\
		sed -i "s/* Revision:/& ${REV}/" $$f;\
		done
	@cd build; zip -r fullcalendar-${VVER}.zip fullcalendar-${VVER}
	@mkdir -p dist
	@mv build/fullcalendar-${VER}.zip dist
	@rm -rf build/fullcalendar-${VER}
	@rm -f build/fullcalendar.min.js
	
clean:
	@rm -rf dist/*
	@rm -rf build/fullcalendar-*
	@rm -f build/*.js
