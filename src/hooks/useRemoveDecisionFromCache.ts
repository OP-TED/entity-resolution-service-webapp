import {
  getStatisticsApiV1CurationStatsGetQueryKey,
  listDecisionsApiV1CurationDecisionsGetInfiniteQueryKey
} from '@api/index'
import { useQueryClient } from '@tanstack/react-query'

export const useRemoveDecisionFromCache = () => {
  const queryClient = useQueryClient()

  return (decisionId: string) => {
    queryClient.setQueriesData<
      {
        pages: Array<{
          results: Array<{ id: string }>
          count?: number
        }>
      }
    >(
      { queryKey: listDecisionsApiV1CurationDecisionsGetInfiniteQueryKey() },
      (old) => {
        if (!old) return old

        const removedFromCache = old.pages.some((page) =>
          page.results.some((d) => d.id === decisionId)
        )

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            results: page.results.filter((d) => d.id !== decisionId),
            count:
              removedFromCache && typeof page.count === 'number'
                ? Math.max(0, page.count - 1)
                : page.count
          }))
        }
      }
    )
    queryClient.invalidateQueries({
      queryKey: getStatisticsApiV1CurationStatsGetQueryKey()
    })
  }
}
