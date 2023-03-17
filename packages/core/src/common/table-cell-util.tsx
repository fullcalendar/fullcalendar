import { ComponentChild } from '../preact.js'
import { DayHeaderContentArg } from '../render-hook-misc.js'

export const CLASS_NAME = 'fc-col-header-cell' // do the cushion too? no

export function renderInner(renderProps: DayHeaderContentArg): ComponentChild {
  return renderProps.text
}
