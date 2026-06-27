import { BaseComponent } from '../vdom-util'
import { ToolbarModel, ToolbarWidget } from '../toolbar-struct'
import { ToolbarSection, ToolbarContent } from './ToolbarSection'
import { joinClassNames } from '../util/html'
import { generateClassName } from '../content-inject/ContentContainer'
import { computeViewBorderless } from '../util/misc'

export interface ToolbarProps extends ToolbarContent {
  model: ToolbarModel
  isHeader: boolean
  titleId?: string
}

export class Toolbar extends BaseComponent<ToolbarProps> {
  render() {
    let { props } = this
    let options = this.context.options
    let { sectionWidgets } = props.model

    const { borderlessX, borderlessTop, borderlessBottom } = computeViewBorderless(options)
    const toolbarClassOption = props.isHeader ? options.headerToolbarClass : options.footerToolbarClass

    return (
      <div
        className={joinClassNames(
          generateClassName(toolbarClassOption, { borderlessX, borderlessTop, borderlessBottom }),
          generateClassName(options.toolbarClass, { borderlessX, borderlessTop, borderlessBottom }),
        )}
      >
        {this.renderSection('start', sectionWidgets.start)}
        {this.renderSection('center', sectionWidgets.center)}
        {this.renderSection('end', sectionWidgets.end)}
      </div>
    )
  }

  renderSection(name: string, widgetGroups: ToolbarWidget[][]) {
    let { props } = this

    return (
      <ToolbarSection
        key={name}
        name={name}
        widgetGroups={widgetGroups}
        title={props.title}
        titleId={props.titleId}
        navUnit={props.navUnit}
        selectedButton={props.selectedButton}
        isTodayEnabled={props.isTodayEnabled}
        isPrevEnabled={props.isPrevEnabled}
        isNextEnabled={props.isNextEnabled}
      />
    )
  }
}
