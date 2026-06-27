import { guid } from "./misc"

/*
TODO: make API where createRefMap() called
*/
export class RefMap<K, V> {
  public rev: string = ''
  public current = new Map<K, V>()
  private callbacks = new Map<K, (val: V | null) => void>

  constructor(
    public masterCallback?: (val: V, key: K) => void,
    private ignoreDeletes = false
  ) {
  }

  createRef(key: K) {
    let refCallback = this.callbacks.get(key)

    if (!refCallback) {
      refCallback = (val: V) => {
        this.handleValue(val, key)
      }
      this.callbacks.set(key, refCallback)
    }

    return refCallback
  }

  handleValue = (val: V, key: K) => { // bind in case users want to pass it around
    let { current, callbacks } = this

    if (val === null) {
      if (!this.ignoreDeletes) {
        current.delete(key)
        callbacks.delete(key)
      }
    } else {
      current.set(key, val)
    }

    this.rev = guid()

    if (this.masterCallback) {
      this.masterCallback(val, key)
    }
  }
}
