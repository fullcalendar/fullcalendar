
build/moment-jalaali.js: components index.js builder/before.js builder/after.js
	@$(MAKE) lint
	@mkdir -p build
	@cat builder/before.js components/jalaali/jalaali-js/*/index.js builder/middle.js index.js builder/after.js > build/moment-jalaali.js

MOCHA_CMD = mocha --reporter spec --ui bdd --colors --check-leaks

test: build/moment-jalaali.js
	@$(MOCHA_CMD) test.js

dev: build/moment-jalaali.js
	@$(MOCHA_CMD) --watch test.js

lint: lint-index lint-test

lint-index: node_modules
	@eslint index.js

lint-test: node_modules
	@eslint --env mocha --rule 'no-unused-expressions: 0' test.js

components: node_modules component.json
	@component install && touch $@

node_modules: package.json
	@npm install && touch $@

clean:
	@rm -fr build

clean-all: clean
	@rm -fr components node_modules

.PHONY: test dev lint lint-index lint-test clean clean-all
