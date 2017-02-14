# jasmine-fixture

[![Build Status](https://travis-ci.org/searls/jasmine-fixture.svg?branch=master)](https://travis-ci.org/searls/jasmine-fixture)

jasmine-fixture helps you write specs that interact with the DOM by making it easier to inject (and then clean up) HTML fixtures using a syntax that's just like jQuery's selectors. (As a result, it requires jQuery.)

**[Download the latest version here](https://github.com/searls/jasmine-fixture/releases)**.

# The concept

Here's one way to think about it:

In *jQuery*, you give `$()` a CSS selector and it *finds* elements on the DOM.

In *jasmine-fixture*, you give `affix()` a CSS selector and it *adds* those elements to the DOM.

This is very useful for tests, because it means that after setting up the state of the DOM with `affix`, your subject code under test will have the elements it needs to do its work.

Finally, jasmine-fixture will help you avoid test pollution by tidying up and remove everything you affix to the DOM after each spec runs.

## affix() example

Let's say you want to write a Jasmine spec for some code that needs to select elements from the DOM with jQuery:

``` javascript
$('#toddler .hidden.toy input[name="toyName"][value="cuddle bunny"]')
```

In the good ol' days of manually crafting your HTML fixtures, you'd have to append some raw HTML to the DOM like this:

``` javascript
beforeEach(function(){
  $('<div id="toddler"><div class="hidden toy"><input name="toyName" value="cuddle bunny"></div></div>').appendTo('body');
});

afterEach(function(){
  $('#toddler').remove()
});
```

But jasmine-fixture's `affix` method lets you do this instead:

``` javascript
beforeEach(function(){
  affix('#toddler .hidden.toy input[name="toyName"][value="cuddle bunny"]')
});

```

That's right, the spec setup above was able to *re-use the exact same ugly jQuery selector* and everything just worked! That means:

* No external (or worse, shared) fixture files means no risk that they become dumping grounds
* The spec can remain comprehensive (meaning that future readers can understand what the code does without referencing an external file)
* Less temptation to couple your unit test to your server or client-side HTML templates
* More one-line setup, fewer multi-line globs of HTML crowding out the behavior your spec is trying to describe

Bottom line: it's just like jQuery, but in reverse! (And, of course, it'll clean up after itself after your spec runs.)

## affixing the affixed by chaining invocations

`#affix` is both a globally available property on the `window` as well as a jQuery plugin that can be chained with existing jQuery objects (affixing itself beneath their results).

Let's say our subject has a `$container` element that's been added to the DOM like this:

``` javascript
var $container = affix('.container')
```

That means we can add things to the container by chaining a call to `affix`, like any other jQuery plugin:

``` javascript
var $content = $container.affix('#content')
```

Now our container with the class "container" has some content with the ID "content". Huzzah!

Note that for easy assignability, affix will always return the topmost element of the thing that it just appended, which in this example is `<div id="content"></div>` (which runs counter to most jQuery plugins, which return the original jQuery object).

## more examples

I heard you wanted more examples, so I pulled some from `affix`'s [specs](https://github.com/searls/jasmine-fixture/blob/master/spec/affix-spec.coffee).

``` coffeescript
'span'                                                                  #<span></span>
'.foo'                                                                  #<div class="foo"></div>
'.foo-hah'                                                              #<div class="foo-hah"></div>
'#baz'                                                                  #<div id="baz"></div>
'h1.foo'                                                                #<h1 class="foo"></h1>
'h2#baz'                                                                #<h2 id="baz"></h2>
'h3#zing.zoom'                                                          #<h3 id="zing" class="zoom"></h3>
'h4.zoom#zing'                                                          #<h4 id="zing" class="zoom"></h4>
'div span ul li'                                                        #<div><span><ul><li></li></ul></span></div>
'a b c d e f g h i j k l m n o p q r s t u v w x y z'                   #<a><b><c><d><e><f><g><h><i><j><k><l><m><n><o><p><q><r><s><t><u><v><w><x><y><z></z></y></x></w></v></u></t></s></r></q></p></o></n></m></l></k></j></i></h></g></f></e></d></c></b></a>
'.boom.bang.pow#whoosh'                                                 #<div id="whoosh" class="boom bang pow"></div>
'#foo .panda'                                                           #<div id="foo"><div class="panda"></div></div>
'input#man .restroom'                                                   #<input id="man"></input>
'.pants.zipper'                                                         #<div class="pants zipper"></div>
'foo > bar > baz'                                                       #<foo><bar><baz></baz></bar></foo>
'input[value="12"]'                                                     #<input value="12">
'div[class="class1 class2 class3"] span[div="div1 div2 div3"]'          #<div class="class1 class2 class3"><span div="div1 div2 div3"></span></div>
'form fieldset[name=ok] input#foo.sp1.sp1[foo="woo"][value="13"]'       #<form><fieldset name="ok"><input foo="woo" value="13" id="foo" class="sp1 sp1"></fieldset></form>
'[name="foo"][bar="baz"]'                                               #<name name="foo" bar="baz"></name>
'div[data-bind="my_item"]'                                              #<div data-bind="my_item"></div>
'.ui-dialog[style="width: 1px; height: 5px"]'                           #<div style="width: 1px; height: 5px" class="ui-dialog"></div>
'#toddler .hidden.toy input[name="toyName"][value="cuddle bunny"]'      #<div id="toddler"><div class="hidden toy"><input name="toyName" value="cuddle bunny"></div></div>
'div h1+h2'                                                             #<div><h1></h1><h2></h2></div>
```
# Contributing

1. `npm install -g lineman` if you don't already have lineman installed.
2. `lineman build`
3. `lineman spec` to run the fast, isolated specs.
4. Add your feature or bug fix on a feature branch, with tests.
5. Submit a pull request.

# Thanks

* Thanks to Sergey Chikuyonok <serge.che@gmail.com> for creating
[Emmet](http://emmet.io), which is what jasmine-fixture 2.x (& up?) uses to
parse css selectors into markup
* I want to offer thanks to Mike Kent, whose [JavaScript port of
ZenCoding](https://github.com/zodoz/jquery-ZenCoding) was the basis for parsing
most of this (classes, ids, elements, etc.) in version 1.x.
* I also want to thank [Peter Kananen](https://twitter.com/#!/pkananen), for pairing with me on the initial spike of the `affix` method.
