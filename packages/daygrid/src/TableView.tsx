import {
  VNode, h,
  View,
  SimpleScrollGrid,
  SimpleScrollGridSection,
  ChunkContentCallbackArgs,
  createRef,
  ScrollGridSectionConfig,
  ViewRoot
} from '@fullcalendar/core'
import TableDateProfileGenerator from './TableDateProfileGenerator'


/* An abstract class for the daygrid views, as well as month view. Renders one or more rows of day cells.
----------------------------------------------------------------------------------------------------------------------*/
// It is a manager for a Table subcomponent, which does most of the heavy lifting.
// It is responsible for managing width/height.


export default abstract class TableView<State={}> extends View<State> {

  protected headerElRef = createRef<HTMLTableCellElement>()


  renderSimpleLayout(
    headerRowContent: VNode | null,
    bodyContent: (contentArg: ChunkContentCallbackArgs) => VNode
  ) {
    let { props } = this
    let sections: SimpleScrollGridSection[] = []

    if (headerRowContent) {
      sections.push({
        type: 'head',
        chunk: {
          elRef: this.headerElRef,
          rowContent: headerRowContent
        }
      })
    }

    sections.push({
      type: 'body',
      vGrow: true,
      chunk: {
        content: bodyContent
      }
    })

    return (
      <ViewRoot viewSpec={props.viewSpec}>
        {(rootElRef, classNames) => (
          <div ref={rootElRef} class={[ 'fc-daygrid-view' ].concat(classNames).join(' ')}>
            <SimpleScrollGrid
              vGrow={!props.isHeightAuto}
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

    let { props } = this
    let sections: ScrollGridSectionConfig[] = []

    if (headerRowContent) {
      sections.push({
        type: 'head',
        chunks: [{
          elRef: this.headerElRef,
          rowContent: headerRowContent
        }]
      })
    }

    sections.push({
      type: 'body',
      vGrow: true,
      chunks: [{
        content: bodyContent
      }]
    })

    return (
      <ViewRoot viewSpec={props.viewSpec}>
        {(rootElRef, classNames) => (
          <div ref={rootElRef} class={[ 'fc-daygrid-view' ].concat(classNames).join(' ')}>
            <ScrollGrid
              vGrow={!props.isHeightAuto}
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

TableView.prototype.dateProfileGeneratorClass = TableDateProfileGenerator
