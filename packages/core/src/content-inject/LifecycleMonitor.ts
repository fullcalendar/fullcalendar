import { ComponentChildren } from '../preact.js'
import { BaseComponent } from '../vdom-util.js'

export interface LifecyleMonitorProps<RenderProps> {
  didMount: (renderProps: RenderProps & { el: HTMLElement }) => void
  willUnmount: (renderProps: RenderProps & { el: HTMLElement }) => void
  renderProps: RenderProps
  children: ComponentChildren
}

export class LifecycleMonitor<RenderProps> extends BaseComponent<LifecyleMonitorProps<RenderProps>> {
  render() {
    return this.props.children
  }

  componentDidMount(): void {
    this.props.didMount?.({
      ...this.props.renderProps,
      el: this.base as HTMLElement,
    })
  }

  componentWillUnmount(): void {
    this.props.willUnmount?.({
      ...this.props.renderProps,
      el: this.base as HTMLElement,
    })
  }
}
