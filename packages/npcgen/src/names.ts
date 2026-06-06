import { pick } from './rng'
import { NAME_PREFIX, NAME_MIDDLE, NAME_SUFFIX } from './data'

/** Nome curto de fantasia, montado por sílabas via RNG corrente. */
export function generateName(): string {
  return pick(NAME_PREFIX) + pick(NAME_MIDDLE) + pick(NAME_SUFFIX)
}
