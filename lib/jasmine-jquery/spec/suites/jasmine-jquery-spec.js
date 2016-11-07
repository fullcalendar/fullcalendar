describe("jasmine.Fixtures", function () {
  var ajaxData = 'some ajax data'
  var fixtureUrl = 'some_url'
  var anotherFixtureUrl = 'another_url'
  var fixturesContainer = function () {
    return $('#' + jasmine.getFixtures().containerId)
  }
  var appendFixturesContainerToDom = function () {
    $('body').append('<div id="' + jasmine.getFixtures().containerId + '">old content</div>')
  }

  beforeEach(function () {
    jasmine.getFixtures().clearCache()
    spyOn(jasmine.Fixtures.prototype, 'loadFixtureIntoCache_').and.callFake(function (relativeUrl){
      this.fixturesCache_[relativeUrl] = ajaxData
    })
  })

  describe("default initial config values", function () {
    it("should set 'jasmine-fixtures' as the default container id", function () {
      expect(jasmine.getFixtures().containerId).toEqual('jasmine-fixtures')
    })

    it("should set 'spec/javascripts/fixtures' as the default fixtures path", function () {
      expect(jasmine.getFixtures().fixturesPath).toEqual('spec/javascripts/fixtures')
    })
  })

  describe("cache", function () {
    describe("clearCache", function () {
      it("should clear cache and in effect force subsequent AJAX call", function () {
        jasmine.getFixtures().read(fixtureUrl)
        jasmine.getFixtures().clearCache()
        jasmine.getFixtures().read(fixtureUrl)
        expect(jasmine.Fixtures.prototype.loadFixtureIntoCache_.calls.count()).toEqual(2)
      })
    })

    it("first-time read should go through AJAX", function () {
      jasmine.getFixtures().read(fixtureUrl)
      expect(jasmine.Fixtures.prototype.loadFixtureIntoCache_.calls.count()).toEqual(1)
    })

    it("subsequent read from the same URL should go from cache", function () {
      jasmine.getFixtures().read(fixtureUrl, fixtureUrl)
      expect(jasmine.Fixtures.prototype.loadFixtureIntoCache_.calls.count()).toEqual(1)
    })
  })

  describe("read", function () {
    it("should return fixture HTML", function () {
      var html = jasmine.getFixtures().read(fixtureUrl)
      expect(html).toEqual(ajaxData)
    })

    it("should return duplicated HTML of a fixture when its url is provided twice in a single call", function () {
      var html = jasmine.getFixtures().read(fixtureUrl, fixtureUrl)
      expect(html).toEqual(ajaxData + ajaxData)
    })

    it("should return merged HTML of two fixtures when two different urls are provided in a single call", function () {
      var html = jasmine.getFixtures().read(fixtureUrl, anotherFixtureUrl)
      expect(html).toEqual(ajaxData + ajaxData)
    })

    it("should have shortcut global method readFixtures", function () {
      var html = readFixtures(fixtureUrl, anotherFixtureUrl)
      expect(html).toEqual(ajaxData + ajaxData)
    })

    it("should use the configured fixtures path concatenating it to the requested url (without concatenating a slash if it already has an ending one)", function () {
      jasmine.getFixtures().fixturesPath = 'a path ending with slash/'
      expect(jasmine.getFixtures().makeFixtureUrl_(fixtureUrl)).toEqual('a path ending with slash/'+fixtureUrl)
    })

    it("should use the configured fixtures path concatenating it to the requested url (concatenating a slash if it doesn't have an ending one)", function () {
      jasmine.getFixtures().fixturesPath = 'a path without an ending slash'
      expect(jasmine.getFixtures().makeFixtureUrl_(fixtureUrl)).toEqual('a path without an ending slash/'+fixtureUrl)
    })
  })

  describe("load", function () {
    it("should insert fixture HTML into container", function () {
      jasmine.getFixtures().load(fixtureUrl)
      expect(fixturesContainer().html()).toEqual(ajaxData)
    })

    it("should insert duplicated fixture HTML into container when the same url is provided twice in a single call", function () {
      jasmine.getFixtures().load(fixtureUrl, fixtureUrl)
      expect(fixturesContainer().html()).toEqual(ajaxData + ajaxData)
    })

    it("should insert merged HTML of two fixtures into container when two different urls are provided in a single call", function () {
      jasmine.getFixtures().load(fixtureUrl, anotherFixtureUrl)
      expect(fixturesContainer().html()).toEqual(ajaxData + ajaxData)
    })

    it("should have shortcut global method loadFixtures", function () {
      loadFixtures(fixtureUrl, anotherFixtureUrl)
      expect(fixturesContainer().html()).toEqual(ajaxData + ajaxData)
    })

    describe("when fixture container does not exist", function () {
      it("should automatically create fixtures container and append it to DOM", function () {
        jasmine.getFixtures().load(fixtureUrl)
        expect(fixturesContainer().size()).toEqual(1)
      })
    })

    describe("when fixture container exists", function () {
      beforeEach(function () {
        appendFixturesContainerToDom()
      })

      it("should replace it with new content", function () {
        jasmine.getFixtures().load(fixtureUrl)
        expect(fixturesContainer().html()).toEqual(ajaxData)
      })
    })

    describe("when fixture contains an inline <script> tag", function (){
      beforeEach(function (){
        ajaxData = "<div><a id=\"anchor_01\"></a><script>$(function (){ $('#anchor_01').addClass('foo')});</script></div>"
      })

      it("should execute the inline javascript after the fixture has been inserted into the body", function (){
        jasmine.getFixtures().load(fixtureUrl)
        expect($("#anchor_01")).toHaveClass('foo')
      })
    })
  })

  describe("appendLoad", function () {
    beforeEach(function (){
      ajaxData = 'some ajax data'
    })

    it("should insert fixture HTML into container", function () {
      jasmine.getFixtures().appendLoad(fixtureUrl)
      expect(fixturesContainer().html()).toEqual(ajaxData)
    })

    it("should insert duplicated fixture HTML into container when the same url is provided twice in a single call", function () {
      jasmine.getFixtures().appendLoad(fixtureUrl, fixtureUrl)
      expect(fixturesContainer().html()).toEqual(ajaxData + ajaxData)
    })

    it("should insert merged HTML of two fixtures into container when two different urls are provided in a single call", function () {
      jasmine.getFixtures().appendLoad(fixtureUrl, anotherFixtureUrl)
      expect(fixturesContainer().html()).toEqual(ajaxData + ajaxData)
    })

    it("should have shortcut global method loadFixtures", function () {
      appendLoadFixtures(fixtureUrl, anotherFixtureUrl)
      expect(fixturesContainer().html()).toEqual(ajaxData + ajaxData)
    })

    it("should automatically create fixtures container and append it to DOM", function () {
      jasmine.getFixtures().appendLoad(fixtureUrl)
      expect(fixturesContainer().size()).toEqual(1)
    })

    describe("with a prexisting fixture",function (){
      beforeEach(function () {
        jasmine.getFixtures().appendLoad(fixtureUrl)
      })

      it("should add new content", function () {
        jasmine.getFixtures().appendLoad(fixtureUrl)
        expect(fixturesContainer().html()).toEqual(ajaxData + ajaxData)
      })

      it("should not add a new fixture container", function (){
        jasmine.getFixtures().appendLoad(fixtureUrl)
        expect(fixturesContainer().size()).toEqual(1)
      })
    })

    describe("when fixture contains an inline <script> tag", function (){
      beforeEach(function (){
        ajaxData = "<div><a id=\"anchor_01\"></a><script>$(function (){ $('#anchor_01').addClass('foo')});</script></div>"
      })

      it("should execute the inline javascript after the fixture has been inserted into the body", function (){
        jasmine.getFixtures().appendLoad(fixtureUrl)
        expect($("#anchor_01")).toHaveClass('foo')
      })
    })
  })

  describe("preload", function () {
    describe("read after preload", function () {
      it("should go from cache", function () {
        jasmine.getFixtures().preload(fixtureUrl, anotherFixtureUrl)
        jasmine.getFixtures().read(fixtureUrl, anotherFixtureUrl)
        expect(jasmine.Fixtures.prototype.loadFixtureIntoCache_.calls.count()).toEqual(2)
      })

      it("should return correct HTMLs", function () {
        jasmine.getFixtures().preload(fixtureUrl, anotherFixtureUrl)
        var html = jasmine.getFixtures().read(fixtureUrl, anotherFixtureUrl)
        expect(html).toEqual(ajaxData + ajaxData)
      })
    })

    it("should not preload the same fixture twice", function () {
      jasmine.getFixtures().preload(fixtureUrl, fixtureUrl)
      expect(jasmine.Fixtures.prototype.loadFixtureIntoCache_.calls.count()).toEqual(1)
    })

    it("should have shortcut global method preloadFixtures", function () {
      preloadFixtures(fixtureUrl, anotherFixtureUrl)
      jasmine.getFixtures().read(fixtureUrl, anotherFixtureUrl)
      expect(jasmine.Fixtures.prototype.loadFixtureIntoCache_.calls.count()).toEqual(2)
    })
  })

  describe("set", function () {
    var html = '<div>some HTML</div>'

    it("should insert HTML into container", function () {
      jasmine.getFixtures().set(html)
      expect(fixturesContainer().html()).toEqual(jasmine.jQuery.browserTagCaseIndependentHtml(html))
    })

    it("should insert jQuery element into container", function () {
      jasmine.getFixtures().set($(html))
      expect(fixturesContainer().html()).toEqual(jasmine.jQuery.browserTagCaseIndependentHtml(html))
    })

    describe("when fixture container does not exist", function () {
      it("should automatically create fixtures container and append it to DOM", function () {
        jasmine.getFixtures().set(html)
        expect(fixturesContainer().size()).toEqual(1)
      })

      it("should return the fixture container", function () {
        var container = jasmine.getFixtures().set(html)
        expect(container).toExist()
        expect(container[0]).toEqual(fixturesContainer()[0])
      })
    })

    describe("when fixture container exists", function () {
      beforeEach(function () {
        appendFixturesContainerToDom()
      })

      it("should replace it with new content", function () {
        jasmine.getFixtures().set(html)
        expect(fixturesContainer().html()).toEqual(jasmine.jQuery.browserTagCaseIndependentHtml(html))
      })

      it("should return the fixture container", function (){
        var container = jasmine.getFixtures().set(html)
        expect(container).toExist()
        expect(container[0]).toEqual(fixturesContainer()[0])
      })
    })
  })

  describe("setFixtures", function () {
    var html = '<div>some HTML</div>'

    it("should be a shortcut global method", function () {
      setFixtures(html)
      expect(fixturesContainer().html()).toEqual(jasmine.jQuery.browserTagCaseIndependentHtml(html))
    })

    it("should return the fixture container", function () {
      var container = setFixtures(html)
      expect(container).toExist()
      expect(container[0]).toEqual(fixturesContainer()[0])
    })
  })

  describe("appendSet",function (){
    var html = '<div>some HTML</div>'
    it("should insert HTML into container", function () {
      jasmine.getFixtures().appendSet(html)
      expect(fixturesContainer().html()).toEqual(jasmine.jQuery.browserTagCaseIndependentHtml(html))
    })

    it("should insert jQuery element into container", function () {
      jasmine.getFixtures().appendSet($(html))
      expect(fixturesContainer().html()).toEqual(jasmine.jQuery.browserTagCaseIndependentHtml(html))
    })

    it("should have shortcut global method setFixtures", function () {
      appendSetFixtures(html)
      expect(fixturesContainer().html()).toEqual(jasmine.jQuery.browserTagCaseIndependentHtml(html))
    })

    describe("when fixture container does not exist", function () {
      it("should automatically create fixtures container and append it to DOM", function () {
        jasmine.getFixtures().appendSet(html)
        expect(fixturesContainer().size()).toEqual(1)
      })
    })

    describe("when fixture container exists", function () {
      beforeEach(function () {
        jasmine.getFixtures().appendSet(html)
      })

      it("should add new content", function () {
        jasmine.getFixtures().appendSet(html)
        expect(fixturesContainer().html()).toEqual(jasmine.jQuery.browserTagCaseIndependentHtml(html)+jasmine.jQuery.browserTagCaseIndependentHtml(html))
      })
    })
  })

  describe("sandbox", function () {
    describe("with no attributes parameter specified", function () {
      it("should create DIV with id #sandbox", function () {
        expect(jasmine.getFixtures().sandbox().html()).toEqual($('<div id="sandbox" />').html())
      })
    })

    describe("with attributes parameter specified", function () {
      it("should create DIV with attributes", function () {
        var attributes = {
          attr1: 'attr1 value',
          attr2: 'attr2 value'
        }
        var element = $(jasmine.getFixtures().sandbox(attributes))

        expect(element.attr('attr1')).toEqual(attributes.attr1)
        expect(element.attr('attr2')).toEqual(attributes.attr2)
      })

      it("should be able to override id by setting it as attribute", function () {
        var idOverride = 'overridden'
        var element = $(jasmine.getFixtures().sandbox({id: idOverride}))
        expect(element.attr('id')).toEqual(idOverride)
      })
    })

    it("should have shortcut global method sandbox", function () {
      var attributes = {
        id: 'overridden'
      }
      var element = $(sandbox(attributes))
      expect(element.attr('id')).toEqual(attributes.id)
    })
  })

  describe("cleanUp", function () {
    it("should remove fixtures container from DOM", function () {
      appendFixturesContainerToDom()
      jasmine.getFixtures().cleanUp()
      expect(fixturesContainer().size()).toEqual(0)
    })
  })

  // WARNING: this block requires its two tests to be invoked in order!
  // (Really ugly solution, but unavoidable in this specific case)
  describe("automatic DOM clean-up between tests", function () {
    // WARNING: this test must be invoked first (before 'SECOND TEST')!
    it("FIRST TEST: should pollute the DOM", function () {
      appendFixturesContainerToDom()
    })

    // WARNING: this test must be invoked second (after 'FIRST TEST')!
    it("SECOND TEST: should see the DOM in a blank state", function () {
      expect(fixturesContainer().size()).toEqual(0)
    })
  })
})

describe("jasmine.Fixtures using real AJAX call", function () {
  var defaultFixturesPath

  beforeEach(function () {
    defaultFixturesPath = jasmine.getFixtures().fixturesPath
    jasmine.getFixtures().fixturesPath = 'spec/fixtures'
  })

  afterEach(function () {
    jasmine.getFixtures().fixturesPath = defaultFixturesPath
  })

  describe("when fixture file exists", function () {
    var fixtureUrl = "real_non_mocked_fixture.html"

    it("should load content of fixture file", function () {
      var fixtureContent = jasmine.getFixtures().read(fixtureUrl)
      expect(fixtureContent).toEqual('<div id="real_non_mocked_fixture"></div>')
    })
  })

  describe("when fixture file does not exist", function () {
    var fixtureUrl = "not_existing_fixture"

    it("should throw an exception", function () {
      expect(function () {
        jasmine.getFixtures().read(fixtureUrl)
      }).toThrow()
    })
  })

  describe("when fixture contains an <script src='to/your/source'> tag", function () {
    var fixtureUrl = "fixture_with_javascript.html"

    it("should load content of fixture file and javascript and bind events", function () {
      jasmine.getFixtures().load(fixtureUrl)
      $('#anchor_01').click()
      expect($("#anchor_01")).toHaveClass('foo')
    })

    it("should load multiple javascripts and bind events in fixture", function () {
      jasmine.getFixtures().load(fixtureUrl)
      $('#anchor_01').click()
      $('#anchor_01').trigger('hover')
      expect($("#anchor_01")).toHaveClass('foo')
      expect($("#anchor_01")).toHaveClass('bar')
    })
  })

  describe("when fixture contains a <script> tag without a src attribute", function () {
    var fixtureUrl = "fixture_with_javascript_block.html"

    it("should load the fixture and ignore the script tag", function () {
      jasmine.getFixtures().load(fixtureUrl)
      expect($("#anchor_01").length).toBe(1)
    })
  })
  
  describe("When the fixture contains a HTML 5 style checked checkbox", function () {
	var fixtureUrl = "fixture_with_checkbox_with_checked.html"
	
	it("Then the fixture is loaded successfully", function () {
	  jasmine.getFixtures().load(fixtureUrl)
	  expect('#' + jasmine.getFixtures().containerId).toContainElement('#checked-box')
	})
  })
})

describe("jQuery matcher", function () {
  describe("when invoked multiple times on the same fixture", function () {
    it("should not reset fixture after first call", function () {
      setFixtures(sandbox())
      expect($('#sandbox')).toExist()
      expect($('#sandbox')).toExist()
    })
  })

  describe("toHaveClass", function () {
    var className = "some-class"

    it("should pass when class found", function () {
      setFixtures(sandbox({'class': className}))
      expect($('#sandbox')).toHaveClass(className)
      expect($('#sandbox').get(0)).toHaveClass(className)
    })

    it("should pass negated when class not found", function () {
      setFixtures(sandbox())
      expect($('#sandbox')).not.toHaveClass(className)
      expect($('#sandbox').get(0)).not.toHaveClass(className)
    })

    it("should not crash when documentElement provided", function (){
      var doc = $(document.documentElement).addClass(className)
      expect(doc).toHaveClass(className)
      doc.removeClass(className)
      expect(doc).not.toHaveClass(className)
    })
  })

  describe("toHaveAttr", function () {
    var attributeName = 'attr1'
    var attributeValue = 'attr1 value'
    var wrongAttributeName = 'wrongName'
    var wrongAttributeValue = 'wrong value'

    beforeEach(function () {
      var attributes = {}
      attributes[attributeName] = attributeValue
      setFixtures(sandbox(attributes))
    })

    describe("when only attribute name is provided", function () {
      it("should pass if element has matching attribute", function () {
        expect($('#sandbox')).toHaveAttr(attributeName)
        expect($('#sandbox').get(0)).toHaveAttr(attributeName)
      })

      it("should pass negated if element has no matching attribute", function () {
        expect($('#sandbox')).not.toHaveAttr(wrongAttributeName)
        expect($('#sandbox').get(0)).not.toHaveAttr(wrongAttributeName)
      })
    })

    describe("when both attribute name and value are provided", function () {
      it("should pass if element has matching attribute with matching value", function () {
        expect($('#sandbox')).toHaveAttr(attributeName, attributeValue)
        expect($('#sandbox').get(0)).toHaveAttr(attributeName, attributeValue)
      })

      it("should pass negated if element has matching attribute but with wrong value", function () {
        expect($('#sandbox')).not.toHaveAttr(attributeName, wrongAttributeValue)
        expect($('#sandbox').get(0)).not.toHaveAttr(attributeName, wrongAttributeValue)
      })

      it("should pass negated if element has no matching attribute", function () {
        expect($('#sandbox')).not.toHaveAttr(wrongAttributeName, attributeValue)
        expect($('#sandbox').get(0)).not.toHaveAttr(wrongAttributeName, attributeValue)
      })
    })
  })

  describe("toHaveProp", function () {
      var propertyName = 'prop1'
      var propertyValue = 'prop1 value'
      var wrongPropertyName = 'wrongName'
      var wrongPropertyValue = 'wrong value'

      beforeEach(function () {
        setFixtures(sandbox())
        var element = $('#sandbox')[0]
        element[propertyName] = propertyValue
      })

      describe("when only property name is provided", function () {
        it("should pass if element has matching property", function () {
          expect($('#sandbox')).toHaveProp(propertyName)
        })

        it("should pass negated if element has no matching property", function () {
          expect($('#sandbox')).not.toHaveProp(wrongPropertyName)
        })
      })

      describe("when both property name and value are provided", function () {
        it("should pass if element has matching property with matching value", function () {
          expect($('#sandbox')).toHaveProp(propertyName, propertyValue)
        })

        it("should pass negated if element has matching property but with wrong value", function () {
          expect($('#sandbox')).not.toHaveProp(propertyName, wrongPropertyValue)
        })

        it("should pass negated if element has no matching property", function () {
          expect($('#sandbox')).not.toHaveProp(wrongPropertyName, propertyValue)
        })
      })
  })

  describe("toHaveCss", function (){
    beforeEach(function (){
      setFixtures(sandbox())
    })

    it("should pass if the element has matching css", function (){
      $("#sandbox").css("display", "none")
      $("#sandbox").css("margin-left", "10px")
      expect($("#sandbox")).toHaveCss({display: "none", "margin-left": "10px"})
    })

    it("should be able to check a subset of element's css", function (){
      $("#sandbox").css("display", "none")
      $("#sandbox").css("margin-left", "10px")
      expect($("#sandbox")).toHaveCss({"margin-left": "10px"})
    })

    it("should fail if the element doesn't have matching css", function (){
      $("#sandbox").css("display", "none")
      $("#sandbox").css("margin-left", "20px")
      expect($("#sandbox")).not.toHaveCss({display: "none", "margin-left": "10px"})
    })

    it("should pass if the css property is auto and you check that property for auto", function (){
      $("#sandbox").css("height", "auto");
      $("#sandbox").css("margin-left", "auto");
      $("#sandbox").css("display", "none");
      expect($("#sandbox")).toHaveCss({height: 'auto', 'margin-left': "auto", display: "none"});
    })
  })

  describe("toHaveId", function () {
    beforeEach(function () {
      setFixtures(sandbox())
    })

    it("should pass if id attribute matches expectation", function () {
      expect($('#sandbox')).toHaveId('sandbox')
      expect($('#sandbox').get(0)).toHaveId('sandbox')
    })

    it("should pass negated if id attribute does not match expectation", function () {
      expect($('#sandbox')).not.toHaveId('wrongId')
      expect($('#sandbox').get(0)).not.toHaveId('wrongId')
    })

    it("should pass negated if id attribute is not present", function () {
      expect($('<div />')).not.toHaveId('sandbox')
      expect($('<div />').get(0)).not.toHaveId('sandbox')
    })
  })

  describe("toHaveHtml", function () {
    var html = '<div>some text</div>'
    var wrongHtml = '<span>some text</span>'
    var element

    beforeEach(function () {
      element = $('<div/>').append(html)
    })

    it("should pass when html matches", function () {
      expect(element).toHaveHtml(html)
      expect(element.get(0)).toHaveHtml(html)
    })

    it("should pass negated when html does not match", function () {
      expect(element).not.toHaveHtml(wrongHtml)
      expect(element.get(0)).not.toHaveHtml(wrongHtml)
    })
  })

  describe("toContainHtml", function (){
    beforeEach(function (){
      setFixtures(sandbox())
    })

    it("should pass when the element contains given html", function (){
      $("#sandbox").html("<div><ul></ul><h1>foo</h1></div>")
      expect($("#sandbox")).toContainHtml("<ul></ul>")
    })

    it("should fail when the element doesn't contain given html", function (){
      $("#sandbox").html("<div><h1>foo</h1></div>")
      expect($("#sandbox")).not.toContainHtml("<ul></ul>")
    })
  })

  describe("toHaveText", function () {
    var text = 'some text'
    var wrongText = 'some other text'
    var element

    beforeEach(function () {
      element = $('<div/>').append(text)
    })

    it("should pass when text matches", function () {
      expect(element).toHaveText(text)
      expect(element.get(0)).toHaveText(text)
    })

    it("should ignore surrounding whitespace in the element", function () {
      element = $('<div>\n' + text + '\n</div>')
      expect(element).toHaveText(text)
      expect(element.get(0)).toHaveText(text)
    })

    it("should match with surrounding whitespace in the input", function () {
      element = $('<div>\n' + text + '\n</div>')
      expect(element).toHaveText('\n' + text + '\n')
      expect(element.get(0)).toHaveText(text)
    })

    it("should pass negated when text does not match", function () {
      expect(element).not.toHaveText(wrongText)
      expect(element.get(0)).not.toHaveText(wrongText)
    })

    it('should pass when text matches a regex', function () {
      expect(element).toHaveText(/some/)
      expect(element.get(0)).toHaveText(/some/)
    })

    it('should pass negated when text does not match a regex', function () {
      expect(element).not.toHaveText(/other/)
      expect(element.get(0)).not.toHaveText(/other/)
    })
  })

  describe("toContainText", function () {
    var text = 'some pretty long bits of text'
    var textPart = 'pret'
    var wrongText = 'some other text'
    var element

    beforeEach(function () {
      element = $('<div/>').append(text)
    })

    it("should pass when text contains text part", function () {
      expect(element).toContainText(textPart)
      expect(element.get(0)).toContainText(textPart)
    })

    it("should pass negated when text does not match", function () {
      expect(element).not.toContainText(wrongText)
      expect(element.get(0)).not.toContainText(wrongText)
    })

    it('should pass when text matches a regex', function () {
      expect(element).toContainText(/some/)
      expect(element.get(0)).toContainText(/some/)
    })

    it('should pass negated when text does not match a regex', function () {
      expect(element).not.toContainText(/other/)
      expect(element.get(0)).not.toContainText(/other/)
    })
  })

  describe("toHaveValue", function () {
    var value = 'some value'
    var differentValue = 'different value'

    beforeEach(function () {
      setFixtures($('<input id="sandbox" type="text" />').val(value))
    })

    it("should pass if value matches expectation", function () {
      expect($('#sandbox')).toHaveValue(value)
      expect($('#sandbox').get(0)).toHaveValue(value)
    })

    it("should pass negated if value does not match expectation", function () {
      expect($('#sandbox')).not.toHaveValue(differentValue)
      expect($('#sandbox').get(0)).not.toHaveValue(differentValue)
    })

    it("should pass negated if value attribute is not present", function () {
      expect(sandbox()).not.toHaveValue(value)
      expect(sandbox().get(0)).not.toHaveValue(value)
    })

    it("should not coerce types", function (){
      setFixtures($('<input id="sandbox" type="text" />').val(""))
      expect($('#sandbox')).not.toHaveValue(0)
    })
  })

  describe("toHaveData", function () {
    var key = 'some key'
    var value = 'some value'
    var wrongKey = 'wrong key'
    var wrongValue = 'wrong value'

    beforeEach(function () {
      setFixtures(sandbox().data(key, value))
    })

    describe("when only key is provided", function () {
      it("should pass if element has matching data key", function () {
        expect($('#sandbox')).toHaveData(key)
        expect($('#sandbox').get(0)).toHaveData(key)
      })

      it("should pass negated if element has no matching data key", function () {
        expect($('#sandbox')).not.toHaveData(wrongKey)
        expect($('#sandbox').get(0)).not.toHaveData(wrongKey)
      })
    })

    describe("when both key and value are provided", function () {
      it("should pass if element has matching key with matching value", function () {
        expect($('#sandbox')).toHaveData(key, value)
        expect($('#sandbox').get(0)).toHaveData(key, value)
      })

      it("should pass negated if element has matching key but with wrong value", function () {
        expect($('#sandbox')).not.toHaveData(key, wrongValue)
        expect($('#sandbox').get(0)).not.toHaveData(key, wrongValue)
      })

      it("should pass negated if element has no matching key", function () {
        expect($('#sandbox')).not.toHaveData(wrongKey, value)
        expect($('#sandbox').get(0)).not.toHaveData(wrongKey, value)
      })
    })

    describe("when the value is a JSON object", function() {
      var objectKey = 'object-key'
      var objectValue = {'foo': 'bar'}
      var objectString = '[object Object]'

      beforeEach(function() {
        setFixtures(sandbox().data(objectKey, objectValue))
      })

      it("should pass if element has matching key with matching value", function () {
        expect($('#sandbox')).toHaveData(objectKey, objectValue)
        expect($('#sandbox').get(0)).toHaveData(objectKey, objectValue)
      })

      it("should not pass if element has matching key but the value is just a string representation of the value", function () {
        expect($('#sandbox')).not.toHaveData(objectKey, objectString)
        expect($('#sandbox').get(0)).not.toHaveData(objectKey, objectString)
      })

      it("should not pass if element has matching key but the value is just a string representation of the value", function () {
        setFixtures('<div id="foo" div data-bar="[object Object]"></div>')
        expect($('#foo')).not.toHaveData('bar', { 'answer': 42 })
        expect($('#foo').get(0)).not.toHaveData('bar', { 'answer': 42 })
      })
    })
  })

  describe("toBeVisible", function () {
    it("should pass on visible element", function () {
      setFixtures(sandbox())
      expect($('#sandbox')).toBeVisible()
      expect($('#sandbox').get(0)).toBeVisible()
    })

    it("should pass negated on hidden element", function () {
      setFixtures(sandbox().hide())
      expect($('#sandbox')).not.toBeVisible()
      expect($('#sandbox').get(0)).not.toBeVisible()
    })
  })

  describe("toBeHidden", function () {
    it("should pass on hidden element", function () {
      setFixtures(sandbox().hide())
      expect($('#sandbox')).toBeHidden()
      expect($('#sandbox').get(0)).toBeHidden()
    })

    it("should pass negated on visible element", function () {
      setFixtures(sandbox())
      expect($('#sandbox')).not.toBeHidden()
      expect($('#sandbox').get(0)).not.toBeHidden()
    })
  })

  describe("toBeSelected", function () {
    beforeEach(function () {
      setFixtures('\
        <select>\n\
          <option id="not-selected"></option>\n\
          <option id="selected" selected="selected"></option>\n\
        </select>')
    })

    it("should pass on selected element", function () {
      expect($('#selected')).toBeSelected()
      expect($('#selected').get(0)).toBeSelected()
    })

    it("should pass negated on not selected element", function () {
      expect($('#not-selected')).not.toBeSelected()
      expect($('#not-selected').get(0)).not.toBeSelected()
    })
  })

  describe("toBeChecked", function () {
    beforeEach(function () {
      setFixtures('\
        <input type="checkbox" id="checked" checked="checked" />\n\
        <input type="checkbox" id="not-checked" />\n\
        <input type="radio" name="radio-name" id="radio-checked" checked="checked" />')
    })

    it("should pass on checked element", function () {
      expect($('#checked')).toBeChecked()
      expect($('#checked').get(0)).toBeChecked()
    })

    it("should pass negated on not checked element", function () {
      expect($('#not-checked')).not.toBeChecked()
      expect($('#not-checked').get(0)).not.toBeChecked()
    })

    it("shoud not change the checked status of a radio button", function () {
      expect($('#radio-checked')).toBeChecked()
      expect($('#radio-checked')).toBeChecked()
    })
  })

  describe("toBeEmpty", function () {
    it("should pass on empty element", function () {
      setFixtures(sandbox())
      expect($('#sandbox')).toBeEmpty()
      expect($('#sandbox').get(0)).toBeEmpty()
    })

    it("should pass negated on element with a tag inside", function () {
      setFixtures(sandbox().html($('<span />')))
      expect($('#sandbox')).not.toBeEmpty()
      expect($('#sandbox').get(0)).not.toBeEmpty()
    })

    it("should pass negated on element with text inside", function () {
      setFixtures(sandbox().text('some text'))
      expect($('#sandbox')).not.toBeEmpty()
      expect($('#sandbox').get(0)).not.toBeEmpty()
    })
  })

  describe("toBeInDOM", function () {
    it("should pass on elements in the DOM", function () {
      setFixtures(sandbox())
      expect($('#sandbox')).toBeInDOM()
    })

    it("should pass negated on elements not in the DOM", function () {
      expect($('<div>')).not.toBeInDOM()
    })
  })

  describe("toExist", function () {
    it("should pass on visible element", function () {
      setFixtures(sandbox())
      expect($('#sandbox')).toExist()
      expect($('#sandbox').get(0)).toExist()
    })

    it("should pass on hidden element", function () {
      setFixtures(sandbox().hide())
      expect($('#sandbox')).toExist()
      expect($('#sandbox').get(0)).toExist()
    })

    it("should pass negated if element is not present in DOM", function () {
      expect($('#non-existent-element')).not.toExist()
      expect($('#non-existent-element').get(0)).not.toExist()
    })
  })

  describe("toHaveLength", function () {
    it("should pass on an object with more than zero items", function () {
      var $three = $('<div>').add('<span>').add("<pre>")
      expect($three.length).toBe(3)
      expect($three).toHaveLength(3)
    })

    it("should pass negated on an object with more than zero items", function () {
      var $three = $('<div>').add('<span>').add("<pre>")
      expect($three.length).toBe(3)
      expect($three).not.toHaveLength(2)
    })

    it("should pass on an object with zero items", function () {
      var $zero = $()
      expect($zero.length).toBe(0)
      expect($zero).toHaveLength(0)
    })

    it("should pass negated on an object with zero items", function () {
      var $zero = $()
      expect($zero.length).not.toBe(1)
      expect($zero).not.toHaveLength(1)
    })
  })

  describe("toEqual", function () {
    beforeEach(function () {
      setFixtures(sandbox())
    })

    it("should pass if object matches selector", function () {
      expect($('#sandbox')).toEqual('#sandbox')
      expect($('#sandbox').get(0)).toEqual('#sandbox')
    })

    it("should pass negated if object does not match selector", function () {
      expect($('#sandbox')).not.toEqual('#wrong-id')
      expect($('#sandbox').get(0)).not.toEqual('#wrong-id')
    })
  })

  describe("toContainElement", function () {
    beforeEach(function () {
      setFixtures(sandbox().html('<span />'))
    })

    it("should pass if object contains selector", function () {
      expect($('#sandbox')).toContainElement('span')
      expect($('#sandbox').get(0)).toContainElement('span')
    })

    it("should pass negated if object does not contain selector", function () {
      expect($('#sandbox')).not.toContainElement('div')
      expect($('#sandbox').get(0)).not.toContainElement('div')
    })
  })

  describe("toBeMatchedBy", function () {
    beforeEach(function () {
      setFixtures(sandbox().html('<span id="js-match"></span>'))
    })

    it("should pass if selector contains given selector", function () {
      expect($('#sandbox span')).toBeMatchedBy('#js-match')
    })

    it("should pass negated if selector does not contain given selector", function () {
      expect($('#sandbox span')).not.toBeMatchedBy('#js-match-not')
    })
  })

  describe("toBeDisabled", function () {
    beforeEach(function () {
      setFixtures('\
        <input type="text" disabled="disabled" id="disabled"/>\n\
        <input type="text" id="enabled"/>')
    })

    it("should pass on disabled element", function () {
      expect($('#disabled')).toBeDisabled()
      expect($('#disabled').get(0)).toBeDisabled()
    })

    it("should pass negated on not selected element", function () {
      expect($('#enabled')).not.toBeDisabled()
      expect($('#enabled').get(0)).not.toBeDisabled()
    })
  })

  describe("toBeFocused", function () {
    beforeEach(function () {
      setFixtures('<input type="text" id="focused"/>')
    })

    it("should pass on focused element", function () {
      var el = $("#focused").focus()
      expect(el).toBeFocused()
    })

    it("should pass negated on not focused element", function () {
      var el = $("#focused")
      expect(el).not.toBeFocused()
    })
  })

  describe('toHaveBeenTriggeredOn', function () {
    var spyEvents = {}
    beforeEach(function () {
      setFixtures(sandbox().html('<a id="clickme">Click Me</a> <a id="otherlink">Other Link</a>'))
      spyEvents['#clickme'] = spyOnEvent($('#clickme'), 'click')
      spyOnEvent(document, 'click')
      spyOnEvent($('#otherlink'), 'click')
    })

    it('should pass if the event was triggered on the object', function () {
      $('#clickme').click()
      expect('click').toHaveBeenTriggeredOn($('#clickme'))
      expect('click').toHaveBeenTriggeredOn('#clickme')
    })

    it('should pass if the event was triggered on document', function () {
      $(document).click()
      expect('click').toHaveBeenTriggeredOn($(document))
      expect('click').toHaveBeenTriggeredOn(document)
    })

    it('should pass if the event was triggered on a descendant of document', function () {
      $('#clickme').click()
      expect('click').toHaveBeenTriggeredOn($(document))
      expect('click').toHaveBeenTriggeredOn(document)
    })

    it('should pass negated if the event was never triggered', function () {
      expect('click').not.toHaveBeenTriggeredOn($('#clickme'))
      expect('click').not.toHaveBeenTriggeredOn('#clickme')
    })

    it('should pass negated if the event was triggered on another non-descendant object', function () {
      $('#otherlink').click()
      expect('click').not.toHaveBeenTriggeredOn($('#clickme'))
      expect('click').not.toHaveBeenTriggeredOn('#clickme')
    })

    it('should pass if the event call count is incremented', function () {
      expect(spyEvents['#clickme'].calls.any()).toEqual(false);
      expect(spyEvents['#clickme'].calls.count()).toEqual(0);
      $('#clickme').click()
      expect('click').toHaveBeenTriggeredOn($('#clickme'))
      expect('click').toHaveBeenTriggeredOn('#clickme')
      expect(spyEvents['#clickme'].calls.count()).toEqual(1);
      expect(spyEvents['#clickme'].calls.any()).toEqual(true);
      $('#clickme').click()
      $('#clickme').click()
      expect(spyEvents['#clickme'].calls.count()).toEqual(3);
      expect(spyEvents['#clickme'].calls.any()).toEqual(true);
    })
  })

  describe('toHaveBeenTriggeredOnAndWith', function () {
    beforeEach(function () {
      spyOnEvent(document, 'event')
    })

    describe("when extra parameter is an object", function () {
      it('should pass if the event was triggered on the object with expected arguments', function () {
        $(document).trigger('event', { key1: "value1", key2: "value2" })
        expect('event').toHaveBeenTriggeredOnAndWith(document, { key1: "value1", key2: "value2" })
      })

      it('should pass negated if the event was never triggered', function () {
        expect('event').not.toHaveBeenTriggeredOnAndWith(document, { key1: "value1", key2: "value2" })
      })

      it('should pass negated if the event was triggered on another non-descendant object', function () {
        $(window).trigger('event', { key1: "value1", key2: "value2" })
        expect('event').not.toHaveBeenTriggeredOnAndWith(document, { key1: "value1", key2: "value2" })
      })

      it('should pass negated if the event was triggered but the arguments do not match with the expected arguments', function () {
        $(document).trigger('event', { key1: "value1" })
        expect('event').not.toHaveBeenTriggeredOnAndWith(document, { key1: "value1", key2: "value2" })
        $(document).trigger('event', { key1: "value1", key2: "value2" })
        expect('event').not.toHaveBeenTriggeredOnAndWith(document, { key1: "value1" })
        $(document).trigger('event', { key1: "different value" })
        expect('event').not.toHaveBeenTriggeredOnAndWith(document, { key1: "value1" })
        $(document).trigger('event', { different_key: "value1" })
        expect('event').not.toHaveBeenTriggeredOnAndWith(document, { key1: "value1" })
      })

      it('should pass if the arguments match using jasmine.objectContaining', function () {
        $(document).trigger('event', { key1: "value1", key2: "value2" })
        expect('event').toHaveBeenTriggeredOnAndWith(document, jasmine.objectContaining({ key1: "value1" }))
      })
    })

    describe("when extra parameter is an array", function () {
      it('should pass if the event was triggered on the object with expected arguments', function () {
        $(document).trigger('event', [1, 2])
        expect('event').toHaveBeenTriggeredOnAndWith(document, [1, 2])
      })

      it('should pass negated if the event was never triggered', function () {
        expect('event').not.toHaveBeenTriggeredOnAndWith(document, [1, 2])
      })

      it('should pass negated if the event was triggered on another non-descendant object', function () {
        $(window).trigger('event', [1, 2])
        expect('event').not.toHaveBeenTriggeredOnAndWith(document, [1, 2])
      })

      it('should pass negated if the event was triggered but the arguments do not match with the expected arguments', function () {
        $(document).trigger('event', [1])
        expect('event').not.toHaveBeenTriggeredOnAndWith(document, [1, 2])
        $(document).trigger('event', [1, 2])
        expect('event').not.toHaveBeenTriggeredOnAndWith(document, [1])
        $(document).trigger('event', [1, 3])
        expect('event').not.toHaveBeenTriggeredOnAndWith(document, [1, 2])
      })
    })
  })

  describe('toHaveBeenTriggered', function () {
    var spyEvents = {}
    beforeEach(function () {
      setFixtures(sandbox().html('<a id="clickme">Click Me</a> <a id="otherlink">Other Link</a>'))
      spyEvents['#clickme'] = spyOnEvent($('#clickme'), 'click')
      spyEvents['#otherlink'] = spyOnEvent($('#otherlink'), 'click')
    })

    it('should pass if the event was triggered on the object', function () {
      $('#clickme').click()
      expect(spyEvents['#clickme']).toHaveBeenTriggered()
    })

    it('should pass negated if the event was never triggered', function () {
      expect(spyEvents['#clickme']).not.toHaveBeenTriggered()
    })

    it('should pass negated if the event was triggered on another non-descendant object', function () {
      $('#otherlink').click()
      expect(spyEvents['#clickme']).not.toHaveBeenTriggered()
    })

    it('should pass negated if the spy event was reset', function (){
      $('#clickme').click()
      expect('click').toHaveBeenTriggeredOn($('#clickme'))
      expect('click').toHaveBeenTriggeredOn('#clickme')
      expect(spyEvents['#clickme']).toHaveBeenTriggered()
      spyEvents['#clickme'].reset()
      expect('click').not.toHaveBeenTriggeredOn($('#clickme'))
      expect('click').not.toHaveBeenTriggeredOn('#clickme')
      expect(spyEvents['#clickme']).not.toHaveBeenTriggered()
    })

    it('should pass if the event call count is incremented', function () {
      expect(spyEvents['#clickme'].calls.any()).toEqual(false);
      expect(spyEvents['#clickme'].calls.count()).toEqual(0);
      $('#clickme').click()
      expect(spyEvents['#clickme']).toHaveBeenTriggered()
      expect(spyEvents['#clickme'].calls.count()).toEqual(1);
      expect(spyEvents['#clickme'].calls.any()).toEqual(true);
      $('#clickme').click()
      $('#clickme').click()
      expect(spyEvents['#clickme'].calls.count()).toEqual(3);
      expect(spyEvents['#clickme'].calls.any()).toEqual(true);
    })
  })

  describe('toHaveBeenPreventedOn', function () {
    beforeEach(function () {
      setFixtures(sandbox().html('<a id="clickme">Click Me</a> <a id="otherlink">Other Link</a>'))
      spyOnEvent($('#clickme'), 'click')
      spyOnEvent($('#otherlink'), 'click')
    })

    it('should pass if the event was prevented on the object', function () {
      $('#clickme').bind('click', function (event) {
        event.preventDefault()
      })
      $('#clickme').click()
      expect('click').toHaveBeenPreventedOn($('#clickme'))
      expect('click').toHaveBeenPreventedOn('#clickme')
    })

    it('should pass negated if the event was never prevented', function () {
      $('#clickme').click()
      expect('click').not.toHaveBeenPreventedOn($('#clickme'))
      expect('click').not.toHaveBeenPreventedOn('#clickme')
    })

    it('should pass negated if the event was prevented on another non-descendant object', function () {
      $('#otherlink').bind('click', function (event) {
        event.preventDefault()
      })
      $('#clickme').click()
      expect('click').not.toHaveBeenPreventedOn($('#clickme'))
    })
  })

  describe('toHaveBeenPrevented', function () {
    var spyEvents = {}
    beforeEach(function () {
      setFixtures(sandbox().html('<a id="clickme">Click Me</a> <a id="otherlink">Other Link</a>'))
      spyEvents['#clickme'] = spyOnEvent($('#clickme'), 'click')
      spyEvents['#otherlink'] = spyOnEvent($('#otherlink'), 'click')
    })

    it('should pass if the event was prevented on the object', function () {
      $('#clickme').bind('click', function (event) {
        event.preventDefault()
      })
      $('#clickme').click()
      expect(spyEvents['#clickme']).toHaveBeenPrevented()
    })

    it('should pass negated if the event was never prevented', function () {
      $('#clickme').click()
      expect(spyEvents['#clickme']).not.toHaveBeenPrevented()
    })

    it('should pass negated if the event was prevented on another non-descendant object', function () {
      $('#otherlink').bind('click', function (event) {
        event.preventDefault()
      })
      $('#clickme').click()
      expect(spyEvents['#clickme']).not.toHaveBeenPrevented()
    })

    it('should pass negated if nothing was triggered', function () {
      expect(spyEvents['#clickme']).not.toHaveBeenPrevented()
    })

  })

  describe('toHaveBeenStoppedOn', function () {
    beforeEach(function () {
      setFixtures(sandbox().html('<a id="clickme">Click Me</a> <a id="otherlink">Other Link</a>'))
      spyOnEvent($('#clickme'), 'click')
      spyOnEvent($('#otherlink'), 'click')
    })

    it('should pass if the event was stopped on the object', function () {
      $('#clickme').bind('click', function (event) {
        event.stopPropagation()
      })
      $('#clickme').click()
      expect('click').toHaveBeenStoppedOn($('#clickme'))
      expect('click').toHaveBeenStoppedOn('#clickme')
    })

    it('should pass negated if the event was never stopped', function () {
      $('#clickme').click()
      expect('click').not.toHaveBeenStoppedOn($('#clickme'))
      expect('click').not.toHaveBeenStoppedOn('#clickme')
    })

    it('should pass negated if the event was stopped on another non-descendant object', function () {
      $('#otherlink').bind('click', function (event) {
        event.stopPropagation()
      })
      $('#clickme').click()
      expect('click').not.toHaveBeenStoppedOn($('#clickme'))
    })
  })

  describe('toHaveBeenStopped', function () {
    var spyEvents = {}
    beforeEach(function () {
      setFixtures(sandbox().html('<a id="clickme">Click Me</a> <a id="otherlink">Other Link</a>'))
      spyEvents['#clickme'] = spyOnEvent($('#clickme'), 'click')
      spyEvents['#otherlink'] = spyOnEvent($('#otherlink'), 'click')
    })

    it('should pass if the event was stopped on the object', function () {
      $('#clickme').bind('click', function (event) {
        event.stopPropagation()
      })
      $('#clickme').click()
      expect(spyEvents['#clickme']).toHaveBeenStopped()
    })

    it('should pass negated if the event was never stopped', function () {
      $('#clickme').click()
      expect(spyEvents['#clickme']).not.toHaveBeenStopped()
    })

    it('should pass negated if the event was stopped on another non-descendant object', function () {
      $('#otherlink').bind('click', function (event) {
        event.stopPropagation()
      })
      $('#clickme').click()
      expect(spyEvents['#clickme']).not.toHaveBeenStopped()
    })

    it('should pass negated if nothing was triggered', function () {
      expect(spyEvents['#clickme']).not.toHaveBeenStopped()
    })
  })

  describe('toHandle', function () {
    var handler
    beforeEach(function () {
      setFixtures(sandbox().html('<a id="clickme">Click Me</a> <a id="otherlink">Other Link</a>'))
      handler = function (){}
    })

    it("should handle events on the window object", function (){
      $(window).bind("resize", handler)
      expect($(window)).toHandle("resize")
    })

    it('should pass if the event is bound', function () {
      $('#clickme').bind("click", handler)
      expect($('#clickme')).toHandle("click")
      expect($('#clickme').get(0)).toHandle("click")
    })

    it('should pass if the event is not bound', function () {
      expect($('#clickme')).not.toHandle("click")
      expect($('#clickme').get(0)).not.toHandle("click")
    })

    it('should pass if the namespaced event is bound', function (){
      $('#clickme').bind("click", handler); //another event for the click array
      $('#clickme').bind("click.NameSpace", handler)
      expect($('#clickme')).toHandle("click.NameSpace")
    })

    it('should not fail when events is empty', function () {
      $('#clickme').change(function () { })
      expect($('#clickme')).not.toHandle('click')
    })

    it('should recognize an event with multiple namespaces', function (){
      $('#clickme').bind("click.NSone.NStwo.NSthree", handler)
      expect($('#clickme')).toHandle("click.NSone")
      expect($('#clickme')).toHandle("click.NStwo")
      expect($('#clickme')).toHandle("click.NSthree")
      expect($('#clickme')).toHandle("click.NSthree.NStwo")
      expect($('#clickme')).toHandle("click.NStwo.NSone")
      expect($('#clickme')).toHandle("click")
    })

    it('should pass if a namespaced event is not bound', function () {
      $('#clickme').bind("click", handler); //non namespaced event
      $('#clickme').bind("click.OtherNameSpace", handler); //different namespaced event
      expect($('#clickme')).not.toHandle("click.NameSpace")
    })

    it('should handle event on any object', function (){
      var object = new function (){}
      $(object).bind('click', function (){})
      expect($(object)).toHandle('click')
    })

    it('should not fail when actual has no matches', function (){
        expect($('#notreal')).not.toHandle('click')
    })

    it('should not fail when actual is null', function (){
        expect(null).not.toHandle('click')
    })

  })

  describe('toHandleWith', function () {
    beforeEach(function () {
      setFixtures(sandbox().html('<a id="clickme">Click Me</a> <a id="otherlink">Other Link</a>'))
    })

    it('should pass if the event is bound with the given handler', function () {
      var handler = function (){}
      $('#clickme').bind("click", handler)
      expect($('#clickme')).toHandleWith("click", handler)
      expect($('#clickme').get(0)).toHandleWith("click", handler)
    })

    it('should pass if the event is not bound with the given handler', function () {
      var handler = function (){}
      $('#clickme').bind("click", handler)

      var aDifferentHandler = function (){}
      expect($('#clickme')).not.toHandleWith("click", aDifferentHandler)
      expect($('#clickme').get(0)).not.toHandleWith("click", aDifferentHandler)
    })

    it('should pass if the event is not bound at all', function () {
      expect($('#clickme')).not.toHandle("click")
      expect($('#clickme').get(0)).not.toHandle("click")
    })

    it("should pass if the event on window is bound with the given handler", function (){
      var handler = function (){}
      $(window).bind("resize", handler)
      expect($(window)).toHandleWith("resize", handler)
    })

    it("should pass if the event on any object is bound with the given handler", function (){
      var object = new function (){}
      var handler = function (){}
      $(object).bind('click', handler)
      expect($(object)).toHandleWith('click', handler)
    })

    it("should pass if the namespaced event is bound with the given handler", function () {
      var handler = function (){}
      $('#clickme').bind("click.namespaced", handler)
      expect($('#clickme')).toHandleWith("click.namespaced", handler)
      expect($('#clickme').get(0)).toHandleWith("click.namespaced", handler)
    })

    it('should pass if the namespaced event is not bound with the given handler', function () {
      var handler = function (){}
      $('#clickme').bind("click", handler)

      var aDifferentHandler = function (){}
      expect($('#clickme')).not.toHandleWith("click.namespaced", aDifferentHandler)
      expect($('#clickme').get(0)).not.toHandleWith("click.namespaced", aDifferentHandler)
    })

    it('should pass if the namespaced event is not bound at all', function () {
      expect($('#clickme')).not.toHandle("click.namespaced")
      expect($('#clickme').get(0)).not.toHandle("click.namespaced")
    })

    it("should pass if the namespaced event on window is bound with the given handler", function (){
      var handler = function (){}
      $(window).bind("resize.namespaced", handler)
      expect($(window)).toHandleWith("resize.namespaced", handler)
    })

    it("should pass if the namespaced event on any object is bound with the given handler", function (){
      var object = new function (){}
      var handler = function (){}
      $(object).bind('click.namespaced', handler)
      expect($(object)).toHandleWith('click.namespaced', handler)
    })

    it('should not fail when actual has no matches', function (){
      expect($('#notreal')).not.toHandleWith('click')
    })

    it('should not fail when actual is null', function (){
      expect(null).not.toHandleWith('click')
    })

  })
})

describe("jasmine.StyleFixtures", function () {
  var ajaxData = 'some ajax data'
  var fixtureUrl = 'some_url'
  var anotherFixtureUrl = 'another_url'
  var fixturesContainer = function () {
    return $('head style').last()
  }

  beforeEach(function () {
    jasmine.getStyleFixtures().clearCache()
    spyOn(jasmine.StyleFixtures.prototype, 'loadFixtureIntoCache_').and.callFake(function (relativeUrl){
      this.fixturesCache_[relativeUrl] = ajaxData
    })
  })

  describe("default initial config values", function () {
    it("should set 'spec/javascripts/fixtures' as the default style fixtures path", function () {
      expect(jasmine.getStyleFixtures().fixturesPath).toEqual('spec/javascripts/fixtures')
    })
  })

  describe("load", function () {
    it("should insert CSS fixture within style tag into HEAD", function () {
      var stylesNumOld = $('head style').length

      jasmine.getStyleFixtures().load(fixtureUrl)
      expect($('head style').length - stylesNumOld).toEqual(1)
      expect(fixturesContainer().html()).toEqual(ajaxData)
    })

    it("should insert duplicated CSS fixture into one style tag when the same url is provided twice in a single call", function () {
      jasmine.getStyleFixtures().load(fixtureUrl, fixtureUrl)
      expect(fixturesContainer().html()).toEqual(ajaxData + ajaxData)
    })

    it("should insert merged CSS of two fixtures into one style tag when two different urls are provided in a single call", function () {
      jasmine.getStyleFixtures().load(fixtureUrl, anotherFixtureUrl)
      expect(fixturesContainer().html()).toEqual(ajaxData + ajaxData)
    })

    it("should have shortcut global method loadStyleFixtures", function () {
      loadStyleFixtures(fixtureUrl, anotherFixtureUrl)
      expect(fixturesContainer().html()).toEqual(ajaxData + ajaxData)
    })
  })

  describe("appendLoad", function () {
    beforeEach(function (){
      ajaxData = 'some ajax data'
    })

    it("should insert CSS fixture within style tag into HEAD", function () {
      var stylesNumOld = $('head style').length

      jasmine.getStyleFixtures().appendLoad(fixtureUrl)
      expect($('head style').length - stylesNumOld).toEqual(1)
      expect(fixturesContainer().html()).toEqual(ajaxData)
    })

    it("should insert duplicated CSS fixture into one style tag when the same url is provided twice in a single call", function () {
      jasmine.getStyleFixtures().appendLoad(fixtureUrl, fixtureUrl)
      expect(fixturesContainer().html()).toEqual(ajaxData + ajaxData)
    })

    it("should insert merged CSS of two fixtures into one style tag when two different urls are provided in a single call", function () {
      jasmine.getStyleFixtures().appendLoad(fixtureUrl, anotherFixtureUrl)
      expect(fixturesContainer().html()).toEqual(ajaxData + ajaxData)
    })

    it("should have shortcut global method appendLoadStyleFixtures", function () {
      appendLoadStyleFixtures(fixtureUrl, anotherFixtureUrl)
      expect(fixturesContainer().html()).toEqual(ajaxData + ajaxData)
    })

    describe("with a prexisting fixture",function (){
      beforeEach(function () {
        jasmine.getStyleFixtures().appendLoad(fixtureUrl)
      })

      it("should add new content within new style tag in HEAD", function () {
        jasmine.getStyleFixtures().appendLoad(anotherFixtureUrl)
        expect(fixturesContainer().html()).toEqual(ajaxData)
      })

      it("should not delete prexisting fixtures", function () {
        jasmine.getStyleFixtures().appendLoad(anotherFixtureUrl)
        expect(fixturesContainer().prev().html()).toEqual(ajaxData)
      })
    })
  })

  describe("preload", function () {
    describe("load after preload", function () {
      it("should go from cache", function () {
        jasmine.getStyleFixtures().preload(fixtureUrl, anotherFixtureUrl)
        jasmine.getStyleFixtures().load(fixtureUrl, anotherFixtureUrl)
        expect(jasmine.StyleFixtures.prototype.loadFixtureIntoCache_.calls.count()).toEqual(2)
      })

      it("should return correct CSSs", function () {
        jasmine.getStyleFixtures().preload(fixtureUrl, anotherFixtureUrl)
        jasmine.getStyleFixtures().load(fixtureUrl, anotherFixtureUrl)
        expect(fixturesContainer().html()).toEqual(ajaxData + ajaxData)
      })
    })

    it("should not preload the same fixture twice", function () {
      jasmine.getStyleFixtures().preload(fixtureUrl, fixtureUrl)
      expect(jasmine.StyleFixtures.prototype.loadFixtureIntoCache_.calls.count()).toEqual(1)
    })

    it("should have shortcut global method preloadStyleFixtures", function () {
      preloadStyleFixtures(fixtureUrl, anotherFixtureUrl)
      expect(jasmine.StyleFixtures.prototype.loadFixtureIntoCache_.calls.count()).toEqual(2)
    })
  })

  describe("set", function () {
    var css = 'body { color: red }'

    it("should insert CSS within style tag into HEAD", function () {
      var stylesNumOld = $('head style').length

      jasmine.getStyleFixtures().set(css)
      expect($('head style').length - stylesNumOld).toEqual(1)
      expect(fixturesContainer().html()).toEqual(css)
    })

    it("should have shortcut global method setStyleFixtures", function () {
      setStyleFixtures(css)
      expect(fixturesContainer().html()).toEqual(css)
    })
  })

  describe("appendSet",function (){
    var css = 'body { color: red }'

    it("should insert CSS within style tag into HEAD", function () {
      var stylesNumOld = $('head style').length

      jasmine.getStyleFixtures().appendSet(css)
      expect($('head style').length - stylesNumOld).toEqual(1)
      expect(fixturesContainer().html()).toEqual(css)
    })

    it("should have shortcut global method appendSetStyleFixtures", function () {
      appendSetStyleFixtures(css)
      expect(fixturesContainer().html()).toEqual(css)
    })

    describe("when fixture container exists", function () {
      beforeEach(function () {
        jasmine.getStyleFixtures().appendSet(css)
      })

      it("should add new content within new style tag in HEAD", function () {
        jasmine.getStyleFixtures().appendSet(css)
        expect(fixturesContainer().html()).toEqual(css)
      })

      it("should not delete prexisting fixtures", function () {
        jasmine.getStyleFixtures().appendSet(css)
        expect(fixturesContainer().prev().html()).toEqual(css)
      })
    })
  })

  describe("cleanUp", function () {
    it("should remove CSS fixtures from DOM", function () {
      var stylesNumOld = $('head style').length

      jasmine.getStyleFixtures().load(fixtureUrl, anotherFixtureUrl)
      jasmine.getStyleFixtures().cleanUp()

      expect($('head style').length).toEqual(stylesNumOld)
    })
  })

  describe("automatic DOM clean-up between tests", function () {
    var stylesNumOld = $('head style').length

    // WARNING: this test must be invoked first (before 'SECOND TEST')!
    it("FIRST TEST: should pollute the DOM", function () {
      jasmine.getStyleFixtures().load(fixtureUrl)
      expect($('head style').length).toEqual(stylesNumOld + 1)
    })

    // WARNING: this test must be invoked second (after 'FIRST TEST')!
    it("SECOND TEST: should see the DOM in a blank state", function () {
      expect($('head style').length).toEqual(stylesNumOld)
    })
  })
})

describe("jasmine.StyleFixtures using real AJAX call", function () {
  var defaultFixturesPath

  beforeEach(function () {
    defaultFixturesPath = jasmine.getStyleFixtures().fixturesPath
    jasmine.getStyleFixtures().fixturesPath = 'spec/fixtures'
  })

  afterEach(function () {
    jasmine.getStyleFixtures().fixturesPath = defaultFixturesPath
  })

  describe("when fixture file exists", function () {
    var fixtureUrl = "real_non_mocked_fixture_style.css"

    it("should load content of fixture file", function () {
      jasmine.getStyleFixtures().load(fixtureUrl)
      expect($('head style').last().html()).toEqual('body { background: red; }')
    })
  })
})

describe("jasmine.JSONFixtures", function () {
  var ajaxData = {a:1, b:2, arr: [1,2,'stuff'], hsh: { blurp: 8, blop: 'blip' }}
  var moreAjaxData = [1,2,'stuff']
  var fixtureUrl = 'some_json'
  var anotherFixtureUrl = 'another_json'
  var _sortedKeys = function (obj) {
    var arr = []
    for(var k in obj) arr.push(k)
    return arr.sort()
  }

  beforeEach(function () {
    jasmine.getJSONFixtures().clearCache()
    spyOn(jasmine.JSONFixtures.prototype, 'loadFixtureIntoCache_').and.callFake(function (relativeUrl){
      fakeData = {}
      // we put the data directly here, instead of using the variables to simulate rereading the file
      fakeData[fixtureUrl] = {a:1, b:2, arr: [1,2,'stuff'], hsh: { blurp: 8, blop: 'blip' }}
      fakeData[anotherFixtureUrl] = [1,2,'stuff']
      this.fixturesCache_[relativeUrl] = fakeData[relativeUrl]
    })
  })

  describe("default initial config values", function () {
    it("should set 'spec/javascripts/fixtures/json' as the default style fixtures path", function () {
      expect(jasmine.getJSONFixtures().fixturesPath).toEqual('spec/javascripts/fixtures/json')
    })
  })

  describe("load", function () {
    it("should load the JSON data under the key 'fixture_url'", function () {
      data = jasmine.getJSONFixtures().load(fixtureUrl)
      expect(_sortedKeys(data)).toEqual([fixtureUrl])
      expect(data[fixtureUrl]).toEqual(ajaxData)
    })

    it("should load the JSON data under the key 'fixture_url', even if it's loaded twice in one call", function () {
      data = jasmine.getJSONFixtures().load(fixtureUrl, fixtureUrl)
      expect(_sortedKeys(data)).toEqual([fixtureUrl])
    })

    it("should load the JSON data under 2 keys given two files in a single call", function () {
      data = jasmine.getJSONFixtures().load(anotherFixtureUrl, fixtureUrl)
      expect(_sortedKeys(data)).toEqual([anotherFixtureUrl, fixtureUrl])
      expect(data[anotherFixtureUrl]).toEqual(moreAjaxData)
      expect(data[fixtureUrl]).toEqual(ajaxData)
    })

    it("should have shortcut global method loadJSONFixtures", function () {
      data = loadJSONFixtures(fixtureUrl, anotherFixtureUrl)
      expect(_sortedKeys(data)).toEqual([anotherFixtureUrl, fixtureUrl])
      expect(data[anotherFixtureUrl]).toEqual(moreAjaxData)
      expect(data[fixtureUrl]).toEqual(ajaxData)
    })
  })

  describe('getJSONFixture', function () {
    it("fetches the fixture you ask for", function () {
      expect(getJSONFixture(fixtureUrl)).toEqual(ajaxData)
      expect(jasmine.JSONFixtures.prototype.loadFixtureIntoCache_).toHaveBeenCalled()
      expect(getJSONFixture(anotherFixtureUrl)).toEqual(moreAjaxData)
      expect(jasmine.JSONFixtures.prototype.loadFixtureIntoCache_.calls.count()).toEqual(2)
    })

    it("retrieves from cache on subsequent requests for the same fixture", function () {
      expect(getJSONFixture(fixtureUrl)).toEqual(ajaxData)
      expect(jasmine.JSONFixtures.prototype.loadFixtureIntoCache_.calls.count()).toEqual(1)
      expect(getJSONFixture(fixtureUrl)).toEqual(ajaxData)
      expect(jasmine.JSONFixtures.prototype.loadFixtureIntoCache_.calls.count()).toEqual(1)
    })
  })

  describe("reloading data will restore the fixture data", function () {
    var data
    beforeEach(function () {
      data = jasmine.getJSONFixtures().load(anotherFixtureUrl)[anotherFixtureUrl]
    })
    // WARNING: this test must be invoked first (before 'SECOND TEST')!
    it("FIRST TEST: should pollute the fixture data", function () {
      data.push('moredata')
      expect(data.length).toEqual(4)
    })

    // WARNING: this test must be invoked second (after 'FIRST TEST')!
    it("SECOND TEST: should see cleansed JSON fixture data", function () {
      expect(data.length).toEqual(3)
    })
  })
})

describe("jasmine.JSONFixtures using real AJAX call", function () {
  var defaultFixturesPath

  beforeEach(function () {
    defaultFixturesPath = jasmine.getJSONFixtures().fixturesPath
    jasmine.getJSONFixtures().fixturesPath = 'spec/fixtures/json'
  })

  afterEach(function () {
    jasmine.getJSONFixtures().fixturesPath = defaultFixturesPath
  })

  describe("when fixture file exists", function () {
    var fixtureUrl = "jasmine_json_test.json"

    it("should load content of fixture file", function () {
      data = jasmine.getJSONFixtures().load(fixtureUrl)
      expect(data[fixtureUrl]).toEqual([1,2,3])
    })
  })
})

describe("jasmine.Env.equalityTesters_", function () {
  describe("jQuery object tester", function () {
    beforeEach(function () {
      setFixtures(sandbox())
    })

    it("should equate the same element with different selectors", function () {
      expect($('#sandbox')).toEqual($('div#sandbox'))
    })

    it("should equate jquery objects that match a set of elements", function () {
      $('#sandbox').append($('<div></div>'))
      $('#sandbox').append($('<div></div>'))
      expect($('#sandbox div')).toEqual($('div#sandbox div'))
    })

    it("should not equate jquery objects that match a set of elements where one has an extra", function () {
      $('#sandbox').append($('<div></div>'))
      $('#sandbox').append($('<div></div>'))
      $('#sandbox').append($('<span></span>'))
      expect($('#sandbox div')).not.toEqual($('div#sandbox div, div#sandbox span'))
    })

    it("should not equate jquery objects that match a set of elements of the same type where the tag types are the same, but they are not the same DOM elements", function () {
      $('#sandbox').append($('<div class="one"></div>'))
      $('#sandbox').append($('<span class="one"></span>'))
      $('#sandbox').append($('<div class="two"></div>'))
      $('#sandbox').append($('<span class="two"></span>'))
      expect($('.one')).not.toEqual($('.two').first())
    })

    it("should not equate jquery objects that match a set of elements of the same type where one is missing a single element", function () {
      $('#sandbox').append($('<div></div>'))
      $('#sandbox').append($('<div></div>'))
      expect($('#sandbox div')).not.toEqual($('div#sandbox div').first())
    })
  })
});
