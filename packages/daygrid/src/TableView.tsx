import {
  VNode, createElement,
  SimpleScrollGrid,
  SimpleScrollGridSection,
  ChunkContentCallbackArgs,
  createRef,
  ScrollGridSectionConfig,
  ViewRoot,
  DateComponent,
  ViewProps,
  RefObject,
  renderScrollShim,
  getStickyHeaderDates,
  getStickyFooterScrollbar,
  ChunkConfigRowContent,
  Dictionary,
} from '@fullcalendar/common'

/* An abstract class for the daygrid views, as well as month view. Renders one or more rows of day cells.
----------------------------------------------------------------------------------------------------------------------*/
// It is a manager for a Table subcomponent, which does most of the heavy lifting.
// It is responsible for managing width/height.

export abstract class TableView<State=Dictionary> extends DateComponent<ViewProps, State> {
  protected headerElRef: RefObject<HTMLTableCellElement> = createRef<HTMLTableCellElement>()

  renderSimpleLayout(
    headerRowContent: ChunkConfigRowContent,
    bodyContent: (contentArg: ChunkContentCallbackArgs) => VNode,
  ) {
    let { props, context } = this
    let sections: SimpleScrollGridSection[] = []
    let stickyHeaderDates = getStickyHeaderDates(context.options)

    if (headerRowContent) {
      sections.push({
        type: 'header',
        key: 'header',
        isSticky: stickyHeaderDates,
        chunk: {
          elRef: this.headerElRef,
          tableClassName: 'fc-col-header',
          rowContent: headerRowContent,
        },
      })
    }

    sections.push({
      type: 'body',
      key: 'body',
      liquid: true,
      chunk: { content: bodyContent },
    })

    return (
      <ViewRoot viewSpec={context.viewSpec}>
        {(rootElRef, classNames) => (
          <div ref={rootElRef} className={['fc-daygrid'].concat(classNames).join(' ')}>
            <SimpleScrollGrid
              liquid={!props.isHeightAuto && !props.forPrint}
              collapsibleWidth={props.forPrint}
              cols={[] /* TODO: make optional? */}
              sections={sections}
            />
          </div>
        )}
      </ViewRoot>
    )
  }

  renderHScrollLayout(
    headerRowContent: ChunkConfigRowContent,
    bodyContent: (contentArg: ChunkContentCallbackArgs) => VNode,
    colCnt: number,
    dayMinWidth: number,
  ) {
    let ScrollGrid = this.context.pluginHooks.scrollGridImpl

    if (!ScrollGrid) {
      throw new Error('No ScrollGrid implementation')
    }

    let { props, context } = this
    let stickyHeaderDates = !props.forPrint && getStickyHeaderDates(context.options)
    let stickyFooterScrollbar = !props.forPrint && getStickyFooterScrollbar(context.options)
    let sections: ScrollGridSectionConfig[] = []

    if (headerRowContent) {
      sections.push({
        type: 'header',
        key: 'header',
        isSticky: stickyHeaderDates,
        chunks: [{
          key: 'main',
          elRef: this.headerElRef,
          tableClassName: 'fc-col-header',
          rowContent: headerRowContent,
        }],
      })
    }

    sections.push({
      type: 'body',
      key: 'body',
      liquid: true,
      chunks: [{
        key: 'main',
        content: bodyContent,
      }],
    })

    if (stickyFooterScrollbar) {
      sections.push({
        type: 'footer',
        key: 'footer',
        isSticky: true,
        chunks: [{
          key: 'main',
          content: renderScrollShim,
        }],
      })
    }

    return (
      <ViewRoot viewSpec={context.viewSpec}>
        {(rootElRef, classNames) => (
          <div ref={rootElRef} className={['fc-daygrid'].concat(classNames).join(' ')}>
            <ScrollGrid
              liquid={!props.isHeightAuto && !props.forPrint}
              collapsibleWidth={props.forPrint}
              colGroups={[{ cols: [{ span: colCnt, minWidth: dayMinWidth }] }]}
              sections={sections}
            />
          </div>
        )}
      </ViewRoot>
    )
  }
}
