import { flushSync } from 'preact/compat'
import { createRoot } from 'preact/compat/client'
import {
  CssDimValue,
  CalendarOptions,
} from '@fullcalendar/preact/public-api'
import {
  Action,
  CalendarDataManager,
  CalendarData,
  DelayedRunner,
  applyStyleProp,
  CalendarApiImpl,
  CalendarInner,
  CalendarMediaRoot,
  computeRootClassName,
  RenderId,
  guid,
} from '@fullcalendar/preact/protected-api'
import { StrictMode } from './vdom-config'

/*
Vanilla JS API
*/
export class Calendar extends CalendarApiImpl {
  el: HTMLElement
  private baseId = `fc:${guid()}:`
  private dataManager: CalendarDataManager
  private currentData: CalendarData
  private renderRunner: DelayedRunner
  private vdomRoot: { render: (vdomNode: any) => any, unmount: () => void } // TODO types
  private isRendering = false
  private isRendered = false
  private customContentRenderId = 0
  private currentClassName = ''
  private currentColorScheme = ''

  constructor(el: HTMLElement, optionOverrides: CalendarOptions = {}) {
    super()

    this.el = el
    this.vdomRoot = createRoot(el)
    this.renderRunner = new DelayedRunner(this.handleRenderRequest)

    this.dataManager = new CalendarDataManager({
      calendarApi: this,
      onDataChange: this.handleDataChange,
    })
    this.currentData = this.dataManager.update(optionOverrides)
  }

  private handleDataChange = (data: CalendarData, actions: Action[]) => {
    this.currentData = data

    let renderImmediate = false
    for (const action of actions) {
      if (
        action.type === 'SET_EVENT_DRAG' ||
        action.type === 'UNSET_EVENT_DRAG' ||
        action.type === 'SET_EVENT_RESIZE' ||
        action.type === 'UNSET_EVENT_RESIZE' ||
        // could happen as a result of a drag or resize and must be part of same sync pipeline
        action.type === 'MERGE_EVENTS'
      ) {
        renderImmediate = true
        break
      }
    }

    this.renderRunner.request(renderImmediate ? undefined : data.calendarOptions.rerenderDelay)
  }

  private handleRenderRequest = () => {
    if (this.isRendering) {
      let { currentData } = this
      this.isRendered = true

      flushSync(() => {
        this.vdomRoot.render(
          <StrictMode>
            <RenderId.Provider value={this.customContentRenderId}>
              <CalendarMediaRoot emitter={currentData.emitter}>
                {(forPrint: boolean) => {
                  const options = currentData.calendarOptions
                  const isRtl = options.direction === 'rtl'
                  const className = computeRootClassName(options, forPrint)

                  this.setIsRtl(isRtl)
                  this.setClassName(className)
                  this.setHeight(options.height)
                  this.setColorScheme(options.colorScheme || '')

                  return (
                    <CalendarInner
                      {...currentData}
                      forPrint={forPrint}
                      baseId={this.baseId}
                    />
                  )
                }}
              </CalendarMediaRoot>
            </RenderId.Provider>
          </StrictMode>
        )
      })
    } else if (this.isRendered) {
      this.isRendered = false
      this.vdomRoot.unmount()

      this.setIsRtl(false)
      this.setClassName('')
      this.setHeight('')
      this.setColorScheme('')
    }
  }

  render() {
    let wasRendering = this.isRendering

    if (!wasRendering) {
      this.isRendering = true
    } else {
      this.customContentRenderId += 1
    }

    this.renderRunner.request()
  }

  destroy(): void {
    if (this.isRendering) {
      this.isRendering = false
      this.renderRunner.request()
    }

    this.dataManager.destroy()
  }

  batchRendering(func): void {
    this.renderRunner.pause('batchRendering')
    func()
    this.renderRunner.resume('batchRendering')
  }

  pauseRendering() { // available to plugins
    this.renderRunner.pause('pauseRendering')
  }

  resumeRendering() { // available to plugins
    this.renderRunner.resume('pauseRendering', true)
  }

  resetOptions(optionOverrides, changedOptionNames?: string[]) {
    this.currentDataManager.resetOptions(optionOverrides, changedOptionNames)
  }

  private setClassName(className: string) {
    if (className !== this.currentClassName) {
      let { classList } = this.el

      for (let singleClassName of this.currentClassName.split(' ')) {
        if (singleClassName) {
          classList.remove(singleClassName)
        }
      }

      for (let singleClassName of className.split(' ')) {
        if (singleClassName) {
          classList.add(singleClassName)
        }
      }

      this.currentClassName = className
    }
  }

  private setHeight(height: CssDimValue) {
    applyStyleProp(this.el, 'height', height)
  }

  private setColorScheme(colorScheme: string) {
    if (colorScheme !== this.currentColorScheme) {
      if (colorScheme) {
        this.el.dataset.colorScheme = colorScheme
      } else {
        delete this.el.dataset.colorScheme
      }
      this.currentColorScheme = colorScheme
    }
  }

  private setIsRtl(isRtl: boolean) {
    if (isRtl) {
      this.el.dir = 'rtl'
    } else {
      this.el.removeAttribute('dir')
    }
  }
}
