import { hashValuesToArray } from './object'

/*
TODO: somehow infer OtherArgs from masterCallback?
TODO: make OtherArgs a single object to avoid spreading?
*/
export default class RefMap<RefType, OtherArgs extends any[] = []> {

  public currentMap: { [key: string]: RefType } = {}
  private otherArgsMap: { [key: string]: OtherArgs } = {}
  private callbackMap: { [key: string]: (val: RefType | null) => void } = {}


  constructor(public masterCallback?: (val: RefType | null, key: string, ...otherArgs: OtherArgs) => void) {
  }


  createRef(key: string | number, ...otherArgs: OtherArgs) {
    let refCallback = this.callbackMap[key]

    if (!refCallback) {
      refCallback = this.callbackMap[key] = (val: RefType | null) => {
        this.handleValue(val, String(key), ...otherArgs)
      }
    }

    this.otherArgsMap[key] = otherArgs

    return refCallback
  }


  handleValue = (val: RefType | null, key: string, ...otherArgs: OtherArgs) => { // bind in case users want to pass it around
    if (val !== null) {
      this.currentMap[key] = val
    } else {
      delete this.currentMap[key]
      delete this.callbackMap[key]
      delete this.otherArgsMap[key]
    }

    if (this.masterCallback) {
      this.masterCallback(val, String(key), ...otherArgs)
    }
  }


  collect( // TODO: check callers that don't care about order. should use getAll instead
    startIndex = 0,
    endIndex?: number,
    step = 1,
    filterFunc?: (val: RefType, key: number, ...otherArgs: OtherArgs) => boolean
  ) {
    let { currentMap, otherArgsMap } = this
    let res: RefType[] = []

    if (endIndex == null) {
      endIndex = Object.keys(currentMap).length
    }

    for (let i = startIndex; i < endIndex; i += step) {
      let val = currentMap[i]

      if (val !== undefined) { // will disregard undefined for sparse arrays
        if (!filterFunc || filterFunc(val, i, ...otherArgsMap[i])) {
          res.push(val)
        }
      }
    }

    return res
  }


  getAll(): RefType[] { // returns in no partical order!
    return hashValuesToArray(this.currentMap)
  }

}
