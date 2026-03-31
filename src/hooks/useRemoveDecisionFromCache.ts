import {
  getStatisticsApiV1CurationStatsGetQueryKey,
  listDecisionsApiV1CurationDecisionsGetInfiniteQueryKey
} from '@api/index'
import { useQueryClient } from '@tanstack/react-query'

export const useRemoveDecisionFromCache = () => {
  const queryClient = useQueryClient()

  return (decisionId: string) => {
    queryClient.setQueriesData<
      { pages: Array<{ results: Array<{ id: string }> }> }
    >(
      { queryKey: listDecisionsApiV1CurationDecisionsGetInfiniteQueryKey() },
      (old) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            results: page.results.filter((d) => d.id !== decisionId)
          }))
        }
      }
    )
    queryClient.invalidateQueries({
      queryKey: getStatisticsApiV1CurationStatsGetQueryKey()
    })
  }
}
