import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons'
import { EntityAttributes, SkeletonWrapper, Text } from '@components'
import { useDecisionsLoadingState } from '@hooks'
import { Button, Card, Flex } from 'antd'

import { useStyles } from './styles'

import type { CanonicalEntityPreview } from '@api/types.gen'

type Props = {
  currentEntity: number
  data?: CanonicalEntityPreview
  title?: string
  isAlternative?: boolean
  isLoading: boolean
  onPrevious: () => void
  onNext: () => void
}

export const ProposedCard = ({
  currentEntity,
  data,
  isLoading,
  onPrevious,
  onNext,
  title = 'Proposed Match',
  isAlternative = false
}: Props) => {
  const { styles } = useStyles({ alternative: isAlternative })
  const isDecisionsMenuLoading = useDecisionsLoadingState()

  const currentEntityLength = data?.top_entities?.length ?? 0

  const isLoadingContent = isLoading || isDecisionsMenuLoading

  return (
    <Card
      className={styles.proposedCard}
      title={
        <Flex className={styles.proposedCardHeader} vertical gap={4}>
          <Text
            size={16}
            weight={500}
            color={isAlternative ? 'colorWarning' : 'colorPrimaryActive'}
          >
            {title}
          </Text>

          <Flex justify="space-between" align="center" gap={8}>
            <SkeletonWrapper
              isLoading={isLoadingContent}
              count={1}
              height={20}
              width="120px"
            >
              <Text
                size={14}
                color={isAlternative ? 'colorWarning' : 'colorPrimaryActive'}
              >
                Entity {currentEntity} of {currentEntityLength} in cluster
              </Text>
            </SkeletonWrapper>

            <Flex gap={8} align="center">
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
        </Flex>
      }
    >
      <SkeletonWrapper
        isLoading={isLoadingContent}
        count={7}
        height={30}
        width="60%"
      >
        <EntityAttributes
          parsedData={
            data?.top_entities?.[currentEntity - 1]?.parsed_representation
          }
        />
      </SkeletonWrapper>
    </Card>
  )
}
