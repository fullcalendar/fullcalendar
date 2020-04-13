import {
  VNode, h,
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
  getStickyFooterScrollbar
} from '@fullcalendar/core'


/* An abstract class for the daygrid views, as well as month view. Renders one or more rows of day cells.
----------------------------------------------------------------------------------------------------------------------*/
// It is a manager for a Table subcomponent, which does most of the heavy lifting.
// It is responsible for managing width/height.


export default abstract class TableView<State={}> extends DateComponent<ViewProps, State> {

  protected headerElRef: RefObject<HTMLTableCellElement> = createRef<HTMLTableCellElement>()


  renderSimpleLayout(
    headerRowContent: VNode | null,
    bodyContent: (contentArg: ChunkContentCallbackArgs) => VNode
  ) {
    let { props, context } = this
    let sections: SimpleScrollGridSection[] = []
    let stickyHeaderDates = getStickyHeaderDates(context.options)

    if (headerRowContent) {
      sections.push({
        type: 'header',
        isSticky: stickyHeaderDates,
        chunk: {
          elRef: this.headerElRef,
          tableClassName: 'fc-col-header',
          rowContent: headerRowContent
        }
      })
    }

    sections.push({
      type: 'body',
      liquid: true,
      chunk: { content: bodyContent }
    })

    return (
      <ViewRoot viewSpec={props.viewSpec}>
        {(rootElRef, classNames) => (
          <div ref={rootElRef} class={[ 'fc-daygrid' ].concat(classNames).join(' ')}>
            <SimpleScrollGrid
              liquid={!props.isHeightAuto}
              forPrint={props.forPrint}
              cols={[] /* TODO: make optional? */}
              sections={sections}
            />
          </div>
        )}
      </ViewRoot>
    )
  }


  renderHScrollLayout(
    headerRowContent: VNode | null,
    bodyContent: (contentArg: ChunkContentCallbackArgs) => VNode,
    colCnt: number,
    dayMinWidth: number
  ) {
    let ScrollGrid = this.context.pluginHooks.scrollGridImpl

    if (!ScrollGrid) {
      throw new Error('No ScrollGrid implementation')
    }

    let { props, context } = this
    let stickyHeaderDates = getStickyHeaderDates(context.options)
    let stickyFooterScrollbar = getStickyFooterScrollbar(context.options)
    let sections: ScrollGridSectionConfig[] = []

    if (headerRowContent) {
      sections.push({
        type: 'header',
        isSticky: stickyHeaderDates,
        chunks: [{
          elRef: this.headerElRef,
          tableClassName: 'fc-col-header',
          rowContent: headerRowContent
        }]
      })
    }

    sections.push({
      type: 'body',
      liquid: true,
      chunks: [{
        content: bodyContent
      }]
    })

    if (stickyFooterScrollbar) {
      sections.push({
        type: 'footer',
        isSticky: true,
        chunks: [{ content: renderScrollShim }]
      })
    }

    return (
      <ViewRoot viewSpec={props.viewSpec}>
        {(rootElRef, classNames) => (
          <div ref={rootElRef} class={[ 'fc-daygrid' ].concat(classNames).join(' ')}>
            <ScrollGrid
              liquid={!props.isHeightAuto}
              forPrint={props.forPrint}
              colGroups={[ { cols: [ { span: colCnt, minWidth: dayMinWidth } ] } ]}
              sections={sections}
            />
          </div>
        )}
      </ViewRoot>
    )
  }

}
