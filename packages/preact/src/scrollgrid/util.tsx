import { ScrollerSyncerClass } from "./ScrollerSyncerInterface"

/*
TODO: dedup with @full-ui/headless-grid somehow
*/
export type CssDimValue = string | number

export function getIsHeightAuto(options: {
  height?: CssDimValue,
  contentHeight?: CssDimValue
}): boolean {
  return options.height === 'auto' || options.contentHeight === 'auto'
}

export function getTableHeaderSticky(options: {
  height?: CssDimValue,
  contentHeight?: CssDimValue,
  tableHeaderSticky?: boolean | 'auto'
}): boolean {
  let { tableHeaderSticky } = options

  if (tableHeaderSticky == null || tableHeaderSticky === 'auto') {
    tableHeaderSticky = getIsHeightAuto(options)
  }

  return tableHeaderSticky
}

export function getFooterScrollbarSticky(options: {
  height?: CssDimValue,
  contentHeight?: CssDimValue,
  footerScrollbarSticky?: boolean | 'auto'
}): boolean {
  const isHeightAuto = getIsHeightAuto(options)
  let { footerScrollbarSticky } = options

  if (footerScrollbarSticky == null || footerScrollbarSticky === 'auto') {
    footerScrollbarSticky = isHeightAuto
  }

  return Boolean(footerScrollbarSticky) && isHeightAuto
}

export function getScrollerSyncerClass(pluginHooks: {
  scrollerSyncerClass: ScrollerSyncerClass | null,
}): ScrollerSyncerClass {
  const ScrollerSyncer = pluginHooks.scrollerSyncerClass

  if (!ScrollerSyncer) {
    throw new RangeError('Must import @fullcalendar/scrollgrid')
  }

  return ScrollerSyncer
}
