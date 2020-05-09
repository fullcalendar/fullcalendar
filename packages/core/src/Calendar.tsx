import { __assign } from 'tslib'
import {
  RawCalendarOptions, Action, CalendarContent, render, h, DelayedRunner, CssDimValue, applyStyleProp,
  CalendarApi, computeCalendarClassNames, computeCalendarHeight, isArraysEqual, CalendarDataManager, CalendarData,
  CustomContentRenderContext
 } from '@fullcalendar/common'
import { flushToDom } from './vdom'


export class Calendar extends CalendarApi {

  currentData: CalendarData
  renderRunner: DelayedRunner
  el: HTMLElement
  isRendering = false
  isRendered = false
  currentClassNames: string[] = []
  customContentRenderId = 0 // will affect custom generated classNames?

  get view() { return this.currentData.viewApi } // for public API


  constructor(el: HTMLElement, optionOverrides: RawCalendarOptions = {}) {
    super()

    this.el = el
    this.renderRunner = new DelayedRunner(this.handleRenderRequest)

    new CalendarDataManager({
      optionOverrides,
      calendarApi: this,
      onAction: this.handleAction,
      onData: this.handleData
    })

    this.trigger('_init')
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
      this.setClassNames(computeCalendarClassNames(currentData))
      this.setHeight(computeCalendarHeight(currentData))

      render(
        <CustomContentRenderContext.Provider value={this.customContentRenderId}>
          <CalendarContent {...currentData} />
        </CustomContentRenderContext.Provider>,
        this.el
      )

    } else if (this.isRendered) {
      this.isRendered = false
      render(null, this.el)
      this.setClassNames([])
      this.setHeight('')
    }

    flushToDom()
  }


  render() {
    if (!this.isRendering) {
      this.isRendering = true
    } else {
      this.customContentRenderId++
    }
    this.renderRunner.request()
  }


  destroy() {
    if (this.isRendering) {
      this.isRendering = false
      this.renderRunner.request()
      this.trigger('_destroy')
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
