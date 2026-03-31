import { ConfidenceSelect, SearchFilter, Text } from '@components'
import { useQueryUpdate } from '@hooks'

import { Flex, Select } from 'antd'

import { useStyles } from './styles'

export const FilterBar = () => {
  const { updateQuery, params } = useQueryUpdate()
  const { styles } = useStyles()

  const orderingOptions = [
    { label: 'Created At (Newest)', value: '+created_at' },
    { label: 'Created At (Oldest)', value: '-created_at' },
    { label: 'Updated At (Newest)', value: '+updated_at' },
    { label: 'Updated At (Oldest)', value: '-updated_at' },
    { label: 'Confidence (Low to High)', value: '+confidence_score' },
    { label: 'Confidence (High to Low)', value: '-confidence_score' }
  ]

  return (
    <Flex className={styles.filterBar} align="center" gap={16} wrap>
      <Flex align="center" gap={8}>
        <Text weight={500}>Confidence:</Text>

        <ConfidenceSelect
          onChange={(value) => updateQuery(value)}
          confidenceMin={
            params?.confidence_min ? Number(params.confidence_min) : undefined
          }
          confidenceMax={
            params?.confidence_max ? Number(params.confidence_max) : undefined
          }
        />
      </Flex>

      <Flex align="center" gap={8}>
        <Text weight={500}>Sort by:</Text>

        <Select
          value={params?.ordering ? String(params.ordering) : undefined}
          className="select-min-width"
          options={orderingOptions}
          placeholder="Default sorted by created at (newest)"
          onChange={(value) => updateQuery({ ordering: value })}
          aria-label="Sort by"
        />
      </Flex>

      <Flex align="center" gap={8}>
        <Text weight={500}>Search:</Text>

        <SearchFilter />
      </Flex>
    </Flex>
  )
}
