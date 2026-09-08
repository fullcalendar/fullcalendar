import { describe, expect, it } from 'vitest'
import {
  buildTimeGridSegPlacements,
  type TimeGridEventSeg,
  type TimeGridSegPlacementResult,
  type TimeGridSegVertical,
} from '../../src/timegrid/seg-placement-adapter'

describe('TimeGrid production placement adapter', () => {
  it('projects ordinary overlap into sensible normalized rectangles', () => {
    const fixture = buildFixture([
      ['a', 0, 100],
      ['b', 20, 80],
      ['c', 100, 120],
    ])
    const result = buildTimeGridSegPlacements(fixture.segs, fixture.verticals)

    expect(result.placements).toHaveLength(3)
    expect(result.hiddenGroups).toEqual([])
    expect(projectPlacements(result)).toEqual([
      ['a', 0, 0.5],
      ['b', 0.5, 0.5],
      ['c', 0, 1],
    ])
    expect(result.placements[0].seg).toMatchObject(fixture.segs[0])
    expect(result.placements[0].seg.eventRange).toBe(fixture.segs[0].eventRange)
    expect(result.placements[0].segVertical).toBe(fixture.verticals[0])
    auditVisibleRectangles(result, 'ordinary overlap')
  })

  it('preserves resolved order geometrically when eventOrderStrict is true', () => {
    const fixture = buildFixture([
      ['first', 0, 50],
      ['second', 0, 100],
      ['third', 50, 100],
    ])
    const result = buildTimeGridSegPlacements(
      fixture.segs,
      fixture.verticals,
      true,
    )
    const byId = placementById(result)

    expect(byId.get('first')!.levelCoord).toBeLessThan(byId.get('second')!.levelCoord)
    expect(byId.get('second')!.levelCoord).toBeLessThan(byId.get('third')!.levelCoord)
    expect(result.placements.map(placementId)).toEqual([
      'first',
      'second',
      'third',
    ])
    expect(byId.get('first')!.levelCoord).toBeCloseTo(0)
    expect(byId.get('first')!.thickness).toBeCloseTo(1 / 3)
    expect(byId.get('second')!.levelCoord).toBeCloseTo(1 / 3)
    expect(byId.get('second')!.thickness).toBeCloseTo(1 / 3)
    expect(byId.get('third')!.levelCoord).toBeCloseTo(2 / 3)
    expect(byId.get('third')!.thickness).toBeCloseTo(1 / 3)
    auditVisibleRectangles(result, 'strict order')
  })

  it('limits eventMaxStack and forms hidden overflow groups', () => {
    const fixture = buildFixture([
      ['visible-a', 0, 100],
      ['visible-b', 0, 100],
      ['hidden', 0, 100],
    ])
    const result = buildTimeGridSegPlacements(
      fixture.segs,
      fixture.verticals,
      false,
      2,
    )

    expect(result.placements.map(placementId)).toEqual(['visible-a', 'visible-b'])
    expect(result.hiddenGroups).toHaveLength(1)
    expect(result.hiddenGroups[0]).toMatchObject({
      start: 0,
      end: 100,
      segs: [fixture.segs[2]],
    })
    auditVisibleRectangles(result, 'max stack')
  })

  it('maps eventMaxStack overflow through transitive hidden globbing', () => {
    const fixture = buildFixture([
      ['visible', 0, 100],
      ['hidden-late', 40, 70],
      ['hidden-early', 10, 50],
      ['hidden-separate', 80, 90],
    ])
    const result = buildTimeGridSegPlacements(
      fixture.segs,
      fixture.verticals,
      false,
      1,
    )

    expect(result.placements.map(placementId)).toEqual(['visible'])
    expect(result.hiddenGroups.map((group) => ({
      span: [group.start, group.end],
      segs: group.segs.map((seg) => seg.eventRange.instance.instanceId),
    }))).toEqual([
      { span: [10, 70], segs: ['hidden-late', 'hidden-early'] },
      { span: [80, 90], segs: ['hidden-separate'] },
    ])
  })

  it('treats exact adjacency as non-overlap in levels and hidden groups', () => {
    const fixture = buildFixture([
      ['before', 0, 50],
      ['after', 50, 100],
    ])
    const visible = buildTimeGridSegPlacements(fixture.segs, fixture.verticals)
    const hidden = buildTimeGridSegPlacements(
      fixture.segs,
      fixture.verticals,
      false,
      0,
    )

    expect(projectPlacements(visible)).toEqual([
      ['before', 0, 1],
      ['after', 0, 1],
    ])
    expect(hidden.hiddenGroups.map((group) => [group.start, group.end])).toEqual([
      [0, 50],
      [50, 100],
    ])
  })

  it('projects stable pixel-union hidden groups with original segs in resolved order', () => {
    const fixture = buildFixture([
      ['blocker', 0, 100],
      ['later-start-priority', 40, 90],
      ['earlier-start-later-priority', 20, 60],
    ])
    const first = buildTimeGridSegPlacements(
      fixture.segs,
      fixture.verticals,
      false,
      1,
    )
    const resizedVerticals = fixture.verticals.map((vertical) => ({
      ...vertical,
      start: vertical.start * 2,
      end: vertical.end * 2,
      size: vertical.size * 2,
    }))
    const resized = buildTimeGridSegPlacements(
      fixture.segs,
      resizedVerticals,
      false,
      1,
    )

    expect(first.hiddenGroups).toHaveLength(1)
    expect(first.hiddenGroups[0]).toMatchObject({
      start: 20,
      end: 90,
      segs: [fixture.segs[1], fixture.segs[2]],
    })
    // The key derives from hidden event data, not pixel geometry, so a slat
    // resize (all verticals scaled) must not remount the popover.
    expect(resized.hiddenGroups[0].key).toBe(first.hiddenGroups[0].key)
  })

  it('excludes segs without vertical geometry without throwing', () => {
    const segs = [makeSeg('unmeasured')]

    expect(buildTimeGridSegPlacements(segs, [])).toEqual({
      placements: [],
      hiddenGroups: [],
    })
  })

  it('emits temporal-start DOM order independently of placement priority', () => {
    const fixture = buildFixture([
      ['priority-first', 20, 80],
      ['temporal-first', 0, 50],
    ])
    const result = buildTimeGridSegPlacements(fixture.segs, fixture.verticals)
    const byId = placementById(result)

    expect(result.placements.map(placementId)).toEqual([
      'temporal-first',
      'priority-first',
    ])
    expect(byId.get('priority-first')!.levelCoord).toBe(0)
    expect(byId.get('temporal-first')!.levelCoord).toBe(0.5)
  })

  it('covers https://github.com/fullcalendar/fullcalendar/issues/7914 without forbidden overlap', () => {
    const fixture = issue7914Fixture()
    const result = buildTimeGridSegPlacements(
      fixture.segs,
      fixture.verticals,
      true,
    )

    expect(result.placements).toHaveLength(fixture.segs.length)
    expect(result.hiddenGroups).toEqual([])
    auditVisibleRectangles(
      result,
      'https://github.com/fullcalendar/fullcalendar/issues/7914',
    )
  })

  it('covers https://github.com/fullcalendar/fullcalendar/issues/7879 without a zero-width event', () => {
    const fixture = issue7879Fixture()
    const result = buildTimeGridSegPlacements(fixture.segs, fixture.verticals)

    expect(result.placements).toHaveLength(fixture.segs.length)
    expect(result.hiddenGroups).toEqual([])
    expect(placementById(result).get('86987')!.thickness).toBeGreaterThan(0)
    auditVisibleRectangles(
      result,
      'https://github.com/fullcalendar/fullcalendar/issues/7879',
    )
  })
})

type NumericRange = [id: string, start: number, end: number]

interface AdapterFixture {
  segs: TimeGridEventSeg[]
  verticals: TimeGridSegVertical[]
}

function makeSeg(instanceId: string, startMs = 0): TimeGridEventSeg {
  return {
    col: 0,
    startDate: new Date(startMs),
    endDate: new Date(startMs + 1),
    isStart: true,
    isEnd: true,
    eventRange: {
      instance: { instanceId },
      range: { start: new Date(startMs), end: new Date(startMs + 1) },
    },
  } as unknown as TimeGridEventSeg
}

function buildFixture(ranges: NumericRange[]): AdapterFixture {
  return {
    segs: ranges.map(([id]) => makeSeg(id)),
    verticals: ranges.map(([, start, end]) => ({
      start,
      end,
      size: end - start,
      isShort: false,
    })),
  }
}

function placementId(
  placement: TimeGridSegPlacementResult['placements'][number],
): string {
  return placement.seg.eventRange.instance.instanceId
}

function placementById(
  result: TimeGridSegPlacementResult,
): Map<string, TimeGridSegPlacementResult['placements'][number]> {
  return new Map(result.placements.map((placement) => [
    placementId(placement),
    placement,
  ]))
}

function projectPlacements(
  result: TimeGridSegPlacementResult,
): [string, number, number][] {
  return result.placements.map((placement) => [
    placementId(placement),
    placement.levelCoord,
    placement.thickness,
  ])
}

function auditVisibleRectangles(
  result: TimeGridSegPlacementResult,
  label: string,
): void {
  for (const placement of result.placements) {
    expect(Number.isFinite(placement.levelCoord), label).toBe(true)
    expect(Number.isFinite(placement.thickness), label).toBe(true)
    expect(placement.levelCoord, label).toBeGreaterThanOrEqual(0)
    expect(placement.thickness, label).toBeGreaterThan(0)
    expect(
      placement.levelCoord + placement.thickness,
      label,
    ).toBeLessThanOrEqual(1 + Number.EPSILON * 8)
  }

  for (let leftIndex = 0; leftIndex < result.placements.length; leftIndex += 1) {
    const left = result.placements[leftIndex]
    for (
      let rightIndex = leftIndex + 1;
      rightIndex < result.placements.length;
      rightIndex += 1
    ) {
      const right = result.placements[rightIndex]
      if (!spansOverlap(left.segVertical, right.segVertical)) {
        continue
      }

      const separated =
        left.levelCoord + left.thickness <= right.levelCoord + Number.EPSILON * 8 ||
        right.levelCoord + right.thickness <= left.levelCoord + Number.EPSILON * 8
      expect(separated, `${label}: ${placementId(left)} and ${placementId(right)}`).toBe(true)
    }
  }
}

function spansOverlap(
  left: Pick<TimeGridSegVertical, 'start' | 'end'>,
  right: Pick<TimeGridSegVertical, 'start' | 'end'>,
): boolean {
  return left.start < right.end && right.start < left.end
}

/** Exact event geometry and resolved custom ordering from issue #7914. */
function issue7914Fixture(): AdapterFixture {
  const ranges: [string, number, number, string][] = [
    ['0', 14, 14.5, '030'],
    ['1', 14.5, 15, '030'],
    ['2', 15, 16, '010'],
    ['3', 16, 16.5, '030'],
    ['4', 16.5, 17, '030'],
    ['5', 17, 17.5, '030'],
    ['6', 18, 19, '020'],
    ['7', 10, 12, '095'],
    ['8', 12, 14, '095'],
    ['9', 14.5, 16.5, '085'],
    ['10', 16.5, 18.5, '085'],
    ['11', 16.5, 18.5, '095'],
    ['12', 10, 11, '030'],
    ['13', 11, 12, '110'],
    ['14', 14, 14.5, '040'],
    ['15', 16, 17, '010'],
    ['16', 17, 17.5, '030'],
    ['17', 17.5, 18, '030'],
    ['18', 11, 12, '110'],
    ['19', 17.5, 18, '030'],
    ['20', 13.5, 14, '040'],
    ['21', 18, 19, '010'],
    ['22', 12.5, 14, '115'],
    ['23', 14, 15.5, '115'],
    ['24', 14.5, 16.5, '115'],
    ['25', 15.5, 16, '110'],
    ['26', 10, 11, '010'],
    ['27', 13.5, 14, '110'],
    ['28', 18.5, 20.5, '105'],
    ['29', 14, 15, '040'],
    ['30', 16, 17, '040'],
    ['31', 15.5, 17, '075'],
  ]

  return buildFixture(
    ranges
      .sort((left, right) => left[3].localeCompare(right[3]))
      .map(([id, start, end]) => [id, start, end]),
  )
}

/** Exact day-clipped geometry and default start/duration order from issue #7879. */
function issue7879Fixture(): AdapterFixture {
  const ranges: NumericRange[] = [
    ['86987', 10, 13],
    ['86988', 0, 8],
    ['86989', 0, 8],
    ['86990', 8, 22],
    ['86991', 6, 8],
    ['86992', 8, 16.5],
    ['86993', 8, 13],
    ['86994', 8, 12],
    ['86995', 8.5, 9.5],
    ['86996', 8.5, 8.75],
    ['86997', 11.5, 14.5],
    ['86998', 13, 17],
    ['86999', 17, 23],
    ['87000', 18, 23],
    ['87001', 14, 24],
    ['87002', 14, 22],
    ['87003', 16, 23],
    ['87004', 15.5, 23.5],
    ['87005', 18, 23],
  ]

  return buildFixture(ranges.sort((left, right) =>
    left[1] - right[1] ||
    (right[2] - right[1]) - (left[2] - left[1]),
  ))
}
