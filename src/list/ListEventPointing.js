
var ListEventPointing = EventPointing.extend({

    // for events with a url, the whole <tr> should be clickable,
    // but it's impossible to wrap with an <a> tag. simulate this.
    handleClick: function(seg, ev) {
        var url;

        EventPointing.prototype.handleClick.apply(this, arguments); // super. might prevent the default action

        // not clicking on or within an <a> with an href
        if (!$(ev.target).closest('a[href]').length) {
            url = seg.footprint.eventDef.url;

            if (url && !ev.isDefaultPrevented()) { // jsEvent not cancelled in handler
                window.location.href = url; // simulate link click
            }
        }
    }

});
