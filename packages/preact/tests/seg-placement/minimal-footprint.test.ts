import { describe, expect, it } from 'vitest'
import { getSliceKey } from '../../src/seg-placement/kernel'
import {
  type DayGridEventSeg,
  type DayGridPlacementColumn,
  buildDayGridLevelPlacements,
  buildDayGridPixelPlacements,
} from '../../src/daygrid/seg-placement-adapter'

/*
Historical hiding fixtures for scored logical slice plans and measured pixel
pruning. The issue-7573 fixtures mirror the browser regression closely enough
to exercise its partial-slice rescue without Karma.
*/

const EVENT_HEIGHT = 10

describe('slice-plan hiding, level currency', () => {
  // https://github.com/fullcalendar/fullcalendar/issues/5883
  it('peels a wide overflow and an evicted occupant around one full day', () => {
    // week columns; day 20 = col 2, 21 = col 3, 22 = col 4
    const columns = layoutLevelRow([
      makeSeg('b1', 2, 4),
      makeSeg('b2', 3, 4),
      makeSeg('b3', 2, 5),
      makeSeg('b4', 2, 5),
    ], 7, undefined, 3)

    expect(columns.map((column) => hiddenIds(column))).toEqual([
      [], [], [], ['b3', 'b4'], [], [], [],
    ])
    expect(columns.map((column) => visibleKeys(column))).toEqual([
      [], [],
      ['b1:2', 'b3:2:2:slice', 'b4:2:2:slice'],
      ['b2:3'],
      ['b3:2:4:slice', 'b4:2:4:slice'],
      [], [],
    ])
  })

  // https://github.com/fullcalendar/fullcalendar/issues/5790
  it('confines the more link to the one over-full day', () => {
    // month row; Sep 2 = col 3
    const columns = layoutLevelRow([
      makeSeg('a', 0, 5),
      makeSeg('b', 1, 4),
      makeSeg('c', 2, 5),
      makeSeg('d', 3, 5),
      makeSeg('e', 3, 5),
    ], 7, undefined, 4)

    expect(columns.map((column) => hiddenIds(column))).toEqual([
      [], [], [], ['d', 'e'], [], [], [],
    ])
    expect(columns.map((column) => visibleKeys(column))).toEqual([
      ['a:0'],
      ['b:1'],
      ['c:2'],
      [],
      ['d:3:4:slice', 'e:3:4:slice'],
      [], [],
    ])
  })

  // The dayMaxEvents:4 issue-7447 fixture: Sat (col 6) has free levels that
  // overflowed Fri-reaching events must fill instead of globbing into Sat.
  it('fills a trailing column gap that a full neighbor must not mask', () => {
    // week Apr 9-15 2023; cols: Sun 9 = 0 ... Sat 15 = 6
    const columns = layoutLevelRow([
      makeSeg('g', 0, 5),
      makeSeg('c', 0, 6),
      makeSeg('h', 0, 6),
      makeSeg('d', 2, 5),
      makeSeg('j', 3, 6),
      makeSeg('b', 4, 7),
      makeSeg('f', 4, 7),
      makeSeg('i', 4, 6),
      makeSeg('a', 5, 7),
      makeSeg('e', 5, 7),
    ], 7, 4)

    expect(columns.map((column) => hiddenIds(column))).toEqual([
      [], [], [],
      ['j'],
      ['j', 'b', 'f', 'i'],
      ['j', 'b', 'f', 'i'],
      [],
    ])
    expect(visibleKeys(columns[6])).toEqual(['b:4:6:slice', 'f:4:6:slice'])
  })

  // A slice plan commits to one level, so a run whose halves fit only at
  // disjoint levels keeps the best-scoring half and hides the other. The old
  // engine's greedy prefix split showed both halves; safe repack trades that
  // completeness for plan simplicity.
  it('keeps the best half of a run whose halves fit only at different levels', () => {
    const columns = layoutLevelRow([
      makeSeg('m', 0, 1),
      makeSeg('w', 2, 3),
      makeSeg('n', 1, 3),
      makeSeg('z', 0, 2),
    ], 3, 2)

    expect(columns.map((column) => hiddenIds(column))).toEqual([['z'], [], []])
    expect(visibleKeys(columns[0])).toEqual(['m:0'])
    expect(visibleKeys(columns[1])).toEqual(['n:1', 'z:0:1:slice'])
    expect(visibleKeys(columns[2])).toEqual(['w:2'])
  })
})

describe('measured pruning, pixel currency', () => {
  // https://github.com/fullcalendar/fullcalendar/issues/7573 — e3 creates a
  // link footprint over [1,2), which slices e2 and rescues its [2,6) remainder.
  it('rescues the part of a link-band intruder outside the link span', () => {
    const segs = [
      makeSeg('e1', 1, 6),
      makeSeg('e2', 1, 6),
      makeSeg('e3', 1, 2),
    ]
    const heights = new Map<string, number>([
      ['e1:1', EVENT_HEIGHT],
      ['e2:1', EVENT_HEIGHT],
      ['e2:1:2:slice', EVENT_HEIGHT],
      ['e3:1', EVENT_HEIGHT],
    ])
    const layout = buildDayGridPixelPlacements(
      segs,
      false,
      true,
      7,
      25,
      EVENT_HEIGHT,
      8,
      heights,
    )

    expect(layout.columns.map((column) => hiddenIds(column))).toEqual([
      [], ['e2', 'e3'], [], [], [], [], [],
    ])
    expect(visibleKeys(layout.columns[1], layout.sliceCoords)).toEqual(['e1:1'])
    expect(visibleKeys(layout.columns[2], layout.sliceCoords)).toEqual([
      'e2:1:2:slice',
    ])
    // The consumed whole stays mounted as an invisible measurement donor.
    expect(layout.columns[1].renderSlices.map(getSliceKey)).toEqual([
      'e1:1',
      'e2:1',
      'e3:1',
    ])
  })

  // The observed browser geometry of the 7573 failure.
  it('rescues the intruder under exact fractional measurements too', () => {
    const segs = [
      makeSeg('e1', 1, 6),
      makeSeg('e2', 1, 6),
      makeSeg('e3', 1, 2),
    ]
    const heights = new Map<string, number>([
      ['e1:1', 17],
      ['e2:1', 17],
      ['e2:1:2:slice', 17],
      ['e3:1', 17],
    ])
    const layout = buildDayGridPixelPlacements(
      segs,
      false,
      true,
      7,
      38.640625,
      17,
      9,
      heights,
    )

    expect(layout.columns.map((column) => hiddenIds(column))).toEqual([
      [], ['e2', 'e3'], [], [], [], [], [],
    ])
    expect(visibleKeys(layout.columns[1], layout.sliceCoords)).toEqual(['e1:1'])
    expect(visibleKeys(layout.columns[2], layout.sliceCoords)).toEqual([
      'e2:1:2:slice',
    ])
  })
})

function layoutLevelRow(
  eventOrderedSegs: DayGridEventSeg[],
  columnCount: number,
  dayMaxEvents?: number,
  dayMaxEventRows?: number,
): DayGridPlacementColumn[] {
  const heights = new Map<string, number>()
  for (const seg of eventOrderedSegs) {
    const key = `${seg.eventRange.instance.instanceId}:${seg.start}`
    heights.set(key, EVENT_HEIGHT)
    for (let start = seg.start; start < seg.end; start += 1) {
      heights.set(`${key}:${start}:slice`, EVENT_HEIGHT)
    }
  }
  return buildDayGridLevelPlacements(
    eventOrderedSegs,
    dayMaxEvents ?? dayMaxEventRows ?? Infinity,
    dayMaxEvents == null && dayMaxEventRows != null ? 1 : 0,
    false,
    true,
    columnCount,
    heights,
  ).columns
}

function visibleKeys(
  column: DayGridPlacementColumn,
  sliceCoords?: ReadonlyMap<string, number>,
): string[] {
  return column.renderSlices
    .map(getSliceKey)
    .filter((key) => !sliceCoords || sliceCoords.has(key))
}

function hiddenIds(column: DayGridPlacementColumn): string[] {
  return column.hiddenSegs.map((seg) => seg.eventRange.instance.instanceId)
}

function makeSeg(
  instanceId: string,
  start: number,
  end: number,
): DayGridEventSeg {
  return {
    start,
    end,
    isStart: true,
    isEnd: true,
    eventRange: {
      instance: { instanceId },
    },
  } as DayGridEventSeg
}
