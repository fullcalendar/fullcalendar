import { createElement } from './preact.js'
import { BaseComponent } from './vdom-util.js'
import { ToolbarModel, ToolbarWidget } from './toolbar-struct.js'
import { ToolbarSection, ToolbarContent } from './ToolbarSection.js'

export interface ToolbarProps extends ToolbarContent {
  extraClassName: string // wish this could be array, but easier for pureness
  model: ToolbarModel
  titleId: string
}

export class Toolbar extends BaseComponent<ToolbarProps> {
  render() {
    let { model, extraClassName } = this.props
    let forceLtr = false
    let startContent
    let endContent
    let sectionWidgets = model.sectionWidgets
    let centerContent = sectionWidgets.center

    if (sectionWidgets.left) {
      forceLtr = true
      startContent = sectionWidgets.left
    } else {
      startContent = sectionWidgets.start
    }

    if (sectionWidgets.right) {
      forceLtr = true
      endContent = sectionWidgets.right
    } else {
      endContent = sectionWidgets.end
    }

    let classNames = [
      extraClassName || '',
      'fc-toolbar',
      forceLtr ? 'fc-toolbar-ltr' : '',
    ]

    return (
      <div className={classNames.join(' ')}>
        {this.renderSection('start', startContent || [])}
        {this.renderSection('center', centerContent || [])}
        {this.renderSection('end', endContent || [])}
      </div>
    )
  }

  renderSection(key: string, widgetGroups: ToolbarWidget[][]) {
    let { props } = this

    return (
      <ToolbarSection
        key={key}
        widgetGroups={widgetGroups}
        title={props.title}
        navUnit={props.navUnit}
        activeButton={props.activeButton}
        isTodayEnabled={props.isTodayEnabled}
        isPrevEnabled={props.isPrevEnabled}
        isNextEnabled={props.isNextEnabled}
        titleId={props.titleId}
      />
    )
  }
}
