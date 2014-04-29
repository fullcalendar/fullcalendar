# Intro

FullCalendar is moving from cumbersome manual tests (which reside in the `/tests/` folder) to fully automated tests (which reside in the `/tests/automated/` folder). The goal is to have a test file for each individual "thing" (option, callback, API method, rendering behavior, whatever) that tests the entirety of its functionality.

The test suite leverages the [Karma Test Runner][Karma]. This is the thing that runs the tests in various browswers and environments. The actual tests themselves are written with Jasmine:

> [Jasmine Introduction]


# Development Tools

To run automated tests, you must first install the `karma` command line utility globally:

	npm install -g karma-cli

Then, assuming all your source files have been built (via `grunt dev` or `build/watch`), you can run the tests from a browser (this will output a URL that you can visit):

	karma start --single-run

Alternatively, you can run the tests headlessly:

	karma start --single-run --browsers PhantomJS


# Collaboration Resources

Please join the FullCalendar group:

> ["FullCalendar Development" Google Group][Google Group]

You will be approved and then given access to other necessary documents.

At least initially, we will have multiple people writing tests concurrently. I have set up a Google Docs spreadsheet as a low-tech means of keeping track of who is assigned to a what tests, status of each tests, and special notes on what to test. The spreadsheet can be found here:

> [Tests Spreadsheet](https://docs.google.com/spreadsheet/ccc?key=0Aq5L0JhW6heOdDRsMWM3akQxN2Q4QV9pNDI1TTlpNHc&usp=sharing)

The spreadsheet can be viewed by anyone but it can only be modified by people who have been given permission. Once you join the Google Group you will soon be sent an invitation to modify the spreadsheet.


# Workflow

Once you are set up with the spreadsheet, there is the procedure for claiming/submitting tests:

1. Find a test that has not been claimed. Unclaimed tests will have an empty **Tester** column. Enter your name. **Please start with tests that have a Milestone of 2!** We are trying to get v2.0 functionality under test before anything else.

2. Enter the **Status** column as "in progress".

3. Consult the relevant [documentation][FullCalendar Documentation] and wrap your head around all of the behaviors, both obvious and subtle.

4. Look at the **Notable things to test** column for any gotchas or clarifications.

5. Create one `.js` file per "thing" you are testing. Put it in the top-level `/tests/automated/` directory. Please do not make nested folders.

6. Write the tests. Look at other tests in the directory for inspiration on how a test file is laid out.

7. Make sure your tests pass. Run the `karma` commands mentioned above.

8. Submit your code as a pull request to the main FullCalendar repo. [How to create a PR].

9. Change the **Status** column to "pr".

10. Someone will review the tests to make sure they are cool. When that is done they will either change the status to "merged" if it is good, or to "feedback". Feedback on necessary changes will be written into the **Notable things to tests column**. The reviewer will contact you back. Make your changes and then resubmit the PR. Repeat until all is good.


# Organizing your tests

In each tests file, you should write individual tests that isolate one specific behavior about the given "thing" (option, callback, method, rendering, whatever). Write a `describe` statement that wraps all the individual `it` statement tests:

	describe('updateEvent', function() {
		it('should change the event\'s start date', function() {
			// your test here
		});
		// more tests...
	});

Many settings have different behaviors based on *other* settings. For example, the `header` setting will render differently depending on whether `isRTL` is `true` or `false`. In this case, where a general global setting (like `isRTL`) affects the behaviors of more specific settings (like `header`), make nested groupings under the umbrella of the specific setting:

	describe('header', function() {
		describe('when isRTL is false', function() {
			it('should render the default buttons on the left', function() {
				// your test
			});
		});
		describe('when isRTL is true', function() {
			it ('should render the default buttons on the right', function() {
				// your test
			});
		});
	});

The cool thing is that when a test name is read outloud, with all of its ancestral `describe` statements, it sounds like a sentence, like "header when isRTL is false should render the default buttons on the left".

Similar to how `iRTL` often calls for nested groupings, the `lang` option will often influence the behavior of other settings. Please test for different `lang` values when necessary. It will probably only be necessary to test for the default `lang` as well as one non-default lang. The inner describe statement might look like `"when lang is fr"` (for French).

Also, similar to how `isRTL` often calls for nested groupings, please also make different groupings for each type of view (just "basic" and "agenda" for now). This is very necessary, especially for settings that affect rendering, because often the code paths for each view are completely different. It might look something like this:

	describe('weekNumbers', function() {
		describe('when view is basic', function() {
			beforeEach(function() {
				$('#calendar').fullCalendar({
					defaultView: 'basicWeek',
					weekNumbers: true
				});
			});
			it('should render the week number along the side', function() {
				// your test here
			});
		});
		describe('when view is agenda', function() {
			beforeEach(function() {
				$('#calendar').fullCalendar({
					defaultView: 'agendaWeek',
					weekNumbers: true
				});
			});
			it('should render the week numbers along the side', function() {
				// your test here
			});
		});
	});


# Tips for debugging tests

When you are writing a new test, it is often annoying to have to run *all* tests every time while you are debugging. Jasmine allows you to write `ddescribe` and `iit` statements, which will only run the enclosed tests and ignore all others.

Also, when running tests in a real browers via the plain `karma start` command, it is very helpful to use Karma's "debug" mode (available via the big DEBUG button). Once you are in that mode, JS debugging tools such as console and breakpoints will become available.


# Code formatting of tests

Please make sure your test code follows the [Style Guide] and that you run `grunt check` before committing.


# Questions

If you have any questions on what to tests, or how to organize your tests, post a question on the [Google Group].

[Jasmine Introduction]: http://jasmine.github.io/2.0/introduction.html
[Karma]: http://karma-runner.github.io/
[FullCalendar Documentation]: http://arshaw.com/fullcalendar/docs2/
[Style Guide]: ../#style-guide
[Google Group]: https://groups.google.com/forum/#!forum/fullcalendar
[How to create a PR]: https://help.github.com/articles/creating-a-pull-request
