
VER = `cat version.txt`
DATE = `svn info | grep Date: | sed 's/.*: //g'`
REV = `svn info | grep Rev: | sed 's/.*: //g'`

JS_SRC_FILES =\
	main.js\
	grid.js\
	view.js\
	util.js
	
CSS_SRC_FILES =\
	main.css\
	grid.css

OTHER_FILES =\
	src/gcal.js\
	src/jquery\
	examples\
	changelog.txt

zip:
	mkdir -p build/fullcalendar-${VER}/uncompressed
	cd src; cat misc/head.txt ${JS_SRC_FILES} misc/foot.txt >\
		../build/fullcalendar-`cat ../version.txt`/uncompressed/fullcalendar.js
	cd src/css; cat ${CSS_SRC_FILES} >\
		../../build/fullcalendar-`cat ../../version.txt`/fullcalendar.css
	java -jar build/yuicompressor-2.4.2.jar\
		-o build/fullcalendar-${VER}/fullcalendar.js\
		build/fullcalendar-${VER}/uncompressed/fullcalendar.js
	cp -rt build/fullcalendar-${VER} ${OTHER_FILES}