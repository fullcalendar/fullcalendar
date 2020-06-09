import { Hit } from './hit'
import { Dictionary } from '../options'

export type EventResizeJoinTransforms = (hit0: Hit, hit1: Hit) => false | Dictionary
