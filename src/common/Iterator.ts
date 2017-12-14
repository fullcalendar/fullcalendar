
export default class Iterator {

  items: any

  constructor(items) {
    this.items = items || []
  }

  /* Calls a method on every item passing the arguments through */
  proxyCall(methodName, ...args) {
    let results = []

    this.items.forEach(function(item) {
      results.push(item[methodName].apply(item, args))
    })

    return results
  }

}
