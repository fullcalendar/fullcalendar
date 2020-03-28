import { h } from './vdom'
import { BaseComponent } from './vdom-util'
import { ToolbarModel, ToolbarWidget } from './toolbar-parse'


export interface ToolbarProps extends ToolbarContent {
  extraClassName: string
  model: ToolbarModel
}

export interface ToolbarContent {
  title: string
  activeButton: string
  isTodayEnabled: boolean
  isPrevEnabled: boolean
  isNextEnabled: boolean
}


export default class Toolbar extends BaseComponent<ToolbarProps> {


  render(props: ToolbarProps) {
    let { model } = props

    return (
      <div class={'fc-toolbar ' + props.extraClassName}>
        {this.renderSection('left', model.left)}
        {this.renderSection('center', model.center)}
        {this.renderSection('right', model.right)}
      </div>
    )
  }


  renderSection(position: string, widgetGroups: ToolbarWidget[][]) {
    let { props } = this

    return (
      <ToolbarSection
        position={position}
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


interface ToolbarSectionProps extends ToolbarContent {
  position: string
  widgetGroups: ToolbarWidget[][]
}

class ToolbarSection extends BaseComponent<ToolbarSectionProps> {

  render(props: ToolbarSectionProps) {
    let { theme } = this.context

    return (
      <div class={'fc-toolbar-' + props.position}>
        {props.widgetGroups.map((widgetGroup: ToolbarWidget[]) => {
          let children = []
          let isOnlyButtons = true

          for (let widget of widgetGroup) {
            let { buttonName, buttonClick, buttonText, buttonIcon } = widget

            if (buttonName === 'title') {
              isOnlyButtons = false
              children.push(
                <h2 className='fc-toolbar-title'>{props.title}</h2>
              )

            } else {
              let ariaAttrs = buttonIcon ? { 'aria-label': buttonName } : {}

              let buttonClasses = [ 'fc-' + buttonName + '-button', theme.getClass('button') ]
              if (buttonName === props.activeButton) {
                buttonClasses.push(theme.getClass('buttonActive'))
              }

              let isDisabled =
                (!props.isTodayEnabled && buttonName === 'today') ||
                (!props.isPrevEnabled && buttonName === 'prev') ||
                (!props.isNextEnabled && buttonName === 'next')

              children.push(
                <button
                  disabled={isDisabled}
                  class={buttonClasses.join(' ')}
                  onClick={buttonClick}
                  { ...ariaAttrs }
                >{ buttonText || (buttonIcon ? <span class={buttonIcon} /> : '')}</button>
              )
            }
          }

          if (children.length > 1) {
            let groupClasses = (isOnlyButtons && theme.getClass('buttonGroup')) || ''

            return (<div class={groupClasses}>{children}</div>)
          } else {
            return children[0]
          }

        })}
      </div>
    )
  }

}
