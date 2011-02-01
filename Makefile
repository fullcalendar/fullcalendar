
SRC_DIR = src
BUILD_DIR = build
DIST_DIR = dist
DEMOS_DIR = demos
OTHER_FILES = \
	changelog.txt \
	MIT-LICENSE.txt \
	GPL-LICENSE.txt

VER = $$(cat version.txt)
VER_SED = sed s/@VERSION/"${VER}"/
DATE = $$(git log -1 --pretty=format:%ad)
DATE_SED = sed s/@DATE/"${DATE}"/

JQ = $$(sed -n "s/.*JQUERY\s*=\s*[\"']\(.*\)[\"'].*/\1/p" "${SRC_DIR}/_loader.js")
JQUI = $$(sed -n "s/.*JQUERY_UI\s*=\s*[\"']\(.*\)[\"'].*/\1/p" "${SRC_DIR}/_loader.js")

DEMO_FILES = $$(cd ${DEMOS_DIR}; find . -mindepth 1 -maxdepth 1 -type f)
DEMO_SUBDIRS = $$(cd ${DEMOS_DIR}; find . -mindepth 1 -maxdepth 1 -type d)
DEMO_RE = \(<script[^>]*_loader\.js[^>]*><\/script>\|<!--\[\[\|\]\]-->\)\s*
DEMO_SED = sed -n "1h;1!H;\$${;g;s/${DEMO_RE}//g;p;}"

JS_SED = sed -n "s/\s*js([\"']\(.*\)[\"']).*/\1/p"
CSS_SED = sed -n "s/\s*css([\"']\(.*\)[\"']).*/\1/p"

concat_js = \
	files=$$(cat "$(1)/_loader.js" | ${JS_SED}); \
	if [ -f "$(1)/intro.js" ]; then \
		files="intro.js $$files"; \
	fi; \
	if [ -f "$(1)/outro.js" ]; then \
		files="$$files outro.js"; \
	fi; \
	old=$$PWD; \
	(cd "$(1)"; cat $$files; cd "$$old") \
		| ${VER_SED} \
		| ${DATE_SED} \
		> "$(2)"
	
concat_css = \
	files=$$(cat "$(1)/_loader.js" | ${CSS_SED}); \
	if [ "$$files" ]; then \
		old=$$PWD; \
		(cd "$(1)"; cat $$files; cd "$$old") \
			| ${VER_SED} \
			| ${DATE_SED} \
			> "$(2)"; \
	fi
	
zip:
	@rm -rf ${BUILD_DIR}/fullcalendar
	@rm -rf ${BUILD_DIR}/fullcalendar-*
	@mkdir -p ${BUILD_DIR}/fullcalendar/fullcalendar/
	
	@echo "building core..."
	@$(call concat_js,${SRC_DIR},"${BUILD_DIR}/fullcalendar/fullcalendar/fullcalendar.js")
	@$(call concat_css,${SRC_DIR},"${BUILD_DIR}/fullcalendar/fullcalendar/fullcalendar.css")
	@cat "${SRC_DIR}/common/print.css" \
		| ${VER_SED} \
		| ${DATE_SED} \
		> "${BUILD_DIR}/fullcalendar/fullcalendar/fullcalendar.print.css"
	
	@echo "compressing core js..."
	@java -jar ${BUILD_DIR}/compiler.jar --warning_level VERBOSE --jscomp_off checkTypes --externs build/externs.js \
		--js ${BUILD_DIR}/fullcalendar/fullcalendar/fullcalendar.js \
		> ${BUILD_DIR}/fullcalendar/fullcalendar/fullcalendar.min.js; \
		
	@echo "building plugins..."
	@for loader in ${SRC_DIR}/*/_loader.js; do \
		dir=`dirname $$loader`; \
		name=`basename $$dir`; \
		$(call concat_js,$$dir,"${BUILD_DIR}/fullcalendar/fullcalendar/$$name.js"); \
	done
	
	@echo "copying jquery..."
	@mkdir -p ${BUILD_DIR}/fullcalendar/jquery
	@cp lib/${JQ} ${BUILD_DIR}/fullcalendar/jquery
	@cp lib/${JQUI} ${BUILD_DIR}/fullcalendar/jquery
	
	@echo "building demos..."
	@mkdir -p ${BUILD_DIR}/fullcalendar/demos
	@for f in ${DEMO_FILES}; do \
		cat ${DEMOS_DIR}/$$f \
			| ${DEMO_SED} \
			| sed "s/jquery\.js/${JQ}/" \
			| sed "s/jquery-ui\.js/${JQUI}/" \
			> ${BUILD_DIR}/fullcalendar/demos/$$f; \
	done
	@for d in ${DEMO_SUBDIRS}; do \
		cp -r ${DEMOS_DIR}/$$d ${BUILD_DIR}/fullcalendar/demos/$$d; \
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
	
