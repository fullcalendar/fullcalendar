import { __assign } from 'tslib'
import {
  OptionsInput, Action, CalendarContent, render, h, DelayedRunner, guid, CssDimValue, applyStyleProp,
  CalendarApi, computeCalendarClassNames, computeCalendarHeight, isArraysEqual, CalendarDataProvider, CalendarData
 } from '@fullcalendar/common'
import { flushToDom } from './utils'


export class Calendar extends CalendarApi {

  data: CalendarData
  renderRunner: DelayedRunner
  el: HTMLElement
  isRendering = false
  isRendered = false
  currentClassNames: string[] = []

  get view() { return this.data.viewApi } // for public API

  constructor(el: HTMLElement, optionOverrides: OptionsInput = {}) {
    super()

    this.el = el
    this.renderRunner = new DelayedRunner(this.handleRenderRequest)

    new CalendarDataProvider({
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
    this.data = data
    this.renderRunner.request(data.options.rerenderDelay)
  }


  handleRenderRequest = () => {

    if (this.isRendering) {
      this.isRendered = true

      let { data } = this
      this.setClassNames(computeCalendarClassNames(data))
      this.setHeight(computeCalendarHeight(data))

      render(
        <CalendarContent {...data} />,
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
      this.renderRunner.request()
    } else {
      // hack for RERENDERING
      this.setOption('renderId', guid())
    }
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


  resetOptions(optionOverrides) {
    this._dataProvider.resetOptions(optionOverrides)
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
