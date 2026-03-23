import { curationDecisionsRetrieveInfiniteQueryKey } from '@api/index'
import { useQueryClient } from '@tanstack/react-query'

import { defaultFiltersMenu } from '@utils'

import { useQueryParams } from './useQueryParams'

export const useDecisionsLoadingState = () => {
  const queryClient = useQueryClient()
  const params = useQueryParams()

  const isDecisionsMenuLoading =
    queryClient.getQueryState(
      curationDecisionsRetrieveInfiniteQueryKey({
        query: { ...params, per_page: defaultFiltersMenu.page_size }
      })
    )?.status === 'pending'

  return isDecisionsMenuLoading
}
