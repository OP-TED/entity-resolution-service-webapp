import { listEntityTypesApiV1CurationEntityTypesGetOptions } from '@api/@tanstack/react-query.gen'
import { DecisionOrdering } from '@api/types.gen'
import { ConfidenceSelect, SearchFilter, SimilaritySelect, Text } from '@components'
import { useQueryUpdate } from '@hooks'
import { useQuery } from '@tanstack/react-query'
import {
  type ReviewFilter,
  queryToReviewFilter,
  reviewFilterToQuery
} from '@utils'

import { Flex, Select } from 'antd'

import { useStyles } from './styles'

export const FilterBar = () => {
  const { updateQuery, params } = useQueryUpdate()
  const { styles } = useStyles()

  const { data: entityTypes } = useQuery(
    listEntityTypesApiV1CurationEntityTypesGetOptions()
  )

  const entityTypeOptions = [
    { label: 'All Entity Types', value: '' },
    ...(entityTypes?.map((t) => ({ label: t.name, value: t.name })) ?? [])
  ]

  const orderingOptions = [
    { label: 'Created At (Newest)', value: DecisionOrdering['-CREATED_AT'] },
    { label: 'Created At (Oldest)', value: DecisionOrdering.CREATED_AT },
    { label: 'Updated At (Newest)', value: DecisionOrdering['-UPDATED_AT'] },
    { label: 'Updated At (Oldest)', value: DecisionOrdering.UPDATED_AT },
    { label: 'Confidence (Low to High)', value: DecisionOrdering.CONFIDENCE_SCORE },
    { label: 'Confidence (High to Low)', value: DecisionOrdering['-CONFIDENCE_SCORE'] },
    { label: 'Cluster Size (Smallest)', value: DecisionOrdering.CLUSTER_SIZE },
    { label: 'Cluster Size (Largest)', value: DecisionOrdering['-CLUSTER_SIZE'] }
  ]

  const reviewStatusOptions: { label: string; value: ReviewFilter }[] = [
    { label: 'All Statuses', value: '' },
    { label: 'Never reviewed', value: 'never' },
    { label: 'Needs re-review', value: 'needs-rereview' },
    { label: 'Reviewed', value: 'reviewed' }
  ]

  const reviewStatusValue = queryToReviewFilter({
    ever_reviewed: params?.ever_reviewed,
    reviewed_since_placement: params?.reviewed_since_placement
  })

  return (
    <Flex className={styles.filterBar} align="center" gap={16} wrap>
      <Flex align="center" gap={8}>
        <Text weight={500}>Entity Type:</Text>

        <Select
          value={params?.entity_type ? String(params.entity_type) : ''}
          className="select-min-width"
          options={entityTypeOptions}
          onChange={(value) => updateQuery({ entity_type: value || undefined })}
          aria-label="Filter by entity type"
        />
      </Flex>

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
        <Text weight={500}>Similarity:</Text>

        <SimilaritySelect
          onChange={(value) => updateQuery(value)}
          similarityMin={
            params?.similarity_min ? Number(params.similarity_min) : undefined
          }
          similarityMax={
            params?.similarity_max ? Number(params.similarity_max) : undefined
          }
        />
      </Flex>

      <Flex align="center" gap={8}>
        <Text weight={500}>Review status:</Text>

        <Select
          value={reviewStatusValue}
          className="select-min-width"
          options={reviewStatusOptions}
          onChange={(value) =>
            updateQuery(reviewFilterToQuery(value as ReviewFilter))
          }
          aria-label="Filter by review status"
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
