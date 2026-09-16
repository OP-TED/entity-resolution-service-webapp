import { getScoreRangeOptions } from '@utils/confidence'
import { Select } from 'antd'
import { useMemo } from 'react'

type Option = {
  label: string
  value: string
  min?: number
  max?: number
}

type Props = {
  confidenceMin?: number
  confidenceMax?: number
  onChange: (params: {
    confidence_min?: number
    confidence_max?: number
  }) => void
}

export const ConfidenceSelect = ({
  confidenceMin,
  confidenceMax,
  onChange
}: Props) => {
  const options = useMemo<Option[]>(
    () => [
      { label: 'All Confidence', value: 'All Confidence' },
      ...getScoreRangeOptions()
    ],
    []
  )

  const currentValue = useMemo(() => {
    if (confidenceMin === undefined && confidenceMax === undefined) {
      return 'All Confidence'
    }
    const option = options.find(
      (opt) => opt.min === confidenceMin && opt.max === confidenceMax
    )

    return option?.value
  }, [confidenceMin, confidenceMax, options])

  const onChangeConfidence = (value: string) => {
    const option = options.find((opt) => opt.value === value)
    if (option) {
      onChange({
        confidence_min: option.min,
        confidence_max: option.max
      })
    }
  }

  return (
    <Select
      className="select-min-width"
      allowClear={false}
      value={currentValue}
      onChange={onChangeConfidence}
      options={options}
      aria-label="Select Confidence"
    />
  )
}
