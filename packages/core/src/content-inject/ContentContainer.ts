import { createElement, Component, FunctionalComponent, ComponentChildren } from '../preact.js'
import { ClassNamesGenerator } from '../common/render-hook.js'
import {
  ContentInjector,
  ContentGeneratorProps,
  ElAttrsProps,
  buildElAttrs,
  ElProps,
  ElAttrs,
} from './ContentInjector.js'
import { RenderId } from './RenderId.js'
import { setRef } from '../vdom-util.js'

/*
The `children` prop is a function that defines inner wrappers (ex: ResourceCell)
*/
export type ContentContainerProps<RenderProps> =
  ElAttrsProps &
  ContentGeneratorProps<RenderProps> & {
    elTag?: string
    classNameGenerator: ClassNamesGenerator<RenderProps> | undefined
    didMount: ((renderProps: RenderProps & { el: HTMLElement }) => void) | undefined
    willUnmount: ((renderProps: RenderProps & { el: HTMLElement }) => void) | undefined
    children?: InnerContainerFunc<RenderProps>
  }

export class ContentContainer<RenderProps> extends Component<ContentContainerProps<RenderProps>> {
  static contextType = RenderId
  didMountMisfire?: boolean
  context: number
  el: HTMLElement

  InnerContent = InnerContentInjector.bind(undefined, this)

  render() {
    const { props } = this
    const generatedClassNames = generateClassNames(props.classNameGenerator, props.renderProps)

    if (props.children) {
      const elAttrs = buildElAttrs(props, generatedClassNames, this.handleEl)
      const children = props.children(this.InnerContent, props.renderProps, elAttrs)

      if (props.elTag) {
        return createElement(props.elTag, elAttrs, children)
      } else {
        return children
      }
    } else {
      return createElement(ContentInjector<RenderProps>, {
        ...props,
        elRef: this.handleEl,
        elTag: props.elTag || 'div',
        elClasses: (props.elClasses || []).concat(generatedClassNames),
        renderId: this.context,
      })
    }
  }

  handleEl = (el: HTMLElement) => {
    this.el = el

    if (this.props.elRef) {
      setRef(this.props.elRef, el)

      if (el && this.didMountMisfire) {
        this.componentDidMount()
      }
    }
  }

  componentDidMount(): void {
    if (this.el) {
      this.props.didMount?.({
        ...this.props.renderProps,
        el: this.el,
      })
    } else {
      this.didMountMisfire = true
    }
  }

  componentWillUnmount(): void {
    this.props.willUnmount?.({
      ...this.props.renderProps,
      el: this.el,
    })
  }
}

// Inner

export type InnerContainerComponent = FunctionalComponent<ElProps>
export type InnerContainerFunc<RenderProps> = (
  InnerContainer: InnerContainerComponent,
  renderProps: RenderProps,
  elAttrs: ElAttrs,
) => ComponentChildren

function InnerContentInjector<RenderProps>(
  containerComponent: ContentContainer<RenderProps>,
  props: ElProps,
) {
  const parentProps = containerComponent.props

  return createElement(ContentInjector<RenderProps>, {
    renderProps: parentProps.renderProps,
    generatorName: parentProps.generatorName,
    customGenerator: parentProps.customGenerator,
    defaultGenerator: parentProps.defaultGenerator,
    renderId: containerComponent.context,
    ...props,
  })
}

// Utils

function generateClassNames<RenderProps>(
  classNameGenerator: ClassNamesGenerator<RenderProps> | undefined,
  renderProps: RenderProps,
): string[] {
  const classNames = typeof classNameGenerator === 'function' ?
    classNameGenerator(renderProps) :
    classNameGenerator || []

  return typeof classNames === 'string' ? [classNames] : classNames
}
