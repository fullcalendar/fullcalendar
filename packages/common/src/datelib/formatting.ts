import { NativeFormatter, NativeFormatterOptions } from './formatting-native'
import { CmdFormatter } from './formatting-cmd'
import { FuncFormatter, FuncFormatterFunc } from './formatting-func'
import { DateFormatter } from './DateFormatter'

export type FormatterInput = NativeFormatterOptions | string | FuncFormatterFunc

export function createFormatter(input: FormatterInput): DateFormatter {
  if (typeof input === 'object' && input) { // non-null object
    return new NativeFormatter(input)
  }

  if (typeof input === 'string') {
    return new CmdFormatter(input)
  }

  if (typeof input === 'function') {
    return new FuncFormatter(input as FuncFormatterFunc)
  }

  return null
}
