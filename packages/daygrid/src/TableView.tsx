import {
  VNode, h,
  View,
  getViewClassNames,
  SimpleScrollGrid,
  SimpleScrollGridSection,
  ChunkContentCallbackArgs,
  createRef
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
    let classNames = getViewClassNames(props.viewSpec).concat('fc-dayGrid-view')
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
      <div class={classNames.join(' ')}>
        <SimpleScrollGrid
          vGrow={!props.isHeightAuto}
          forPrint={props.forPrint}
          cols={[] /* TODO: make optional? */}
          sections={sections}
        />
      </div>
    )
  }


  renderHScrollLayout(
    headerRowContent: VNode | null,
    bodyContent: (contentArg: ChunkContentCallbackArgs) => VNode,
    columnMinWidth: number
  ) {
    // let colConfigs = []
    // if (hasAxis) {
    //   colConfigs.push({ width: 'shrink' })
    // }

    if (!this.context.pluginHooks.scrollGridImpl) {
      throw new Error('No ScrollGrid implementation')
    }
  }

}

TableView.prototype.dateProfileGeneratorClass = TableDateProfileGenerator
