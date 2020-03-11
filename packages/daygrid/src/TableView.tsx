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


  renderLayout(headerRowContent: VNode | null, bodyContent: (contentArg: ChunkContentCallbackArgs) => VNode) {
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

}

TableView.prototype.dateProfileGeneratorClass = TableDateProfileGenerator
