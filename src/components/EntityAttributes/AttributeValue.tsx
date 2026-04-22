import { type AttributeDiff, stringifyValue } from '@utils/comparison'

type Props = {
  diff?: AttributeDiff
}

export const AttributeValue = ({ diff }: Props) => {
  return stringifyValue(diff?.currentValue)
}
