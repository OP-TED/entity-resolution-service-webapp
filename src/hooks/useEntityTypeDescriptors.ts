import { listEntityTypesApiV1CurationEntityTypesGetOptions } from '@api/index'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

export const useEntityTypeDescriptors = () => {
  const { data } = useQuery({
    ...listEntityTypesApiV1CurationEntityTypesGetOptions(),
    staleTime: 5 * 60_000
  })

  const map = useMemo(() => {
    const m: Record<string, string> = {}
    for (const d of data ?? []) {
      if (d?.name && d?.display_name_field) {
        m[d.name] = d.display_name_field
      }
    }

    return m
  }, [data])

  return map
}
