import { curationEntitiesRetrieveOptions } from '@api/@tanstack/react-query.gen'
import { EntityAttributes, SkeletonWrapper } from '@components'
import { useDecisionsLoadingState } from '@hooks'
import { useQuery } from '@tanstack/react-query'

import { Card } from 'antd'

import { useStyles } from './styles'

export type Props = {
  entityId?: string
  compareWith?: unknown
  showDiffSummary?: boolean
}

export const EntityCard = ({
  entityId,
  compareWith,
  showDiffSummary
}: Props) => {
  const { styles } = useStyles()
  const isDecisionsMenuLoading = useDecisionsLoadingState()

  const { data: entity, isLoading } = useQuery({
    ...curationEntitiesRetrieveOptions({
      path: { id: String(entityId) }
    }),
    enabled: !!entityId
  })

  return (
    <Card
      className={styles.entityCard}
      title={<h5 className={styles.entityCardHeader}>Current Entity</h5>}
    >
      <SkeletonWrapper
        isLoading={isDecisionsMenuLoading || isLoading}
        count={7}
        height={30}
        width="60%"
      >
        <EntityAttributes
          parsedData={entity?.parsed_data}
          compareWith={compareWith}
          showDiffSummary={showDiffSummary}
        />
      </SkeletonWrapper>
    </Card>
  )
}
