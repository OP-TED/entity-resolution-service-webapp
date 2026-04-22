import { listDecisionsApiV1CurationDecisionsGetQueryKey } from '@api/index'
import { useQueryClient } from '@tanstack/react-query'

import { useQueryParams } from './useQueryParams'

export const useDecisionsLoadingState = () => {
  const queryClient = useQueryClient()
  const params = useQueryParams()

  const isDecisionsMenuLoading =
    queryClient.getQueryState(
      listDecisionsApiV1CurationDecisionsGetQueryKey({
        query: { ...params }
      })
    )?.status === 'pending'

  return isDecisionsMenuLoading
}
