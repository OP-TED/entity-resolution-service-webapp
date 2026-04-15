import { CheckOutlined, CloseOutlined } from '@ant-design/icons'

import { BulkConfirmModal } from '@components'
import { useBulkSelection } from '@context/useBulkSelection'
import { useBulkDecisionActions } from '@hooks'

import { Button, Flex } from 'antd'

import { useStyles } from './styles'

export const BulkActionBar = () => {
  const { styles } = useStyles()
  const { isSelectionMode, selectedCount } = useBulkSelection()
  const {
    bulkAccept,
    bulkReject,
    isPending,
    pendingAction,
    cancelConfirm,
    confirm
  } = useBulkDecisionActions()

  const visible = isSelectionMode && selectedCount > 0

  return (
    <>
      {visible && (
        <div className={styles.bar} role="toolbar" aria-label="Bulk actions">
          <Flex gap={8} align="center" justify="space-between">
            <span className={styles.count}>{selectedCount} selected</span>

            <Flex gap={8}>
              <Button
                icon={<CheckOutlined />}
                color="green"
                variant="solid"
                loading={isPending && pendingAction === 'accept'}
                disabled={isPending && pendingAction !== 'accept'}
                onClick={bulkAccept}
              >
                Accept
              </Button>

              <Button
                icon={<CloseOutlined />}
                color="danger"
                variant="solid"
                loading={isPending && pendingAction === 'reject'}
                disabled={isPending && pendingAction !== 'reject'}
                onClick={bulkReject}
              >
                Reject
              </Button>
            </Flex>
          </Flex>
        </div>
      )}

      <BulkConfirmModal
        action={pendingAction}
        isPending={isPending}
        onCancel={cancelConfirm}
        onConfirm={confirm}
      />
    </>
  )
}
