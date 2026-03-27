import {
  curationDecisionsAcceptCreateMutation,
  curationDecisionsRejectCreateMutation,
  curationDecisionsRetrieveInfiniteQueryKey,
  curationStatsRetrieveQueryKey
} from '@api/index'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { showApiErrors } from '@utils'
import { App } from 'antd'
import { useEffect } from 'react'

import type { Decision } from '@api/types.gen'

type UseKeyboardShortcutsProps = {
  activeDecision?: Decision
}

export const useKeyboardShortcuts = ({
  activeDecision
}: UseKeyboardShortcutsProps) => {
  const queryClient = useQueryClient()
  const { notification, modal } = App.useApp()

  const { mutate: acceptDecision } = useMutation({
    ...curationDecisionsAcceptCreateMutation(),
    onError: (e) =>
      showApiErrors(e, (message) => notification.error({ message })),
    onSuccess: () => {
      onSuccessMutate()
      notification.success({
        message: 'Decision accepted'
      })
    }
  })

  const { mutate: rejectDecision } = useMutation({
    ...curationDecisionsRejectCreateMutation(),
    onError: (e) =>
      showApiErrors(e, (message) => notification.error({ message })),
    onSuccess: () => {
      onSuccessMutate()
      notification.success({
        message: 'Decision rejected'
      })
    }
  })

  const onSuccessMutate = async () => {
    await queryClient.invalidateQueries({
      queryKey: curationDecisionsRetrieveInfiniteQueryKey()
    })

    await queryClient.invalidateQueries({
      queryKey: curationStatsRetrieveQueryKey()
    })
  }

  useEffect(() => {
    const onKeyPress = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement

      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      const isPendingReview =
        activeDecision?.decision_status === 'PENDING_MANUAL_REVIEW'

      switch (event.code) {
        case 'KeyA':
          event.preventDefault()
          if (isPendingReview) {
            modal.confirm({
              title: 'Accept Decision',
              content: 'Are you sure you want to accept this decision?',
              onOk: () => {
                acceptDecision({
                  path: {
                    id: String(activeDecision?.id)
                  }
                })
              },
              onCancel: () => {
                return
              }
            })
          }
          break
        case 'KeyR':
          event.preventDefault()
          if (isPendingReview) {
            modal.confirm({
              title: 'Reject Decision',
              content: 'Are you sure you want to reject this decision?',
              onOk: () => {
                rejectDecision({
                  path: {
                    id: String(activeDecision?.id)
                  }
                })
              },
              onCancel: () => {
                return
              }
            })
          }
          break
        case 'ArrowUp':
          event.preventDefault()

          break
        case 'ArrowDown':
          event.preventDefault()

          break
      }
    }

    window.addEventListener('keydown', onKeyPress)

    return () => window.removeEventListener('keydown', onKeyPress)
  }, [activeDecision, acceptDecision, rejectDecision, modal])
}
