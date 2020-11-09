import { createElement } from './vdom'
import { BaseComponent } from './vdom-util'
import { ToolbarModel, ToolbarWidget } from './toolbar-struct'
import { ToolbarSection, ToolbarContent } from './ToolbarSection'

export interface ToolbarProps extends ToolbarContent {
  extraClassName: string // wish this could be array, but easier for pureness
  model: ToolbarModel
}

export class Toolbar extends BaseComponent<ToolbarProps> {
  render() {
    let { model, extraClassName } = this.props
    let forceLtr = false
    let startContent
    let endContent
    let centerContent = model.center

    if (model.left) {
      forceLtr = true
      startContent = model.left
    } else {
      startContent = model.start
    }

    if (model.right) {
      forceLtr = true
      endContent = model.right
    } else {
      endContent = model.end
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
        activeButton={props.activeButton}
        isTodayEnabled={props.isTodayEnabled}
        isPrevEnabled={props.isPrevEnabled}
        isNextEnabled={props.isNextEnabled}
      />
    )
  }
}
