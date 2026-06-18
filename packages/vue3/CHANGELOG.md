## Note

This changelog does not mention all releases.
Visit the github releases page as well as the main fullcalendar repo.

## 5.11.1 (2022-05-10)

- FIX: Cannot target calendar api with several instances (#155)

## 5.7.1 (2021-06-02)

- support for Vue 3
- KNOWN BUG: templates within slots do not inherit App's
  mixins, directives, filters, and components (like #123)

## 5.4.0 (2020-11-11)

- no longer expose component as 'fullcalendar' when used globally
- eventContent slot doesn't properly destroy the Vue components inside (#111)
- global mixins, directives, filters & components work inside slots (#105)
- better compatibility with Webpack 5, deeming `resolve.fullySpecified` unnecessary ([core-5822])
- dist files now include a CJS file. ESM is still used by default in most environments ([core-5929])
- webpack upgrade note: use style-loader instead of vue-style-loader

[core-5822]: https://github.com/fullcalendar/fullcalendar/issues/5822
[core-5929]: https://github.com/fullcalendar/fullcalendar/issues/5929

## 5.2.0 (2020-07-30)

- pre-built release of the Vue component (#61)
- using the component through a CDN (#28)
- Build errors due to missing types in main.ts (#101)
- when appropriate, expose as 'fullcalendar' component, for DOM templates

## 4.3.1 (2019-08-12)

- fix regression where object props wrongly forcing rerenders (#11, #34)

## 4.2.2 (2019-06-04)

Emergency bugfix: event objects with Date objects wouldn't render

## 4.2.1 (2019-06-04)

Fixed bugs surfaced in issue #32:
- event/resource-fetching *functions* don't work
- event/resource *computed properties* don't work
- removed `deep-copy` as a dependency

## 4.2.0 (2019-06-02)

- nested props data mutations, like events being updated,
  will now be rendred on the calendar (#9)
- added missing props (#25, #29)
- the following emitted events are now deprecated.
  use *props* instead. pass in a function as the prop:
    - `datesRender`
    - `datesDestroy`
    - `dayRender`
    - `eventRender`
    - `eventDestroy`
    - `viewSkeletonRender`
    - `viewSkeletonDestroy`
    - `resourceRender`
  Allows returning false/DOM nodes (#27)
- no unnecessary rerendering of calendar caused by header/footer
  props being specified as literals (#11)
- new dependency: fast-deep-equal
  automatically bundled with UMD dist

## 4.1.1 (2019-05-14)

Fix missing option `googleCalendarApiKey` (#12)
