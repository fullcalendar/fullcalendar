import { createElement, VNode } from './preact.js'
import { BaseComponent } from './vdom-util.js'
import { ToolbarWidget } from './toolbar-struct.js'

export interface ToolbarContent {
  title: string
  titleId: string
  navUnit: string
  activeButton: string
  isTodayEnabled: boolean
  isPrevEnabled: boolean
  isNextEnabled: boolean
}

export interface ToolbarSectionProps extends ToolbarContent {
  widgetGroups: ToolbarWidget[][]
}

export class ToolbarSection extends BaseComponent<ToolbarSectionProps> {
  render(): any {
    let children = this.props.widgetGroups.map((widgetGroup) => this.renderWidgetGroup(widgetGroup))

    return createElement('div', { className: 'fc-toolbar-chunk' }, ...children)
  }

  renderWidgetGroup(widgetGroup: ToolbarWidget[]): any {
    let { props } = this
    let { theme } = this.context
    let children: VNode[] = []
    let isOnlyButtons = true

    for (let widget of widgetGroup) {
      let { buttonName, buttonClick, buttonText, buttonIcon, buttonHint } = widget

      if (buttonName === 'title') {
        isOnlyButtons = false
        children.push(
          <h2 className="fc-toolbar-title" id={props.titleId}>{props.title}</h2>,
        )
      } else {
        let isPressed = buttonName === props.activeButton
        let isDisabled =
          (!props.isTodayEnabled && buttonName === 'today') ||
          (!props.isPrevEnabled && buttonName === 'prev') ||
          (!props.isNextEnabled && buttonName === 'next')

        let buttonClasses = [`fc-${buttonName}-button`, theme.getClass('button')]
        if (isPressed) {
          buttonClasses.push(theme.getClass('buttonActive'))
        }

        children.push(
          <button
            type="button"
            title={typeof buttonHint === 'function' ? buttonHint(props.navUnit) : buttonHint}
            disabled={isDisabled}
            aria-pressed={isPressed}
            className={buttonClasses.join(' ')}
            onClick={buttonClick}
          >
            {buttonText || (buttonIcon ? <span className={buttonIcon} role="img" /> : '')}
          </button>,
        )
      }
    }

    if (children.length > 1) {
      let groupClassName = (isOnlyButtons && theme.getClass('buttonGroup')) || ''

      return createElement('div', { className: groupClassName }, ...children)
    }
    return children[0]
  }
}
