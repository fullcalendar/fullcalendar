import { htmlEscape } from './util/html'
import { htmlToElement, appendToElement, findElements, createElement } from './util/dom-manip'
import { default as Component, RenderForceFlags } from './component/Component'
import Calendar from './Calendar'
import { ViewSpec } from './structs/view-spec'

/* Toolbar with buttons and title
----------------------------------------------------------------------------------------------------------------------*/

export interface ToolbarRenderProps {
  layout: any
  title: string
  activeButton: string
  isTodayEnabled: boolean
  isPrevEnabled: boolean
  isNextEnabled: boolean
}

export default class Toolbar extends Component {

  calendar: Calendar
  el: HTMLElement = null
  viewsWithButtons: any

  isLayoutRendered: boolean
  layout: any
  title: string
  activeButton: string
  isTodayEnabled: boolean
  isPrevEnabled: boolean
  isNextEnabled: boolean


  constructor(calendar, extraClassName) {
    super()
    this.calendar = calendar
    this.setElement(
      createElement('div', { className: 'fc-toolbar ' + extraClassName })
    )
  }


  render(renderProps: ToolbarRenderProps, forceFlags: RenderForceFlags) {

    // TODO: break layout into left/center/right props, to prevent unnecessary rerenders
    if (renderProps.layout !== this.layout || forceFlags === true) {
      if (this.isLayoutRendered) {
        this.unrenderLayout()
      }
      this.renderLayout(renderProps.layout)
      this.layout = renderProps.layout
      this.isLayoutRendered = true
      forceFlags = true // everything else must render
    }

    if (renderProps.title !== this.title || forceFlags === true) {
      this.updateTitle(renderProps.title)
      this.title = renderProps.title
    }

    if (renderProps.activeButton !== this.activeButton || forceFlags === true) {
      if (this.activeButton) {
        this.deactivateButton(this.activeButton)
      }
      this.activateButton(renderProps.activeButton)
      this.activeButton = renderProps.activeButton
    }

    if (renderProps.isTodayEnabled !== this.isTodayEnabled || forceFlags === true) {
      if (renderProps.isTodayEnabled) {
        this.enableButton('today')
      } else {
        this.disableButton('today')
      }
      this.isTodayEnabled = renderProps.isTodayEnabled
    }

    if (renderProps.isPrevEnabled !== this.isPrevEnabled || forceFlags === true) {
      if (renderProps.isPrevEnabled) {
        this.enableButton('prev')
      } else {
        this.disableButton('prev')
      }
      this.isPrevEnabled = renderProps.isPrevEnabled
    }

    if (renderProps.isNextEnabled !== this.isNextEnabled || forceFlags === true) {
      if (renderProps.isNextEnabled) {
        this.enableButton('next')
      } else {
        this.disableButton('next')
      }
      this.isNextEnabled = renderProps.isNextEnabled
    }
  }


  renderLayout(layout) {
    let el = this.el

    this.viewsWithButtons = []

    appendToElement(el, this.renderSection('left', layout.left))
    appendToElement(el, this.renderSection('right', layout.right))
    appendToElement(el, this.renderSection('center', layout.center))
    appendToElement(el, '<div class="fc-clear"></div>')
  }


  unrenderLayout() {
    this.el.innerHTML = ''
  }


  removeElement() {
    this.unrenderLayout()
    this.isLayoutRendered = false
    this.layout = null
    this.title = null
    this.activeButton = null
    this.isTodayEnabled = null
    this.isPrevEnabled = null
    this.isNextEnabled = null

    super.removeElement()
  }


  renderSection(position, buttonStr) {
    let calendar = this.calendar
    let theme = calendar.theme
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
                theme.getClass('button'),
                theme.getClass('stateDefault')
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

              let allowInteraction = function() {
                const activeClassName = theme.getClass('stateActive')
                const disabledClassName = theme.getClass('stateDisabled')

                return (!activeClassName || !buttonEl.classList.contains(activeClassName)) &&
                  (!disabledClassName || !buttonEl.classList.contains(disabledClassName))
              }

              buttonEl.addEventListener('click', function(ev) {
                const disabledClassName = theme.getClass('stateDisabled')
                const hoverClassName = theme.getClass('stateHover')

                // don't process clicks for disabled buttons
                if (!disabledClassName || !buttonEl.classList.contains(disabledClassName)) {

                  buttonClick(ev)

                  // after the click action, if the button becomes the "active" tab, or disabled,
                  // it should never have a hover class, so remove it now.
                  if (!allowInteraction() && hoverClassName) {
                    buttonEl.classList.remove(hoverClassName)
                  }
                }
              })

              buttonEl.addEventListener('mousedown', function(ev) {
                const downClassName = theme.getClass('stateDown')

                // the *down* effect (mouse pressed in).
                // only on buttons that are not the "active" tab, or disabled
                if (allowInteraction() && downClassName) {
                  buttonEl.classList.add(downClassName)
                }
              })

              buttonEl.addEventListener('mouseup', function(ev) {
                const downClassName = theme.getClass('stateDown')

                // undo the *down* effect
                if (downClassName) {
                  buttonEl.classList.remove(downClassName)
                }
              })

              buttonEl.addEventListener('mouseenter', function(ev) {
                const hoverClassName = theme.getClass('stateHover')

                // the *hover* effect.
                // only on buttons that are not the "active" tab, or disabled
                if (allowInteraction() && hoverClassName) {
                  buttonEl.classList.add(hoverClassName)
                }
              })

              buttonEl.addEventListener('mouseleave', function(ev) {
                const hoverClassName = theme.getClass('stateHover')
                const downClassName = theme.getClass('stateDown')

                // undo the *hover* effect
                if (hoverClassName) {
                  buttonEl.classList.remove(hoverClassName)
                }
                if (downClassName) {
                  buttonEl.classList.remove(downClassName) // if mouseleave happens before mouseup
                }
              })

              groupChildren.push(buttonEl)
            }
          }
        })

        if (isOnlyButtons && groupChildren.length > 0) {
          let cornerLeftClassName = theme.getClass('cornerLeft')
          let cornerRightClassName = theme.getClass('cornerRight')

          if (cornerLeftClassName) {
            groupChildren[0].classList.add(cornerLeftClassName)
          }
          if (cornerRightClassName) {
            groupChildren[groupChildren.length - 1].classList.add(cornerRightClassName)
          }
        }

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


  updateTitle(text) {
    findElements(this.el, 'h2').forEach(function(titleEl) {
      titleEl.innerText = text
    })
  }


  activateButton(buttonName) {
    findElements(this.el, '.fc-' + buttonName + '-button').forEach((buttonEl) => {
      buttonEl.classList.add(this.calendar.theme.getClass('stateActive'))
    })
  }


  deactivateButton(buttonName) {
    findElements(this.el, '.fc-' + buttonName + '-button').forEach((buttonEl) => {
      buttonEl.classList.remove(this.calendar.theme.getClass('stateActive'))
    })
  }


  disableButton(buttonName) {
    findElements(this.el, '.fc-' + buttonName + '-button').forEach((buttonEl: HTMLButtonElement) => {
      buttonEl.disabled = true
      buttonEl.classList.add(this.calendar.theme.getClass('stateDisabled'))
    })
  }


  enableButton(buttonName) {
    findElements(this.el, '.fc-' + buttonName + '-button').forEach((buttonEl: HTMLButtonElement) => {
      buttonEl.disabled = false
      buttonEl.classList.remove(this.calendar.theme.getClass('stateDisabled'))
    })
  }


  getViewsWithButtons() {
    return this.viewsWithButtons
  }

}
