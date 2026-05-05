import {
  getStatisticsApiV1CurationStatsGetQueryKey,
  listDecisionsApiV1CurationDecisionsGetInfiniteQueryKey
} from '@api/index'
import { useQueryClient } from '@tanstack/react-query'

type DecisionsCachePage = {
  results: Array<{ id: string }>
  count?: number
}

type DecisionsCache = {
  pages: Array<DecisionsCachePage>
}

const countRemovals = (
  pages: Array<DecisionsCachePage>,
  idsToRemove: Set<string>
) =>
  pages.reduce((acc, page) => {
    const matches = page.results.filter((d) => idsToRemove.has(d.id))

    return acc + matches.length
  }, 0)

const stripPage = (
  page: DecisionsCachePage,
  idsToRemove: Set<string>,
  totalRemoved: number
): DecisionsCachePage => ({
  ...page,
  results: page.results.filter((d) => !idsToRemove.has(d.id)),
  count:
    totalRemoved > 0 && typeof page.count === 'number'
      ? Math.max(0, page.count - totalRemoved)
      : page.count
})

export const useRemoveDecisionFromCache = () => {
  const queryClient = useQueryClient()

  return (decisionId: string | string[]) => {
    const idsToRemove = new Set(
      Array.isArray(decisionId) ? decisionId : [decisionId]
    )
    if (idsToRemove.size === 0) return

    queryClient.setQueriesData<DecisionsCache>(
      { queryKey: listDecisionsApiV1CurationDecisionsGetInfiniteQueryKey() },
      (old) => {
        if (!old) return old
        const totalRemoved = countRemovals(old.pages, idsToRemove)

        return {
          ...old,
          pages: old.pages.map((page) =>
            stripPage(page, idsToRemove, totalRemoved)
          )
        }
      }
    )
    queryClient.invalidateQueries({
      queryKey: getStatisticsApiV1CurationStatsGetQueryKey()
    })
  }
}
