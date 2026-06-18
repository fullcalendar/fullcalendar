import { ContentGenerator } from '../common/render-hook'
import { ContentContainer } from '../content-inject/ContentContainer'
import { BaseComponent } from '../vdom-util'

interface IconProps {
  className?: string
  contentGenerator?: ContentGenerator<{}>
}

export class ButtonIcon extends BaseComponent<IconProps> {
  render() {
    const { contentGenerator, className } = this.props

    if (contentGenerator) {
      // TODO: somehow give className to the svg?
      return (
        <ContentContainer<{}>
          tag='span'
          style={{ display: 'contents' }}
          attrs={{ 'aria-hidden': true }}
          renderProps={{}}
          generatorName={undefined}
          customGenerator={contentGenerator}
        />
      )
    }

    if (className !== undefined) {
      return (
        <span
          aria-hidden
          className={className}
        />
      )
    }
  }
}
