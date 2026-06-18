
## Note

This changelog does not mention all releases.
Visit the github releases page as well as the main fullcalendar repo.

## 6.0.0-beta.3

- FEATURE: custom template rendering using ng-template (#204)
- FEATURE: expose events/eventSources/resources as top-level component inputs (#303)
- FIX: remove fast-deep-equals because Angular prefers ESM for tree shaking (#421)
- FIX: backwards incompatibility with Angular 14 types (#419)
- BREAKING: Minimum required Angular version is now 12

## 5.10.2 (2022-02-09)

- add Angular 13 support (#387)

## 5.7.1 (2021-06-02)

- add Angular 12 support (#369)

## 5.5.0 (2020-12-19)

- add Angular 11 support (#351, #352)

## 5.3.1 (2020-09-03)

- add Angular 10 support

## 4.4.1 (2020-02-12)

- fixed wrong @fullcalendar/core dependency version num

## 4.3.2 (2020-02-11)

- compatible with angular 8 (#209)
- navLinks throws Cannot read property 'emit' of undefined (#229, #241)

## 4.3.1 (2019-08-10)

- had references to wrong version of @fullcalendar/core

## 4.3.0 (2019-08-09)

- fix ngOnDestroy undefined calendar (#212)

## 4.2.1 (2019-06-04)

- fixed bug with event/resource-fetching *functions* not working
- removed `deep-copy` as a dependency

## 4.2.0 (2019-06-02)

- added missing properties (#197)
- responds to changes nested within input data structures
  when `deepChangeDetection` is enabled (#171)
- added two small dependencies:
  - `fast-deep-equal`
  - `deep-copy`

## 4.1.1 (2019-04-24)

fixes not accepting `googleCalendarApiKey` (#188)

## 4.1.0 (2019-03-19)

First official release. Also fixed #175.
