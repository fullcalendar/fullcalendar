
## Contributing Features

The FullCalendar project welcomes PRs for new features, but because there are so many feature requests, and because every new feature requires refinement and maintenance, each PR will be prioritized against the project's other demands and might take a while to make it to an official release.

Furthermore, each new feature should be designed as robustly as possible and be useful beyond the immediate usecase it was initially designed for. Feel free to start a ticket discussing the feature's specs before coding.

## Contributing Bugfixes

Please link to a bug ticket in the description of your PR. If a ticket doesn't exist, please create one. The ticket must contain a reduced test case.

## Contributing Locale Data

Please edit the source files in the `packages/core/locales/` directory.

### Testing Your Localization

1. Edit/create your localization file
2. Build project `pnpm build`. This creates `/dist/fullcalendar-xxx.zip` at the root of the project
3. Extract the zip file
4. Copy one of the example files in `/bundle/examples`
5. Include your built translation file in your example. For example:
  ```
  <script src='../../dist/fullcalendar-6.1.20/packages/core/locales/fa.global.js'></script>
  ```
6. Repeat 1-3 if you changed your localization file
