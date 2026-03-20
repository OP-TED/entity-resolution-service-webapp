import { curationStatsRetrieveOptions } from '@api/@tanstack/react-query.gen'
import { SkeletonWrapper, Text } from '@components'
import { useQuery } from '@tanstack/react-query'

import { Flex, Typography } from 'antd'

import { useStyles } from './styles'

const { Title } = Typography

export const Header = () => {
  const { data, isLoading } = useQuery(curationStatsRetrieveOptions())
  const { styles } = useStyles()

  const reviewed = data?.curation_statistics?.reviewed_decisions ?? 0
  const remaining = data?.curation_statistics?.pending_decisions ?? 0
  const today = (data?.curation_statistics?.automatic_decisions ?? 0) + reviewed

  return (
    <header className={styles.header}>
      <Flex justify="space-between" align="center" gap={16} wrap="wrap">
        <Title level={1}>Resolution Decision Review</Title>

        <SkeletonWrapper
          isLoading={isLoading}
          count={1}
          height={20}
          width="350px"
        >
          <Flex gap={4} align="center">
            <Text color="colorWhite" weight={600}>
              Progress:
            </Text>

            <Text color="colorWhite">
              {reviewed} reviewed, {remaining} remaining |
            </Text>

            <Text weight={600} color="colorWhite">
              Today:
            </Text>

            <Text color="colorWhite">{today} decisions</Text>
          </Flex>
        </SkeletonWrapper>
      </Flex>
    </header>
  )
}
