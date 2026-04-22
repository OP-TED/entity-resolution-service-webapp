
import { acceptDecisionApiV1CurationDecisionsDecisionIdAcceptPostMutation, rejectDecisionApiV1CurationDecisionsDecisionIdRejectPostMutation } from '@api/index'
import { useConfirmationPreference } from '@context/useConfirmationPreference'
import { useRemoveDecisionFromCache } from '@hooks/useRemoveDecisionFromCache'
import { useMutation } from '@tanstack/react-query'
import { showApiErrors } from '@utils'
import { App, Checkbox, Flex } from 'antd'
import { useEffect } from 'react'

import type { DecisionSummary } from '@api/types.gen'
import type { ConfirmationAction } from '@context/confirmationPreferenceContextDef'

type UseKeyboardShortcutsProps = {
  activeDecision?: DecisionSummary
}

export const useKeyboardShortcuts = ({
  activeDecision
}: UseKeyboardShortcutsProps) => {
  const { notification, modal } = App.useApp()
  const { shouldSkip, setActionSkip } = useConfirmationPreference()
  const removeDecisionFromCache = useRemoveDecisionFromCache()

  const { mutate: acceptDecision } = useMutation({
    ...acceptDecisionApiV1CurationDecisionsDecisionIdAcceptPostMutation(),
    onError: (e) =>
      showApiErrors(e, (message) => notification.error({ message })),
    onSuccess: (_, variables) => {
      removeDecisionFromCache(variables.path.decision_id)
      notification.success({ message: 'Decision accepted' })
    }
  })

  const { mutate: rejectDecision } = useMutation({
    ...rejectDecisionApiV1CurationDecisionsDecisionIdRejectPostMutation(),
    onError: (e) =>
      showApiErrors(e, (message) => notification.error({ message })),
    onSuccess: (_, variables) => {
      removeDecisionFromCache(variables.path.decision_id)
      notification.success({ message: 'Decision rejected' })
    }
  })

  const showConfirmModal = (
    action: ConfirmationAction,
    title: string,
    message: string,
    onOk: () => void
  ) => {
    let dontShowAgain = false

    modal.confirm({
      title,
      content: (
        <Flex vertical gap={12}>
          <span>{message}</span>
          <Checkbox onChange={(e) => { dontShowAgain = e.target.checked }}>
            Don't show again
          </Checkbox>
        </Flex>
      ),
      onOk: () => {
        if (dontShowAgain) setActionSkip(action, true)
        onOk()
      },
      onCancel: () => {
        if (dontShowAgain) setActionSkip(action, true)
      }
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
          if (shouldSkip('accept')) {
            acceptDecision({
              path: { decision_id: String(activeDecision?.id) }
            })
          } else {
            showConfirmModal(
              'accept',
              'Accept Decision',
              'Are you sure you want to accept this decision?',
              () => {
                acceptDecision({
                  path: { decision_id: String(activeDecision?.id) }
                })
              }
            )
          }
          break
        case 'KeyR':
          event.preventDefault()
          if (shouldSkip('reject')) {
            rejectDecision({
              path: { decision_id: String(activeDecision?.id) }
            })
          } else {
            showConfirmModal(
              'reject',
              'Reject Decision',
              'Are you sure you want to reject this decision?',
              () => {
                rejectDecision({
                  path: { decision_id: String(activeDecision?.id) }
                })
              }
            )
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
  }, [activeDecision, acceptDecision, rejectDecision, modal, shouldSkip])
}
