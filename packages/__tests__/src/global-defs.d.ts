
// for when you need to change types of vars in JS, to make checks pass:
// https://github.com/Microsoft/TypeScript/wiki/Type-Checking-JavaScript-Files

declare let karmaConfig: any
declare let initCalendar: any
declare let pushOptions: any
declare let getCurrentOptions: any
declare let currentCalendar: any
declare let describeOptions: any
declare let describeValues: any
declare let describeTimeZones: any
declare let spyOnCalendarCallback: any
declare let spyOnMethod: any
declare let spyCall: any
declare let oneCall: any

declare let XHRMock: any

interface Function {
  calls: any // for jasmine spies
}

interface JQueryStatic {
  simulate: any
  simulateMouseClick: any
  simulateTouchClick: any
  simulateByPoint: any
  _data: any
}

interface JQuery {
  simulate: any
  draggable: any
  sortable: any
}

declare namespace jasmine {

  interface Matchers<T> {
    toEqualDate: any
    toEqualLocalDate: any
    toEqualNow: any
    toBeBoundedBy: any
    toIntersectWith: any
    toBeAbove: any
    toBeBelow: any
    toBeRightOf: any
    toBeLeftOf: any
    toHaveScrollbars: any
    toBeMostlyHBoundedBy: any
    toBeMostlyAbove: any
    toBeMostlyLeftOf: any
    toBeMostlyRightOf: any
  }

}
