
SRC_DIR = src
EXAMPLES_DIR = examples
BUILD_DIR = build
DIST_DIR = dist

JS_SRC_FILES = \
	${SRC_DIR}/main.js \
	${SRC_DIR}/grid.js \
	${SRC_DIR}/agenda.js \
	${SRC_DIR}/view.js \
	${SRC_DIR}/util.js
	
CSS_SRC_FILES = \
	${SRC_DIR}/css/main.css \
	${SRC_DIR}/css/grid.css \
	${SRC_DIR}/css/agenda.css

OTHER_FILES = \
	${SRC_DIR}/jquery \
	changelog.txt
	
VER = `cat version.txt`
VER_SED = sed s/@VERSION/"${VER}"/
DATE = `git log -1 | grep Date: | sed 's/[^:]*: *//'`
DATE_SED = sed s/@DATE/"${DATE}"/

zip:
	@rm -rf ${BUILD_DIR}/fullcalendar
	@rm -rf ${BUILD_DIR}/fullcalendar-*
	@mkdir -p ${BUILD_DIR}/fullcalendar
	
	@echo "building js..."
	@cat ${SRC_DIR}/misc/head.txt ${JS_SRC_FILES} ${SRC_DIR}/misc/foot.txt \
		| ${VER_SED} | ${DATE_SED} \
		> ${BUILD_DIR}/fullcalendar/fullcalendar.js
	@cat ${SRC_DIR}/gcal.js \
		| ${VER_SED} | ${DATE_SED} \
		> ${BUILD_DIR}/fullcalendar/gcal.js
	@cat ${SRC_DIR}/selectable.js \
		| ${VER_SED} | ${DATE_SED} \
		> ${BUILD_DIR}/fullcalendar/selectable.js
		
	@echo "compressing js..."
	@java -jar ${BUILD_DIR}/compiler.jar --js ${BUILD_DIR}/fullcalendar/fullcalendar.js \
		> ${BUILD_DIR}/fullcalendar/fullcalendar.min.js
		
	@echo "building css..."
	@cat ${CSS_SRC_FILES} \
		| ${VER_SED} | ${DATE_SED} \
		> ${BUILD_DIR}/fullcalendar/fullcalendar.css
		
	@echo "building examples..."
	@mkdir -p ${BUILD_DIR}/fullcalendar/examples
	@for f in `cd ${EXAMPLES_DIR}; find . -mindepth 1 -maxdepth 1 -type f`; do \
		cat ${EXAMPLES_DIR}/$$f \
			| sed -n '1h;1!H;$${;g;s/<!--\s*<src>.*<\/src>\s*-->\s*//g;p;}' \
			| sed -n '1h;1!H;$${;g;s/<!--\s*<dist>\s*//g;p;}' \
			| sed -n '1h;1!H;$${;g;s/<\/dist>\s*-->\s*//g;p;}' \
			> ${BUILD_DIR}/fullcalendar/examples/$$f; \
	done
	@for d in `cd ${EXAMPLES_DIR}; find . -mindepth 1 -maxdepth 1 -type d`; do \
		cp -r ${EXAMPLES_DIR}/$$d ${BUILD_DIR}/fullcalendar/examples/$$d; \
	done
		
	@echo "copying other files..."
	@cp -r ${OTHER_FILES} ${BUILD_DIR}/fullcalendar
		
	@echo "zipping..."
	@mv ${BUILD_DIR}/fullcalendar ${BUILD_DIR}/fullcalendar-${VER}
	@cd ${BUILD_DIR}; for f in fullcalendar-*; do \
		zip -q -r $$f.zip $$f; \
		done
	@mv ${BUILD_DIR}/fullcalendar-${VER} ${BUILD_DIR}/fullcalendar
	
	@mkdir -p ${DIST_DIR}
	@mv ${BUILD_DIR}/fullcalendar-${VER}.zip ${DIST_DIR}
	@echo "done."
	
clean:
	@rm -rf ${BUILD_DIR}/fullcalendar
	@rm -rf ${BUILD_DIR}/fullcalendar-*
	@rm -rf ${DIST_DIR}/*
	
