import {
  CalendarOptions, Action, CalendarContent, render, createElement, DelayedRunner, CssDimValue, applyStyleProp,
  CalendarApi, CalendarRoot, isArraysEqual, CalendarDataManager, CalendarData,
  CustomContentRenderContext, flushToDom, unmountComponentAtNode,
} from '@fullcalendar/common'

export class Calendar extends CalendarApi {
  currentData: CalendarData
  renderRunner: DelayedRunner
  el: HTMLElement
  isRendering = false
  isRendered = false
  currentClassNames: string[] = []
  customContentRenderId = 0 // will affect custom generated classNames?

  get view() { return this.currentData.viewApi } // for public API

  constructor(el: HTMLElement, optionOverrides: CalendarOptions = {}) {
    super()

    this.el = el
    this.renderRunner = new DelayedRunner(this.handleRenderRequest)

    new CalendarDataManager({ // eslint-disable-line no-new
      optionOverrides,
      calendarApi: this,
      onAction: this.handleAction,
      onData: this.handleData,
    })
  }

  handleAction = (action: Action) => {
    // actions we know we want to render immediately
    switch (action.type) {
      case 'SET_EVENT_DRAG':
      case 'SET_EVENT_RESIZE':
        this.renderRunner.tryDrain()
    }
  }

  handleData = (data: CalendarData) => {
    this.currentData = data
    this.renderRunner.request(data.calendarOptions.rerenderDelay)
  }

  handleRenderRequest = () => {
    if (this.isRendering) {
      this.isRendered = true
      let { currentData } = this

      render(
        <CalendarRoot options={currentData.calendarOptions} theme={currentData.theme} emitter={currentData.emitter}>
          {(classNames, height, isHeightAuto, forPrint) => {
            this.setClassNames(classNames)
            this.setHeight(height)

            return (
              <CustomContentRenderContext.Provider value={this.customContentRenderId}>
                <CalendarContent
                  isHeightAuto={isHeightAuto}
                  forPrint={forPrint}
                  {...currentData}
                />
              </CustomContentRenderContext.Provider>
            )
          }}
        </CalendarRoot>,
        this.el,
      )
    } else if (this.isRendered) {
      this.isRendered = false
      unmountComponentAtNode(this.el)
      this.setClassNames([])
      this.setHeight('')
    }

    flushToDom()
  }

  render() {
    let wasRendering = this.isRendering

    if (!wasRendering) {
      this.isRendering = true
    } else {
      this.customContentRenderId += 1
    }

    this.renderRunner.request()

    if (wasRendering) {
      this.updateSize()
    }
  }

  destroy() {
    if (this.isRendering) {
      this.isRendering = false
      this.renderRunner.request()
    }
  }

  updateSize() {
    super.updateSize()
    flushToDom()
  }

  batchRendering(func) {
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

  resetOptions(optionOverrides, append?) {
    this.currentDataManager.resetOptions(optionOverrides, append)
  }

  setClassNames(classNames: string[]) {
    if (!isArraysEqual(classNames, this.currentClassNames)) {
      let { classList } = this.el

      for (let className of this.currentClassNames) {
        classList.remove(className)
      }

      for (let className of classNames) {
        classList.add(className)
      }

      this.currentClassNames = classNames
    }
  }

  setHeight(height: CssDimValue) {
    applyStyleProp(this.el, 'height', height)
  }
}
