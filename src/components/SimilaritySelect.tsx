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
  similarityMin?: number
  similarityMax?: number
  onChange: (params: {
    similarity_min?: number
    similarity_max?: number
  }) => void
}

export const SimilaritySelect = ({
  similarityMin,
  similarityMax,
  onChange
}: Props) => {
  const options = useMemo<Option[]>(
    () => [
      { label: 'All Similarity', value: 'All Similarity' },
      ...getScoreRangeOptions()
    ],
    []
  )

  const currentValue = useMemo(() => {
    if (similarityMin === undefined && similarityMax === undefined) {
      return 'All Similarity'
    }
    const option = options.find(
      (opt) => opt.min === similarityMin && opt.max === similarityMax
    )

    return option?.value
  }, [similarityMin, similarityMax, options])

  const onChangeSimilarity = (value: string) => {
    const option = options.find((opt) => opt.value === value)
    if (option) {
      onChange({
        similarity_min: option.min,
        similarity_max: option.max
      })
    }
  }

  return (
    <Select
      className="select-min-width"
      allowClear={false}
      value={currentValue}
      onChange={onChangeSimilarity}
      options={options}
      aria-label="Select Similarity"
    />
  )
}
