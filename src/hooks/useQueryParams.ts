import { type ParseOptions, default as queryString } from 'query-string'
import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

export const useQueryParams = (
  options: ParseOptions = { arrayFormat: 'comma' }
) => {
  const { search } = useLocation()

  const params = useMemo(
    () => queryString.parse(search, options),
    [search, options]
  )

  return params
}
