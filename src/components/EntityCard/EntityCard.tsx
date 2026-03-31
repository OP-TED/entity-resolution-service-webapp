import { EntityAttributes, SkeletonWrapper } from '@components'
import { useDecisionsLoadingState } from '@hooks'

import { Card } from 'antd'

import { useStyles } from './styles'

export type Props = {
  entityData?: unknown
  compareWith?: unknown
  showDiffSummary?: boolean
}

export const EntityCard = ({
  entityData,
  compareWith,
  showDiffSummary
}: Props) => {
  const { styles } = useStyles()
  const isDecisionsMenuLoading = useDecisionsLoadingState()

  return (
    <Card
      className={styles.entityCard}
      title={<h5 className={styles.entityCardHeader}>Current Entity</h5>}
    >
      <SkeletonWrapper
        isLoading={isDecisionsMenuLoading}
        count={7}
        height={30}
        width="60%"
      >
        <EntityAttributes
          parsedData={entityData}
          compareWith={compareWith}
          showDiffSummary={showDiffSummary}
        />
      </SkeletonWrapper>
    </Card>
  )
}
