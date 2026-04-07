import { describe, expect, it, vi, afterEach } from 'vitest'

import { UsersSelect } from '../../src/components/UsersSelect'
import { fireEvent, render, screen, waitFor } from '../test-utils'

type User = { id: string; email: string }

type Page = {
  results: User[]
  next: number | null
}

vi.mock('@api/index', () => ({
  listUsersApiV1UsersGetInfiniteOptions: vi.fn(
    ({ query }: { query?: { email?: string } }) => ({
      queryKey: ['users', query?.email ?? ''],
      queryFn: async ({ pageParam = 1 }: { pageParam?: number }) => {
        const email = (query?.email ?? '').toLowerCase()

        const pageOne: Page = {
          results:
            email.length === 0
              ? [
                  { id: '1', email: 'alice@example.com' },
                  { id: '2', email: 'bob@example.com' }
                ]
              : [{ id: '1', email: 'alice@example.com' }],
          next: email.length === 0 ? 2 : null
        }

        const pageTwo: Page = {
          results: [{ id: '3', email: 'charlie@example.com' }],
          next: null
        }

        return pageParam === 2 ? pageTwo : pageOne
      }
    })
  )
}))

vi.mock('antd', async (importOriginal) => {
  const antd = await importOriginal<typeof import('antd')>()

  const Select = ({
    options,
    showSearch,
    onPopupScroll,
    onClear,
    placeholder
  }: {
    options?: Array<{ label: string; value: string }>
    showSearch?: { onSearch?: (value: string) => void }
    onPopupScroll?: (event: { target: { scrollTop: number; offsetHeight: number; scrollHeight: number } }) => void
    onClear?: () => void
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
      <ul>
        {options?.map((option) => (
          <li key={option.value}>{option.label}</li>
        ))}
      </ul>
    </div>
  )

  return { ...antd, Select }
})

describe('UsersSelect integration', () => {
  afterEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it('updates query results after debounce delay', async () => {
    render(<UsersSelect />)

    await waitFor(() => {
      expect(screen.getByText('bob@example.com')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('users-search'), {
      target: { value: 'alice' }
    })

    // Before debounce flush, previous data remains visible.
    expect(screen.getByText('bob@example.com')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('alice@example.com')).toBeInTheDocument()
      expect(screen.queryByText('bob@example.com')).not.toBeInTheDocument()
    })
  })

  it('loads next page when popup is scrolled to the bottom', async () => {
    render(<UsersSelect />)

    await waitFor(() => {
      expect(screen.getByText('alice@example.com')).toBeInTheDocument()
      expect(screen.getByText('bob@example.com')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByLabelText('scroll-bottom'))

    await waitFor(() => {
      expect(screen.getByText('charlie@example.com')).toBeInTheDocument()
    })
  })
})
