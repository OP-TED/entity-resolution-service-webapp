import { Select } from 'antd'
import { useMemo } from 'react'

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
  const options = useMemo(
    () => [
      {
        label: 'All Confidence',
        value: 'All Confidence',
        min: undefined,
        max: undefined
      },
      { label: 'Low (0.0-0.4)', value: 'Low (0.0-0.4)', min: 0.0, max: 0.4 },
      {
        label: 'Medium (0.4-0.7)',
        value: 'Medium (0.4-0.7)',
        min: 0.4,
        max: 0.7
      },
      { label: 'High (0.7-1.0)', value: 'High (0.7-1.0)', min: 0.7, max: 1.0 }
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
