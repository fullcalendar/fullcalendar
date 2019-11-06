import { htmlEscape } from './util/html'
import { htmlToElement, appendToElement, findElements, createElement } from './util/dom-manip'
import ComponentContext from './component/ComponentContext'
import { Component, renderer, DomLocation } from './view-framework'
import { ViewSpec } from './structs/view-spec'
import Calendar from './Calendar'
import Theme from './theme/Theme'


/* Toolbar with buttons and title
----------------------------------------------------------------------------------------------------------------------*/

export interface ToolbarRenderProps extends DomLocation {
  extraClassName: string
  layout: any
  title: string
  activeButton: string
  isTodayEnabled: boolean
  isPrevEnabled: boolean
  isNextEnabled: boolean
}

export default class Toolbar extends Component<ToolbarRenderProps, ComponentContext> {

  private renderBase = renderer(this._renderBase)
  private renderTitle = renderer(renderTitle)
  private renderActiveButton = renderer(renderActiveButton, unrenderActiveButton)
  private renderToday = renderer(toggleButtonEnabled.bind(null, 'today'))
  private renderPrev = renderer(toggleButtonEnabled.bind(null, 'prev'))
  private renderNext = renderer(toggleButtonEnabled.bind(null, 'next'))

  public viewsWithButtons: string[]


  render(props: ToolbarRenderProps) {

    let el = this.renderBase({
      extraClassName: props.extraClassName,
      layout: props.layout
    })

    this.renderTitle({ el, text: props.title })
    this.renderActiveButton({ el, buttonName: props.activeButton })
    this.renderToday({ el, isEnabled: props.isTodayEnabled })
    this.renderPrev({ el, isEnabled: props.isPrevEnabled })
    this.renderNext({ el, isEnabled: props.isNextEnabled })

    return el
  }


  /*
  the wrapper el and the left/center/right layout
  */
  _renderBase({ extraClassName , layout }, context: ComponentContext) {
    let { theme, calendar } = context

    let el = createElement('div', { className: 'fc-toolbar ' + extraClassName }, [
      this.renderSection('left', layout.left, theme, calendar),
      this.renderSection('center', layout.center, theme, calendar),
      this.renderSection('right', layout.right, theme, calendar)
    ])

    this.viewsWithButtons = []

    return el
  }


  renderSection(position, buttonStr, theme: Theme, calendar: Calendar) {
    let optionsManager = calendar.optionsManager
    let viewSpecs = calendar.viewSpecs
    let sectionEl = createElement('div', { className: 'fc-' + position })
    let calendarCustomButtons = optionsManager.computed.customButtons || {}
    let calendarButtonTextOverrides = optionsManager.overrides.buttonText || {}
    let calendarButtonText = optionsManager.computed.buttonText || {}

    if (buttonStr) {
      buttonStr.split(' ').forEach((buttonGroupStr, i) => {
        let groupChildren = []
        let isOnlyButtons = true
        let groupEl

        buttonGroupStr.split(',').forEach((buttonName, j) => {
          let customButtonProps
          let viewSpec: ViewSpec
          let buttonClick
          let buttonIcon // only one of these will be set
          let buttonText // "
          let buttonInnerHtml
          let buttonClasses
          let buttonEl: HTMLElement
          let buttonAriaAttr

          if (buttonName === 'title') {
            groupChildren.push(htmlToElement('<h2>&nbsp;</h2>')) // we always want it to take up height
            isOnlyButtons = false
          } else {

            if ((customButtonProps = calendarCustomButtons[buttonName])) {
              buttonClick = function(ev) {
                if (customButtonProps.click) {
                  customButtonProps.click.call(buttonEl, ev)
                }
              };
              (buttonIcon = theme.getCustomButtonIconClass(customButtonProps)) ||
              (buttonIcon = theme.getIconClass(buttonName)) ||
              (buttonText = customButtonProps.text)
            } else if ((viewSpec = viewSpecs[buttonName])) {
              this.viewsWithButtons.push(buttonName)
              buttonClick = function() {
                calendar.changeView(buttonName)
              };
              (buttonText = viewSpec.buttonTextOverride) ||
              (buttonIcon = theme.getIconClass(buttonName)) ||
              (buttonText = viewSpec.buttonTextDefault)
            } else if (calendar[buttonName]) { // a calendar method
              buttonClick = function() {
                calendar[buttonName]()
              };
              (buttonText = calendarButtonTextOverrides[buttonName]) ||
              (buttonIcon = theme.getIconClass(buttonName)) ||
              (buttonText = calendarButtonText[buttonName])
              //            ^ everything else is considered default
            }

            if (buttonClick) {

              buttonClasses = [
                'fc-' + buttonName + '-button',
                theme.getClass('button')
              ]

              if (buttonText) {
                buttonInnerHtml = htmlEscape(buttonText)
                buttonAriaAttr = ''
              } else if (buttonIcon) {
                buttonInnerHtml = "<span class='" + buttonIcon + "'></span>"
                buttonAriaAttr = ' aria-label="' + buttonName + '"'
              }

              buttonEl = htmlToElement( // type="button" so that it doesn't submit a form
                '<button type="button" class="' + buttonClasses.join(' ') + '"' +
                  buttonAriaAttr +
                '>' + buttonInnerHtml + '</button>'
              )

              buttonEl.addEventListener('click', buttonClick)

              groupChildren.push(buttonEl)
            }
          }
        })

        if (groupChildren.length > 1) {
          groupEl = document.createElement('div')

          let buttonGroupClassName = theme.getClass('buttonGroup')
          if (isOnlyButtons && buttonGroupClassName) {
            groupEl.classList.add(buttonGroupClassName)
          }

          appendToElement(groupEl, groupChildren)
          sectionEl.appendChild(groupEl)
        } else {
          appendToElement(sectionEl, groupChildren) // 1 or 0 children
        }
      })
    }

    return sectionEl
  }

}


function renderTitle(props: { el: HTMLElement, text: string }) {
  findElements(props.el, 'h2').forEach(function(titleEl) {
    titleEl.innerText = props.text
  })
}


function renderActiveButton(props: { el: HTMLElement, buttonName: string }, context: ComponentContext) {
  let { buttonName } = props
  let className = context.theme.getClass('buttonActive')

  findElements(props.el, 'button').forEach((buttonEl) => { // fyi, themed buttons don't have .fc-button
    if (buttonEl.classList.contains('fc-' + buttonName + '-button')) {
      buttonEl.classList.add(className)
    }
  })

  return props
}


function unrenderActiveButton(props: { el: HTMLElement, buttonName: string }, context: ComponentContext) {
  let className = context.theme.getClass('buttonActive')

  findElements(props.el, 'button').forEach((buttonEl) => { // fyi, themed buttons don't have .fc-button
    buttonEl.classList.remove(className)
  })
}


function toggleButtonEnabled(buttonName: string, props: { el: HTMLElement, isEnabled: boolean }) {
  findElements(props.el, '.fc-' + buttonName + '-button').forEach((buttonEl: HTMLButtonElement) => {
    buttonEl.disabled = !props.isEnabled
  })
}
