import { listUsersApiV1UsersGetInfiniteOptions } from '@api/index'
import { useDebounce } from '@hooks/useDebounce'
import { useInfiniteQuery } from '@tanstack/react-query'
import { type SelectProps, Empty, Flex, Select, Spin } from 'antd'
import { useMemo, useState } from 'react'


export const UsersSelect = (props: SelectProps) => {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const { data, isFetching, hasNextPage, fetchNextPage } = useInfiniteQuery({
    ...listUsersApiV1UsersGetInfiniteOptions({
      query: {
        email: debouncedSearch
      }
    }),
    getNextPageParam: (lastPage) => lastPage?.next ?? undefined,
    initialPageParam: 1
  })

  const usersOptions = useMemo(() => {
    return data?.pages
      ?.flatMap((page) =>
        page?.results?.map(({ id, email }) => ({
          label: email,
          value: id
        }))
      )
      .filter(Boolean)
  }, [data])

  return (
    <Select
    {...props}
      allowClear
        options={usersOptions}
      loading={isFetching}
      showSearch={{
        onSearch: (value) => setSearch(value),
      }}
      onClear={() => setSearch('')}

      placeholder="Search users by email"
     onPopupScroll={(e) => {
        const target = e.target as HTMLElement
        if (
          target.scrollTop + target.offsetHeight === target.scrollHeight &&
          hasNextPage
        ) {
          fetchNextPage()
        }
      }}
      notFoundContent={
        isFetching ? (
          <Flex justify="center">
            <Spin spinning />
          </Flex>
        ) : (
          <Empty />
        )
      }
    />
  )
}
