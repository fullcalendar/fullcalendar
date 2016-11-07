# jQuery.simulate()

Simulate events to help unit test user interactions.

Project Status
--------------

jquery-simulate is in use by projects of the jQuery Foundation, but isn't under active development. Usually issues are addressed by members of the jQuery UI team when they're affected, while other pull requests linger and get stale. We hesitate to put more time into this project, since its future is unclear.

Specifically we're hoping for the WebDriver API to become a much better solution. We're currently experiementing with that, via [Intern](http://theintern.io/) on [PEP](https://github.com/jquery/pep)).

That said, this project is stable and should work fine. Just keep the above in mind before using it.

How to build
------------

If you don't yet have grunt installed:

```sh
npm install -g grunt-cli
```

Then:
```sh
npm install
grunt
```

How to test
-----------

Open the `test/index.html` in a browser.
