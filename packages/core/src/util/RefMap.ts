import { hashValuesToArray } from './object'


export default class RefMap<RefType, OtherArgs extends any[] = []> {

  public currentMap: { [key: string]: RefType } = {}
  public otherArgsMap: { [key: string]: OtherArgs } = {}
  private callbackMap: { [key: string]: (val: RefType | null) => void } = {}


  constructor(public masterCallback?: (val: RefType | null, key: string, ...otherArgs: OtherArgs) => void) {
  }


  createRef(key: string | number, ...otherArgs: OtherArgs) {
    let refCallback = this.callbackMap[key]

    if (!refCallback) {
      refCallback = this.callbackMap[key] = (val: RefType | null) => {
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
    }

    this.otherArgsMap[key] = otherArgs

    return refCallback
  }


  getCurrents() {
    return hashValuesToArray(this.currentMap)
  }

}
