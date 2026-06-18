import { FullCalendarElement } from './FullCalendarElement'
import './global-types'

// this is an ESM module, NOT an IIFE file

globalThis.FullCalendarElement = FullCalendarElement
customElements.define('full-calendar', FullCalendarElement)
