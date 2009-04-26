
FILES =\
	*.js\
	*.css\
	jquery\
	examples
	
zip:
	@mkdir -p build/full_calendar
	@cp -rt build/full_calendar ${FILES}
	@sed -i "s/Version:/& `cat version.txt`/" build/full_calendar/full_calendar.js
	@mkdir -p dist
	@cd build;\
		zip -r ../dist/full_calendar_`cat ../version.txt`.zip *
	
clean:
	@rm -rf build/*
	@rm -rf dist/*
