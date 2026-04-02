import { Select } from 'antd'
import { useMemo } from 'react'

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
  const options = useMemo(
    () => [
      {
        label: 'All Similarity',
        value: 'All Similarity',
        min: undefined,
        max: undefined
      },
      { label: 'Low (0-0.4)', value: 'Low (0-0.4)', min: 0, max: 0.4 },
      {
        label: 'Medium (0.4-0.7)',
        value: 'Medium (0.4-0.7)',
        min: 0.4,
        max: 0.7
      },
      { label: 'High (0.7-1)', value: 'High (0.7-1)', min: 0.7, max: 1 }
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
