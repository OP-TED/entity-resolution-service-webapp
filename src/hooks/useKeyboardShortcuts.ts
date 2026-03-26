
import { acceptDecisionApiV1CurationDecisionsDecisionIdAcceptPostMutation, getStatisticsApiV1CurationStatsGetQueryKey, listDecisionsApiV1CurationDecisionsGetInfiniteQueryKey, rejectDecisionApiV1CurationDecisionsDecisionIdRejectPostMutation } from '@api/index'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { showApiErrors } from '@utils'
import { App } from 'antd'
import { useEffect } from 'react'

import type { DecisionSummary } from '@api/types.gen'

type UseKeyboardShortcutsProps = {
  activeDecision?: DecisionSummary
}

export const useKeyboardShortcuts = ({
  activeDecision
}: UseKeyboardShortcutsProps) => {
  const queryClient = useQueryClient()
  const { notification, modal } = App.useApp()

  const { mutate: acceptDecision } = useMutation({
    ...acceptDecisionApiV1CurationDecisionsDecisionIdAcceptPostMutation(),
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
    ...rejectDecisionApiV1CurationDecisionsDecisionIdRejectPostMutation(),
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
    queryClient.invalidateQueries({
      queryKey: listDecisionsApiV1CurationDecisionsGetInfiniteQueryKey()
    })
    queryClient.invalidateQueries({
      queryKey: getStatisticsApiV1CurationStatsGetQueryKey()
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

      switch (event.code) {
        case 'KeyA':
          event.preventDefault()
            modal.confirm({
              title: 'Accept Decision',
              content: 'Are you sure you want to accept this decision?',
              onOk: () => {
                acceptDecision({
                  path: {
                    decision_id: String(activeDecision?.id)
                  }
                })
              },
              onCancel: () => {
                return
              }
            })
          break
        case 'KeyR':
          event.preventDefault()
            modal.confirm({
              title: 'Reject Decision',
              content: 'Are you sure you want to reject this decision?',
              onOk: () => {
                rejectDecision({
                  path: {
                    decision_id: String(activeDecision?.id)
                  }
                })
              },
              onCancel: () => {
                return
              }
            })
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
