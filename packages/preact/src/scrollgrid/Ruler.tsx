import { watchWidth } from '../component-util/resize-observer'
import { createRef, type Ref } from 'react'
import { BaseComponent, setRef } from '../vdom-util'

export interface RulerProps {
  widthRef: Ref<number>
}

export class Ruler extends BaseComponent<RulerProps> {
  private elRef = createRef<HTMLDivElement>()
  private _isUnmounting: boolean
  private disconnectWidth?: () => void

  render() {
    return (
      <div ref={this.elRef} />
    )
  }

  componentDidMount(): void {
    this._isUnmounting = false
    const { props } = this
    const el = this.elRef.current

    this.disconnectWidth = watchWidth(el, (width) => {
      if (this._isUnmounting) return
      setRef(props.widthRef, width)
    })
  }

  componentWillUnmount(): void {
    this._isUnmounting = true
    this.disconnectWidth()

    const { props } = this

    if (props.widthRef) {
      setRef(props.widthRef, null)
    }
  }
}
