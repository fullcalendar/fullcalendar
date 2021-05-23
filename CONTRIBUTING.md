
## Reporting Bugs

Each bug report MUST have a [Codepen/JSFiddle] recreation before any work can begin. [further instructions &raquo;](http://fullcalendar.io/wiki/Reporting-Bugs/)


## Requesting Features

Please search the [Issue Tracker] to see if your feature has already been requested, and if so, subscribe to it. Otherwise, read these [further instructions &raquo;](http://fullcalendar.io/wiki/Requesting-Features/)


## Contributing Features

The FullCalendar project welcomes [Pull Requests][Using Pull Requests] for new features, but because there are so many feature requests (over 100), and because every new feature requires refinement and maintenance, each PR will be prioritized against the project's other demands and might take a while to make it to an official release.

Furthermore, each new feature should be designed as robustly as possible and be useful beyond the immediate usecase it was initially designed for. Feel free to start a ticket discussing the feature's specs before coding.


## Contributing Bugfixes

In the description of your [Pull Request][Using Pull Requests], please include recreation steps for the bug as well as a [JSFiddle/JSBin] demo. Communicating the buggy behavior is a requirement before a merge can happen.


## Contributing Locales

Please edit the original files in the `packages/core/locales/` directory.


## Other Ways to Contribute

[Read about other ways to contribute &raquo;](http://fullcalendar.io/wiki/Contributing/)


## Getting Set Up

You will need a bash-like environment with [Git][git], [Node][node] and [Yarn][yarn] installed.

Then, clone FullCalendar's git repo:

	git clone --recursive git://github.com/fullcalendar/fullcalendar.git

The recursive flag will clone all submodules as well. fullcalendar-scheduler and the example projects are located within submodules.

Enter the directory and install FullCalendar's dependencies. You **must** use yarn. NPM will not work.

	cd fullcalendar
	yarn install

This has been tested on Mac, Linux, and Windows via ["Ubuntu on Windows"](https://ubuntu.com/wsl).


## Development Workflow

After you make code changes, you'll want to compile the JS/CSS so that it can be previewed from the tests and examples. You can either manually rebuild each time you make a change:

	yarn build

Or, you can run a script that automatically rebuilds whenever you save a source file:

	yarn watch

If you want to clean up the generated files, run:

	yarn clean


## Running Test

To run the Karma tests, you must first run `yarn watch`. Then, in separate console, run:

  yarn test

You will be given a URL to visit in your browser. When you visit this URL the tests will automatically run.

If you want to execute the tests headlessly, run:

  yarn test:ci


## Git

Because this repo has a few git submodules, it will be very convenient to set your default `git push` behavior to be recursive. Do something like this:

```
git config --global push.recurseSubmodules on-demand
```


## Linting

Run the command line tool to automatically check your code style:

	yarn lint


## Before Submitting your Code

If you have edited code (including **tests** and **translations**) and would like to submit a pull request, please make sure you have done the following:

1. Conformed to the style guide (successfully run `yarn lint`)

2. Written automated tests. View the [Automated Test Readme]



[Codepen/JSFiddle]: http://fullcalendar.io/wiki/Reporting-Bugs/
[Issue Tracker]: https://github.com/fullcalendar/fullcalendar/issues
[Using Pull Requests]: https://help.github.com/articles/using-pull-requests/
[MomentJS locale data]: https://github.com/moment/moment/tree/develop/locale
[git]: http://git-scm.com/
[node]: http://nodejs.org/
[yarn]: https://yarnpkg.com/
[Google JavaScript Style Guide]: https://google.github.io/styleguide/jsguide.html
[Automated Test Readme]: https://github.com/fullcalendar/fullcalendar/wiki/Automated-Tests
