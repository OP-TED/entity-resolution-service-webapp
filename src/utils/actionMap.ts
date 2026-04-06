import type { UserActionType } from "@api/types.gen"

export const actionTypeColor: Record<UserActionType, string> = {
  ACCEPT_TOP: 'green',
  ACCEPT_ALTERNATIVE: 'blue',
  REJECT_ALL: 'red'
}

export const actionTypeLabel: Record<UserActionType, string> = {
  ACCEPT_TOP: 'Accept Top',
  ACCEPT_ALTERNATIVE: 'Accept Alternative',
  REJECT_ALL: 'Reject All'
}
