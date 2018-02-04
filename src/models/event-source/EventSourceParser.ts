
export default {

  sourceClasses: [],


  registerClass: function(EventSourceClass) {
    this.sourceClasses.unshift(EventSourceClass) // give highest priority
  },


  parse: function(rawInput, calendar) {
    let sourceClasses = this.sourceClasses
    let i
    let eventSource

    for (i = 0; i < sourceClasses.length; i++) {
      eventSource = sourceClasses[i].parse(rawInput, calendar)

      if (eventSource) {
        return eventSource
      }
    }
  }

}
