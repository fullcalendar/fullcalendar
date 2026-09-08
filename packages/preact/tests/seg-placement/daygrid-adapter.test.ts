import { describe, expect, it } from 'vitest'
import { getDayGridSegKey } from '../../src/daygrid/TableSeg'
import { getSliceKey } from '../../src/seg-placement/kernel'
import {
  type DayGridEventSeg,
  type DayGridPlacementColumn,
  buildDayGridLevelPlacements,
  buildDayGridPixelPlacements,
  buildDayGridSegSources,
  computeDayGridDomCandidateMaxLevels,
  computeDayGridMoreLinkLevelTax,
  estimateLevelCapacity,
  resolveDayGridPlacementMode,
} from '../../src/daygrid/seg-placement-adapter'

describe('DayGrid production placement adapter', () => {
  it('builds integer-column sources with stable production identity and order', () => {
    const first = makeSeg('first', 1, 3, { isEnd: false })
    const second = makeSeg('second', 0, 1, { isStart: false })
    const sources = buildDayGridSegSources([first, second])

    expect(sources).toMatchObject([
      {
        key: 'first:1',
        start: 1,
        end: 3,
        isStart: true,
        isEnd: false,
        orderIndex: 0,
      },
      {
        key: 'second:0',
        start: 0,
        end: 1,
        isStart: false,
        isEnd: true,
        orderIndex: 1,
      },
    ])
    expect(sources[0].eventRange).toBe(first.eventRange)
    expect(sources[1].eventRange).toBe(second.eventRange)
  })
})

describe('DayGrid row-local placement state', () => {
  it('uses explicit numeric caps, the auto frontier, and no cap for unlimited rows', () => {
    expect(computeDayGridDomCandidateMaxLevels('unlimited', undefined, undefined, 9)).toBe(Infinity)
    expect(computeDayGridDomCandidateMaxLevels('maxEvents', 3, 7, 9)).toBe(3)
    expect(computeDayGridDomCandidateMaxLevels('maxEventRows', undefined, 4, 9)).toBe(4)
    expect(computeDayGridDomCandidateMaxLevels('auto', true, 4, 9)).toBe(9)
    expect(computeDayGridDomCandidateMaxLevels('auto', 3, true, 9)).toBe(9)
  })

  it('estimates the candidate frontier from current canvas and slice heights', () => {
    expect(estimateLevelCapacity(220, 30)).toBe(8)
    expect(estimateLevelCapacity(220, 10)).toBe(22)
  })
})

describe('DayGrid screen mode routing', () => {
  it('reproduces production option precedence, including boolean over numeric', () => {
    expect(resolveDayGridPlacementMode(undefined, undefined)).toBe('unlimited')
    expect(resolveDayGridPlacementMode(2, undefined)).toBe('maxEvents')
    expect(resolveDayGridPlacementMode(undefined, 2)).toBe('maxEventRows')
    expect(resolveDayGridPlacementMode(2, 3)).toBe('maxEvents')
    expect(resolveDayGridPlacementMode(2, true)).toBe('auto')
    expect(resolveDayGridPlacementMode(true, 2)).toBe('auto')
  })

  it('charges a logical level for a more link only under dayMaxEventRows', () => {
    expect(computeDayGridMoreLinkLevelTax('unlimited')).toBe(0)
    expect(computeDayGridMoreLinkLevelTax('maxEvents')).toBe(0)
    expect(computeDayGridMoreLinkLevelTax('maxEventRows')).toBe(1)
    expect(computeDayGridMoreLinkLevelTax('auto')).toBe(0)
  })
})

describe('DayGrid kernel level placement', () => {
  it('keeps unmeasured unlimited slices mounted but unpositioned', () => {
    const layout = layoutLevelRow([
      makeSeg('first', 0, 1),
      makeSeg('second', 0, 1),
    ], 1, undefined, undefined, {
      heights: { 'first:0': 12 },
    })
    const { columns } = layout

    expect(levelItemTops(layout, 0)).toEqual({
      'first:0': 0,
      'second:0': undefined,
    })
    expect(columns[0].renderSlices.map(getSliceKey)).toEqual([
      'first:0',
      'second:0',
    ])
    expect(columns[0].contentHeight).toBe(12)
    expect(columns[0].hiddenSegs).toEqual([])
  })

  it('mounts unmeasured partial slices without positioning them', () => {
    const layout = layoutLevelRow([
      makeSeg('blocker', 1, 2),
      makeSeg('wide', 0, 3),
    ], 3, 1, undefined, {
      heights: {
        'wide:0:0:slice': 12,
        'blocker:1': 18,
      },
    })
    const { columns } = layout

    expect(levelItemTops(layout, 0)).toEqual({ 'wide:0:0:slice': 0 })
    expect(levelItemTops(layout, 1)).toEqual({ 'blocker:1': 0 })
    expect(levelItemTops(layout, 2)).toEqual({
      'wide:0:2:slice': undefined,
    })
    expect(columns[0].renderSlices.map(getSliceKey)).toEqual(['wide:0:0:slice'])
    expect(columns[2].renderSlices.map(getSliceKey)).toEqual(['wide:0:2:slice'])
    expect(columns.map((column) => column.contentHeight)).toEqual([12, 18, 0])
  })

  it('projects hidden glob slices to ordered, real-boundary cell segs', () => {
    const { columns } = layoutLevelRow([
      makeSeg('blocker', 1, 2),
      makeSeg('wide', 0, 3),
      makeSeg('later', 1, 2),
    ], 3, 1)

    expect(columns.map((column) => segIds(column.hiddenSegs))).toEqual([
      [],
      ['wide', 'later'],
      [],
    ])
    expect(segIds(columns[1].segs)).toEqual(['blocker', 'wide', 'later'])
    expect(columns[1].hiddenSegs[0]).toMatchObject({
      start: 1,
      end: 2,
      isStart: false,
      isEnd: false,
    })
  })

  it('charges the more-link occupant only in numeric rows mode', () => {
    const stack = [
      makeSeg('first', 0, 1),
      makeSeg('second', 0, 1),
      makeSeg('third', 0, 1),
    ]
    const eventsLayout = layoutLevelRow(stack, 1, 2)
    const rowsLayout = layoutLevelRow(stack, 1, undefined, 2)
    const rowsColumns = rowsLayout.columns

    expect(Object.keys(levelItemTops(eventsLayout, 0))).toEqual([
      'first:0',
      'second:0',
    ])
    expect(Object.keys(levelItemTops(rowsLayout, 0))).toEqual(['first:0'])
    expect(segIds(rowsColumns[0].hiddenSegs)).toEqual(['second', 'third'])
    expect(rowsColumns[0].contentHeight).toBe(EVENT_HEIGHT)
  })
})

describe('DayGrid kernel pixel placement', () => {
  /** Two independent stacks of three, so one column can owe a link alone. */
  const twoStacks = [
    makeSeg('a', 0, 1),
    makeSeg('b', 0, 1),
    makeSeg('c', 0, 1),
    makeSeg('d', 1, 2),
    makeSeg('e', 1, 2),
  ]

  it('keeps unmeasured DOM candidates pending instead of excluding them', () => {
    const layout = layoutPixelRow([
      makeSeg('first', 0, 1),
      makeSeg('second', 0, 1),
    ], 1, {
      canvasHeight: 10,
      heights: {},
    })

    expect(levelItemTops(layout, 0)).toEqual({
      'first:0': undefined,
      'second:0': undefined,
    })
    expect(layout.columns[0].renderSlices.map(getSliceKey)).toEqual([
      'first:0',
      'second:0',
    ])
    expect(layout.columns[0].hiddenSegs).toEqual([])
    expect(layout.columns[0].contentHeight).toBe(0)
  })

  it('defers partial donor planning until the more-link probe has measured', () => {
    const layout = layoutPixelRow([
      makeSeg('blocker', 1, 2),
      makeSeg('wide', 0, 3),
    ], 3, {
      canvasHeight: 15,
      heights: {
        'blocker:1': 5,
        'wide:0': 12,
      },
      hasMeasuredMoreLink: false,
    })

    expect(layout.columns.flatMap((column) =>
      column.renderSlices.map(getSliceKey),
    )).toEqual(['wide:0', 'blocker:1'])
  })

  it('shows every mounted candidate before the event area has measured', () => {
    const layout = layoutPixelRow(twoStacks, 2)
    const { columns } = layout

    expect(levelItemTops(layout, 0)).toEqual({
      'a:0': 0,
      'b:0': EVENT_HEIGHT,
      'c:0': EVENT_HEIGHT * 2,
    })
    expect(columns.every((column) => !column.hiddenSegs.length)).toBe(true)
  })

  it('emits a hidden whole donor and self-measuring partials after bounded exclusion', () => {
    const awaitingPartials = layoutPixelRow([
      makeSeg('blocker', 1, 2),
      makeSeg('wide', 0, 3),
    ], 3, {
      canvasHeight: 15,
      heights: {
        'blocker:1': 5,
        'wide:0': 12,
      },
      moreLinkHeight: 1,
    })

    expect(levelItemTops(awaitingPartials, 0)).toEqual({
      'wide:0': undefined,
      'wide:0:0:slice': undefined,
    })
    expect(levelItemTops(awaitingPartials, 1)).toEqual({
      'blocker:1': undefined,
    })
    expect(levelItemTops(awaitingPartials, 2)).toEqual({
      'wide:0:2:slice': undefined,
    })
    expect(awaitingPartials.columns[0].renderSlices.map(getSliceKey))
      .toEqual(['wide:0', 'wide:0:0:slice'])

    const settled = layoutPixelRow([
      makeSeg('blocker', 1, 2),
      makeSeg('wide', 0, 3),
    ], 3, {
      canvasHeight: 15,
      heights: {
        'blocker:1': 5,
        'wide:0': 12,
        'wide:0:0:slice': 6,
        'wide:0:2:slice': 6,
      },
      moreLinkHeight: 1,
    })
    expect(settled.columns.map((column) => column.contentHeight)).toEqual([6, 0, 6])
  })

  it('keeps a displaced whole source mounted as the measurement donor for its partials', () => {
    const layout = layoutPixelRow([
      makeSeg('blocker', 1, 2),
      makeSeg('wide', 0, 3),
    ], 3, {
      canvasHeight: 15,
      heights: {
        'blocker:1': 5,
        'wide:0': 12,
        'wide:0:0:slice': 6,
        'wide:0:2:slice': 6,
      },
      moreLinkHeight: 1,
    })

    expect(levelItemTops(layout, 0)).toEqual({
      'wide:0': undefined,
      'wide:0:0:slice': 0,
    })
    expect(levelItemTops(layout, 2)).toEqual({ 'wide:0:2:slice': 0 })
  })

  it('keeps the donor set stable after partial measurements disappear', () => {
    const segs = [
      makeSeg('blocker', 1, 2),
      makeSeg('wide', 0, 3),
    ]
    const withPartialsMeasured = layoutPixelRow(segs, 3, {
      canvasHeight: 10,
      heights: {
        'blocker:1': 5,
        'wide:0': 6,
        'wide:0:0:slice': 12,
        'wide:0:2:slice': 12,
      },
      moreLinkHeight: 1,
    })
    const afterPartialsUnmeasure = layoutPixelRow(segs, 3, {
      canvasHeight: 10,
      heights: {
        'blocker:1': 5,
        'wide:0': 6,
      },
      moreLinkHeight: 1,
    })

    const renderKeys = (layout: ReturnType<typeof layoutPixelRow>) =>
      layout.columns.flatMap((column) =>
        column.renderSlices.map(getSliceKey),
      )

    // The same donors stay mounted whether their measurements confirmed the
    // rejection or vanished, so no mount-measure-reject loop can start.
    expect(renderKeys(afterPartialsUnmeasure)).toEqual(renderKeys(withPartialsMeasured))
    expect(renderKeys(afterPartialsUnmeasure)).toContain('wide:0')
    expect(renderKeys(afterPartialsUnmeasure)).toContain('wide:0:0:slice')
    expect(renderKeys(afterPartialsUnmeasure)).toContain('wide:0:2:slice')
  })

  it('keeps bounded exclusions as donors while later wholes can place', () => {
    const layout = layoutPixelRow([
      makeSeg('too-tall', 0, 1),
      makeSeg('later', 1, 2),
    ], 2, {
      canvasHeight: 10,
      heights: { 'too-tall:0': 12, 'later:1': 5 },
    })

    expect(levelItemTops(layout, 0)).toEqual({
      'too-tall:0': undefined,
    })
    expect(levelItemTops(layout, 1)).toEqual({ 'later:1': 0 })
    expect(segIds(layout.columns[0].hiddenSegs)).toEqual(['too-tall'])
    expect(layout.columns.map((column) => column.contentHeight)).toEqual([0, 5])
  })

  it('projects safe-closure consumption into donors, hidden segs, and content height', () => {
    const layout = layoutPixelRow([
      makeSeg('a', 0, 1),
      makeSeg('b', 0, 1),
      makeSeg('c', 0, 1),
      makeSeg('d', 0, 1),
    ], 1, { canvasHeight: 30 })

    expect(levelItemTops(layout, 0)).toEqual({
      'a:0': 0,
      'b:0': 10,
      'c:0': undefined,
      'd:0': undefined,
    })
    expect(segIds(layout.columns[0].hiddenSegs)).toEqual(['c', 'd'])
    expect(layout.columns[0].contentHeight).toBe(20)
  })

  it('stops mounting candidates beyond the row-local DOM frontier', () => {
    const layout = layoutPixelRow(twoStacks, 2, { levelCapacity: 2 })
    const { columns } = layout

    // The third level never mounts, yet both columns still list their rejected
    // source, because the popover unions unmounted sources with measured hides.
    expect(levelItemTops(layout, 0)).toEqual({ 'a:0': 0, 'b:0': EVENT_HEIGHT })
    expect(segIds(columns[0].hiddenSegs)).toEqual(['c'])
    expect(segIds(columns[0].segs)).toEqual(['a', 'b', 'c'])
  })

  it('mounts candidate partials beyond the DOM frontier without the whole', () => {
    const layout = layoutPixelRow([
      makeSeg('blocker', 1, 2),
      makeSeg('wide', 0, 3),
    ], 3, {
      canvasHeight: 6,
      levelCapacity: 1,
      moreLinkHeight: 1,
      heights: { 'blocker:1': 5 },
    })

    expect(layout.columns.flatMap((column) =>
      column.renderSlices.map(getSliceKey),
    )).not.toContain('wide:0')
    expect(levelItemTops(layout, 0)).toEqual({
      'wide:0:0:slice': undefined,
    })
    expect(levelItemTops(layout, 1)).toEqual({ 'blocker:1': undefined })
    expect(levelItemTops(layout, 2)).toEqual({
      'wide:0:2:slice': undefined,
    })
    // The hidden middle reserves the only occupied level for the link, so the
    // blocker pays the tax while the two candidate fragments measure.
    expect(layout.columns.map((column) => segIds(column.hiddenSegs))).toEqual([
      [],
      ['blocker', 'wide'],
      [],
    ])
  })
})

const EVENT_HEIGHT = 10

function layoutLevelRow(
  eventOrderedSegs: DayGridEventSeg[],
  columnCount: number,
  dayMaxEvents?: number,
  dayMaxEventRows?: number,
  config: {
    orderStrict?: boolean,
    eventSlicing?: boolean,
    heights?: Record<string, number>,
  } = {},
) {
  const heights = config.heights ?? buildAllSliceHeights(eventOrderedSegs)
  const mode = dayMaxEvents != null
    ? 'maxEvents'
    : dayMaxEventRows != null ? 'maxEventRows' : 'unlimited'
  return buildDayGridLevelPlacements(
    eventOrderedSegs,
    computeDayGridDomCandidateMaxLevels(
      mode,
      dayMaxEvents,
      dayMaxEventRows,
      Infinity,
    ),
    computeDayGridMoreLinkLevelTax(mode),
    config.orderStrict ?? false,
    config.eventSlicing ?? true,
    columnCount,
    new Map(Object.entries(heights)),
  )
}

function buildAllSliceHeights(
  segs: readonly DayGridEventSeg[],
): Record<string, number> {
  const heights: Record<string, number> = {}
  for (const seg of segs) {
    const key = getDayGridSegKey(seg)
    heights[key] = EVENT_HEIGHT
    for (let start = seg.start; start < seg.end; start += 1) {
      heights[`${key}:${start}:slice`] = EVENT_HEIGHT
    }
  }
  return heights
}

function layoutPixelRow(
  eventOrderedSegs: DayGridEventSeg[],
  columnCount: number,
  config: {
    orderStrict?: boolean,
    eventSlicing?: boolean,
    heights?: Record<string, number>,
    canvasHeight?: number,
    levelCapacity?: number,
    moreLinkHeight?: number,
    hasMeasuredMoreLink?: boolean,
  } = {},
) {
  const heights = config.heights ?? Object.fromEntries(
    eventOrderedSegs.map((seg) => [getDayGridSegKey(seg), EVENT_HEIGHT]),
  )

  return buildDayGridPixelPlacements(
    eventOrderedSegs,
    config.orderStrict ?? false,
    config.eventSlicing ?? true,
    columnCount,
    config.canvasHeight,
    config.hasMeasuredMoreLink === false
      ? undefined
      : config.moreLinkHeight ?? EVENT_HEIGHT,
    config.levelCapacity ?? 8,
    new Map(Object.entries(heights)),
  )
}

function levelItemTops(
  layout: {
    columns: DayGridPlacementColumn[]
    sliceCoords: ReadonlyMap<string, number>
  },
  column: number,
): Record<string, number | undefined> {
  return Object.fromEntries(
    layout.columns[column].renderSlices.map((slice) => {
      const key = getSliceKey(slice)
      return [key, layout.sliceCoords.get(key)]
    }),
  )
}

function makeSeg(
  instanceId: string,
  start: number,
  end: number,
  boundaries: { isStart?: boolean, isEnd?: boolean } = {},
): DayGridEventSeg {
  return {
    start,
    end,
    isStart: boundaries.isStart ?? true,
    isEnd: boundaries.isEnd ?? true,
    eventRange: {
      instance: { instanceId },
    },
  } as DayGridEventSeg
}

function segIds(segs: DayGridEventSeg[]): string[] {
  return segs.map(segId)
}

function segId(seg: DayGridEventSeg): string {
  return seg.eventRange.instance.instanceId
}
