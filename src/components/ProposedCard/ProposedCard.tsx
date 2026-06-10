import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons'
import { EntityAttributes, EntityMetadata, SkeletonWrapper, Text } from '@components'
import { useDecisionsLoadingState } from '@hooks'
import { Button, Card, Flex, Space } from 'antd'
import { useMemo } from 'react'

import { useStyles } from './styles'

import type { CanonicalEntityPreview } from '@api/types.gen'

type Props = {
  currentEntity: number
  data?: CanonicalEntityPreview
  referenceEntityData?: unknown
  orderedKeys?: string[]
  title?: string
  isAlternative?: boolean
  isLoading: boolean
  onPrevious: () => void
  onNext: () => void
}

export const ProposedCard = ({
  currentEntity,
  data,
  referenceEntityData,
  orderedKeys,
  isLoading,
  onPrevious,
  onNext,
  title = 'Proposed Match',
  isAlternative = false
}: Props) => {
  const { styles } = useStyles({ alternative: isAlternative })
  const isDecisionsMenuLoading = useDecisionsLoadingState()

  const currentEntityLength = data?.top_entities?.length ?? 0
  const currentMemberIdentifier =
    data?.top_entities?.[currentEntity - 1]?.identified_by

  const isLoadingContent = isLoading || isDecisionsMenuLoading

  const displayEntityData = useMemo(() => {
    const proposedRaw =
      data?.top_entities?.[currentEntity - 1]?.parsed_representation

    if (!proposedRaw || typeof proposedRaw !== 'object') {
      return proposedRaw
    }

    if (!referenceEntityData || typeof referenceEntityData !== 'object') {
      return proposedRaw
    }

    const proposed = proposedRaw as Record<string, unknown>
    const reference = referenceEntityData as Record<string, unknown>

    const merged: Record<string, unknown> = { ...proposed }
    for (const key of Object.keys(reference)) {
      if (!(key in merged)) {
        merged[key] = ''
      }
    }

    return merged
  }, [currentEntity, data, referenceEntityData])

  return (
    <Card
      data-testid={isAlternative ? 'alternative-proposed-card' : 'proposed-match-card'}
      className={styles.proposedCard}
      title={
        <Flex
          className={styles.proposedCardHeader}
          justify="space-between"
          align="center"
          gap={8}
        >
          <Space size={10}>
            <Text
              weight={500}
              color={isAlternative ? 'colorWarning' : 'colorPrimaryActive'}
            >
              {title}
            </Text>

            <SkeletonWrapper
              isLoading={isLoadingContent}
              count={1}
              height={20}
              width="120px"
            >
              <Text
                color={isAlternative ? 'colorWarning' : 'colorPrimaryActive'}
              >
                Entity {currentEntity} of {currentEntityLength} loaded entities
              </Text>
            </SkeletonWrapper>
          </Space>

          <Flex gap={8} align="center">
            <EntityMetadata identifier={currentMemberIdentifier} />

            <Button
              type="primary"
              disabled={currentEntity === 1}
              onClick={onPrevious}
              icon={<ArrowLeftOutlined />}
            />

            <Button
              type="primary"
              disabled={currentEntity === currentEntityLength}
              onClick={onNext}
              icon={<ArrowRightOutlined />}
            />
          </Flex>
        </Flex>
      }
    >
      <SkeletonWrapper
        isLoading={isLoadingContent}
        count={5}
        height={40}
        marginBottom={2}
      >
        <EntityAttributes
          parsedData={displayEntityData}
          orderedKeys={orderedKeys}
        />
      </SkeletonWrapper>
    </Card>
  )
}
