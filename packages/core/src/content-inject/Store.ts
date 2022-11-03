
export class Store<Value> {
  private handlers: ((value: Value) => void)[]

  set(value: Value): void {
    for (let handler of this.handlers) {
      handler(value)
    }
  }

  subscribe(handler: (value: Value) => void) {
    this.handlers.push(handler)
  }
}
