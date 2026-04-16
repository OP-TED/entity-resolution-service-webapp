import { beforeEach, describe, expect, it, vi } from 'vitest'

import { UsersSelect } from '../../src/components/UsersSelect'
import { fireEvent, render, screen } from '../test-utils'

const mockUseInfiniteQuery = vi.fn()
const mockListUsersInfiniteOptions = vi.fn()

vi.mock('@hooks/useDebounce', () => ({
  useDebounce: (value: string) => value
}))

vi.mock('@api/index', () => ({
  listUsersApiV1UsersGetInfiniteOptions: (...args: unknown[]) =>
    mockListUsersInfiniteOptions(...args)
}))

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>()

  return {
    ...actual,
    useInfiniteQuery: (...args: unknown[]) => mockUseInfiniteQuery(...args)
  }
})

vi.mock('antd', async (importOriginal) => {
  const antd = await importOriginal<typeof import('antd')>()

  const Select = ({
    options,
    showSearch,
    onClear,
    onPopupScroll,
    notFoundContent,
    placeholder
  }: {
    options?: Array<{ label: string; value: string }>
    showSearch?: { onSearch?: (value: string) => void }
    onClear?: () => void
    onPopupScroll?: (event: { target: { scrollTop: number; offsetHeight: number; scrollHeight: number } }) => void
    notFoundContent?: React.ReactNode
    placeholder?: string
  }) => (
    <div>
      <input
        aria-label="users-search"
        placeholder={placeholder}
        onChange={(e) => showSearch?.onSearch?.(e.target.value)}
      />
      <button aria-label="clear-search" onClick={onClear} />
      <button
        aria-label="scroll-bottom"
        onClick={() =>
          onPopupScroll?.({
            target: { scrollTop: 50, offsetHeight: 50, scrollHeight: 100 }
          })
        }
      />
      <div aria-label="not-found-content">{notFoundContent}</div>
      <ul>
        {options?.map((option) => (
          <li key={option.value}>{option.label}</li>
        ))}
      </ul>
    </div>
  )

  return { ...antd, Select }
})

describe('UsersSelect unit', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockListUsersInfiniteOptions.mockReturnValue({
      queryKey: ['users', ''],
      queryFn: vi.fn()
    })

    mockUseInfiniteQuery.mockReturnValue({
      data: {
        pages: [
          {
            results: [
              { id: '1', email: 'alice@example.com' },
              { id: '2', email: 'bob@example.com' }
            ]
          }
        ]
      },
      isFetching: false,
      hasNextPage: false,
      fetchNextPage: vi.fn()
    })
  })

  it('renders mapped user options', () => {
    render(<UsersSelect />)

    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
    expect(screen.getByText('bob@example.com')).toBeInTheDocument()
  })

  it('uses searched email and clear resets it', () => {
    render(<UsersSelect />)

    fireEvent.change(screen.getByLabelText('users-search'), {
      target: { value: 'alice' }
    })

    expect(mockListUsersInfiniteOptions).toHaveBeenLastCalledWith({
      query: { email: 'alice' }
    })

    fireEvent.click(screen.getByLabelText('clear-search'))

    expect(mockListUsersInfiniteOptions).toHaveBeenLastCalledWith({
      query: { email: '' }
    })
  })

  it('fetches next page on bottom scroll only when hasNextPage is true', () => {
    const fetchNextPage = vi.fn()
    mockUseInfiniteQuery.mockReturnValueOnce({
      data: { pages: [{ results: [] }] },
      isFetching: false,
      hasNextPage: true,
      fetchNextPage
    })

    render(<UsersSelect />)

    fireEvent.click(screen.getByLabelText('scroll-bottom'))

    expect(fetchNextPage).toHaveBeenCalledTimes(1)
  })

  it('does not fetch next page when hasNextPage is false', () => {
    const fetchNextPage = vi.fn()
    mockUseInfiniteQuery.mockReturnValueOnce({
      data: { pages: [{ results: [] }] },
      isFetching: false,
      hasNextPage: false,
      fetchNextPage
    })

    render(<UsersSelect />)

    fireEvent.click(screen.getByLabelText('scroll-bottom'))

    expect(fetchNextPage).not.toHaveBeenCalled()
  })
})
