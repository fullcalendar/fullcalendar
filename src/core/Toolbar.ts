import { htmlEscape } from './util/html'
import { htmlToElement, appendToElement, findElements, createElement, removeElement } from './util/dom-manip'
import Component, { ComponentContext } from './component/Component'
import { ViewSpec } from './structs/view-spec'
import { memoizeRendering } from './component/memoized-rendering'

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

export default class Toolbar extends Component<ToolbarRenderProps> {

  el: HTMLElement
  viewsWithButtons: any

  private _renderLayout = memoizeRendering(this.renderLayout, this.unrenderLayout)
  private _updateTitle = memoizeRendering(this.updateTitle, null, [ this._renderLayout ])
  private _updateActiveButton = memoizeRendering(this.updateActiveButton, null, [ this._renderLayout ])
  private _updateToday = memoizeRendering(this.updateToday, null, [ this._renderLayout ])
  private _updatePrev = memoizeRendering(this.updatePrev, null, [ this._renderLayout ])
  private _updateNext = memoizeRendering(this.updateNext, null, [ this._renderLayout ])


  constructor(context: ComponentContext, extraClassName) {
    super(context)

    this.el = createElement('div', { className: 'fc-toolbar ' + extraClassName })
  }


  destroy() {
    super.destroy()

    this._renderLayout.unrender() // should unrender everything else
    removeElement(this.el)
  }


  render(props: ToolbarRenderProps) {
    this._renderLayout(props.layout)
    this._updateTitle(props.title)
    this._updateActiveButton(props.activeButton)
    this._updateToday(props.isTodayEnabled)
    this._updatePrev(props.isPrevEnabled)
    this._updateNext(props.isNextEnabled)
  }


  renderLayout(layout) {
    let { el } = this

    this.viewsWithButtons = []

    appendToElement(el, this.renderSection('left', layout.left))
    appendToElement(el, this.renderSection('right', layout.right))
    appendToElement(el, this.renderSection('center', layout.center))
    appendToElement(el, '<div class="fc-clear"></div>')
  }


  unrenderLayout() {
    this.el.innerHTML = ''
  }


  renderSection(position, buttonStr) {
    let { theme, calendar } = this
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


  updateToday(isTodayEnabled) {
    this.toggleButtonEnabled('today', isTodayEnabled)
  }


  updatePrev(isPrevEnabled) {
    this.toggleButtonEnabled('prev', isPrevEnabled)
  }


  updateNext(isNextEnabled) {
    this.toggleButtonEnabled('next', isNextEnabled)
  }


  updateTitle(text) {
    findElements(this.el, 'h2').forEach(function(titleEl) {
      titleEl.innerText = text
    })
  }


  updateActiveButton(buttonName?) {
    let className = this.theme.getClass('stateActive')

    findElements(this.el, 'button').forEach((buttonEl) => { // fyi, themed buttons don't have .fc-button
      if (buttonName && buttonEl.classList.contains('fc-' + buttonName + '-button')) {
        buttonEl.classList.add(className)
      } else {
        buttonEl.classList.remove(className)
      }
    })
  }


  toggleButtonEnabled(buttonName, bool) {
    let disabledClassName = this.theme.getClass('stateDisabled')

    findElements(this.el, '.fc-' + buttonName + '-button').forEach((buttonEl: HTMLButtonElement) => {
      buttonEl.disabled = !bool

      if (bool) {
        buttonEl.classList.remove(disabledClassName)
      } else {
        buttonEl.classList.add(disabledClassName)
      }
    })
  }

}
