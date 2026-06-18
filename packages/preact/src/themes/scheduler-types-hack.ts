
// // ambient types (tsc strips during build because of {})
// import {} from '@fullcalendar/timeline'
// import {} from '@fullcalendar/resource-daygrid'
// import {} from '@fullcalendar/resource-timegrid'
// import {} from '@fullcalendar/resource-timeline'
// import {} from '@fullcalendar/adaptive'
// import {} from '@fullcalendar/scrollgrid'
// import {} from '@fullcalendar/list'
// import {} from '@fullcalendar/multimonth'

// HACK until we can import @fullcalendar/preact-scheduler
declare module '@fullcalendar/core/protected-api' {
  interface BaseOptions {
    resourceDayHeaderAlign?: any
    resourceDayHeaderClass?: any
    resourceDayHeaderInnerClass?: any
    resourceColumnHeaderClass?: any
    resourceColumnHeaderInnerClass?: any
    resourceColumnResizerClass?: any
    resourceGroupHeaderClass?: any
    resourceGroupHeaderInnerClass?: any
    resourceCellClass?: any
    resourceCellInnerClass?: any
    resourceIndentClass?: any
    resourceExpanderClass?: any
    resourceExpanderContent?: any
    resourceHeaderRowClass?: any
    resourceRowClass?: any
    resourceColumnDividerClass?: any
    resourceGroupLaneClass?: any
    resourceLaneClass?: any
    resourceLaneBottomClass?: any
    timelineBottomClass?: any
  }
}

export {}
