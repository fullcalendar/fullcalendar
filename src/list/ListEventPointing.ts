import * as $ from 'jquery'
import EventPointing from '../component/interactions/EventPointing'


export default class ListEventPointing extends EventPointing {

  // for events with a url, the whole <tr> should be clickable,
  // but it's impossible to wrap with an <a> tag. simulate this.
  handleClick(seg, ev) {
    let url

    super.handleClick(seg, ev) // might prevent the default action

    // not clicking on or within an <a> with an href
    if (!$(ev.target).closest('a[href]').length) {
      url = seg.footprint.eventDef.url

      if (url && !ev.isDefaultPrevented()) { // jsEvent not cancelled in handler
        window.location.href = url // simulate link click
      }
    }
  }

}
