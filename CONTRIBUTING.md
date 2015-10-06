
## Reporting Bugs

Each bug report MUST have a [JSFiddle/JSBin] recreation
or else it will be deleted without explanation.
[further instructions &raquo;][Bug Report Instructions]


## Requesting Features

Before requesting a feature, please search the [Issue Tracker]
to see if it has already been reported, and if so, subscribe to it.
[further instructions &raquo;][Feature Request Instructions]


## Contributing Code

Code contributions are accepted via [Pull Request][Using Pull Requests].
When modifying files, please do not edit the generated or minified files
in the `dist/` directory. Please edit the original `src/` or `lang/` files.
Please always follow the [Code Contribution Guidelines].


### Contributing Features

The FullCalendar project welcomes PRs for new features,
but because there are so many feature requests (over 100),
and because every new feature requires refinement and maintenance,
each PR will be aggressively prioritized
and might take a while to make it to an official release.

Furthermore, each new feature should be designed as robustly as possible
and be useful beyond the immediate usecase it was initially designed for.
Feel free to start a ticket discussing the feature's specs before coding.


### Contributing Bugfixes

Along with your bugfix, it is important to include a description
and [JSFiddle/JSBin] recreation of the bug to communicate what is being fixed.


### Contributing Languages

Please edit the original files in the `lang/` directory.
DO NOT edit anything in the `dist/` directory.
The build system (as described in the [Code Contribution Guidelines])
will responsible for merging FullCalendar's `lang/` data with the
[MomentJS locale data].


[JSFiddle/JSBin]: http://fullcalendar.io/wiki/Reporting-Bugs/
[Issue Tracker]: https://github.com/fullcalendar/fullcalendar/issues
[Bug Report Instructions]: http://fullcalendar.io/wiki/Reporting-Bugs/
[Feature Request Instructions]: http://fullcalendar.io/wiki/Requesting-Features/
[Using Pull Requests]: https://help.github.com/articles/using-pull-requests/
[Code Contribution Guidelines]: https://github.com/fullcalendar/fullcalendar/wiki/Contributing-Code
[MomentJS locale data]: https://github.com/moment/moment/tree/develop/locale
