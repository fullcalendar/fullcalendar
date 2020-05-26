import { NativeFormatter, NativeFormatterOptions } from './formatting-native'
import { CmdFormatter } from './formatting-cmd'
import { FuncFormatter, FuncFormatterFunc } from './formatting-func'
import { DateFormatter } from './DateFormatter'


// TODO: use Intl.DateTimeFormatOptions
export type FormatterInput = NativeFormatterOptions | string | FuncFormatterFunc


export function createFormatter(input: FormatterInput, defaultSeparator?: string): DateFormatter {
  if (typeof input === 'object' && input) { // non-null object
    if (typeof defaultSeparator === 'string') {
      input = { separator: defaultSeparator, ...input }
    }
    return new NativeFormatter(input)

  } else if (typeof input === 'string') {
    return new CmdFormatter(input, defaultSeparator)

  } else if (typeof input === 'function') {
    return new FuncFormatter(input as FuncFormatterFunc)
  }
}
