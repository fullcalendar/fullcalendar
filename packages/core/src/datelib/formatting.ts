import { NativeFormatter, NativeFormatterOptions } from './formatting-native.js'
import { CmdFormatter } from './formatting-cmd.js'
import { FuncFormatter, FuncFormatterFunc } from './formatting-func.js'
import { DateFormatter } from './DateFormatter.js'

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
