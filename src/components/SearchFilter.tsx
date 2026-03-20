import { useDebounce, useQueryUpdate } from '@hooks'

import { Input } from 'antd'
import { useEffect, useState } from 'react'

export const SearchFilter = () => {
  const { updateQuery, params } = useQueryUpdate()

  const [search, setSearch] = useState(params?.search)

  const debouncedSearch = useDebounce(search)

  const onChange = (value: string) => setSearch(value)

  useEffect(() => {
    updateQuery({
      search: debouncedSearch
    })
  }, [debouncedSearch, updateQuery])

  return (
    <Input
      className="input-min-width"
      placeholder="Entity name, ID, etc..."
      value={search ? String(search) : ''}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Search Entity"
    />
  )
}
