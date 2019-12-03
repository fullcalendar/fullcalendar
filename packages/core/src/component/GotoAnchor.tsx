import { h, ComponentChildren } from '../vdom'
import { BaseComponent } from '../view-framework-util'
import ComponentContext from './ComponentContext'
import { __assign } from 'tslib'

export interface GotoAnchorProps {
  navLinks: any
  gotoOptions: any
  extraAttrs?: object
  children: ComponentChildren
  htmlContent?: string // fold into extraAttrs?
}

export default class GotoAnchor extends BaseComponent<GotoAnchorProps> {

  // Generates HTML for an anchor to another view into the calendar.
  // Will either generate an <a> tag or a non-clickable <span> tag, depending on enabled settings.
  // `gotoOptions` can either be a DateMarker, or an object with the form:
  // { date, type, forceOff }
  // `type` is a view-type like "day" or "week". default value is "day".
  // `attrs` and `innerHtml` are use to generate the rest of the HTML tag.
  render(props: GotoAnchorProps, state: {}, context: ComponentContext) {
    let { gotoOptions } = props
    let date
    let type
    let forceOff
    let finalOptions

    if (gotoOptions instanceof Date) {
      date = gotoOptions // a single date-like input
    } else {
      date = gotoOptions.date
      type = gotoOptions.type
      forceOff = gotoOptions.forceOff
    }

    finalOptions = { // for serialization into the link
      date: context.dateEnv.formatIso(date, { omitTime: true }),
      type: type || 'day'
    }

    let attrs = {} as any

    if (props.extraAttrs) {
      __assign(attrs, props.extraAttrs)
    }

    if (typeof props.htmlContent === 'string') {
      attrs.dangerouslySetInnerHTML = { __html: props.htmlContent }
    }

    if (!forceOff && props.navLinks) {
      return (
        <a {...attrs} data-goto={JSON.stringify(finalOptions)}>{props.children}</a>
      )
    } else {
      return (
        <span {...attrs}>{props.children}</span>
      )
    }
  }

}
