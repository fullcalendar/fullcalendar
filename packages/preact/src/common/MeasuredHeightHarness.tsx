import { Component, createRef, type Ref, type ReactNode } from 'react'
import { watchHeight } from '../component-util/resize-observer'
import { setRef } from '../vdom-util'

export interface MeasuredHeightHarnessProps {
  style: any // TODO
  className?: string
  children?: ReactNode
  heightRef?: Ref<number>
}

export class MeasuredHeightHarness extends Component<MeasuredHeightHarnessProps> {
  private rootElRef = createRef<HTMLDivElement>()
  private _isUnmounting = false
  private disconnectHeight?: () => void
  private height?: number

  render() {
    const { props } = this

    return (
      <div
        className={props.className}
        style={props.style}
        ref={this.rootElRef}
      >
        {props.children}
      </div>
    )
  }

  componentDidMount(): void {
    this._isUnmounting = false
    const rootEl = this.rootElRef.current // TODO: make dynamic with useEffect

    this.disconnectHeight = watchHeight(rootEl, (height) => {
      if (this._isUnmounting) return
      this.height = height
      setRef(this.props.heightRef, height)
    })
  }

  /*
  A wrapper can gain or lose measurement responsibility without remounting,
  because a row switches placement routes (screen<->print, for example) while
  reusing the same keyed nodes. The size observer only fires on an actual size
  change, so hand the newly attached ref what was already observed, and release
  the detached one.
  */
  componentDidUpdate(prevProps: MeasuredHeightHarnessProps): void {
    const { heightRef } = this.props

    if (prevProps.heightRef !== heightRef) {
      setRef(prevProps.heightRef, null)

      if (this.height != null) {
        setRef(heightRef, this.height)
      }
    }
  }

  componentWillUnmount(): void {
    this._isUnmounting = true
    this.disconnectHeight?.()
    setRef(this.props.heightRef, null)
  }
}
