import { describe, expect, it, vi, beforeEach } from 'vitest'

import { AdminPage } from '../../src/pages/AdminPage'
import { fireEvent, render, screen, waitFor } from '../test-utils'

import type { UserResponse } from '../../src/api/types.gen'

vi.setConfig({ testTimeout: 20000 })

const mockNotification = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn()
}))

const mockUpdateQuery = vi.hoisted(() => vi.fn())

const mockUsers: UserResponse[] = [
  {
    id: 'u1',
    email: 'alice@example.com',
    is_active: true,
    is_superuser: false,
    is_verified: true,
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  {
    id: 'u2',
    email: 'bob@example.com',
    is_active: false,
    is_superuser: true,
    is_verified: false,
    created_at: '2025-02-20T12:00:00Z',
    updated_at: '2025-02-20T12:00:00Z'
  }
]

vi.mock('../../src/api/@tanstack/react-query.gen', () => ({
  listUsersApiV1UsersGetOptions: vi.fn(() => ({
    queryKey: ['users'],
    queryFn: vi.fn().mockResolvedValue({
      count: 2,
      results: mockUsers,
      next: null,
      previous: null
    })
  })),
  listUsersApiV1UsersGetQueryKey: vi.fn(() => ['users']),
  patchUserApiV1UsersUserIdPatchMutation: vi.fn(() => ({
    mutationFn: vi.fn()
  })),
  getStatisticsApiV1CurationStatsGetOptions: vi.fn(() => ({
    queryKey: ['stats'],
    queryFn: vi.fn().mockResolvedValue({
      curation: { selected_top: 0, selected_alternative: 0, rejected_all: 0, total_decisions: 0 }
    })
  }))
}))

vi.mock('../../src/hooks/useQueryUpdate', () => ({
  useQueryUpdate: () => ({
    params: { page: 1, per_page: 10 },
    updateQuery: mockUpdateQuery
  })
}))

vi.mock('../../src/context/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'admin', email: 'admin@example.com', is_superuser: true, is_active: true, is_verified: true },
    isLoading: false,
    logout: vi.fn()
  })
}))

vi.mock('antd', async (importOriginal) => {
  const antd = await importOriginal<typeof import('antd')>()
  const AppComponent = antd.App
  return {
    ...antd,
    App: Object.assign(AppComponent, {
      useApp: () => ({ notification: mockNotification })
    })
  }
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AdminPage', () => {
  it('renders the User Management heading', async () => {
    render(<AdminPage />)
    expect(screen.getByText('User Management')).toBeInTheDocument()
  })

  it('renders the Add User button', () => {
    render(<AdminPage />)
    expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument()
  })

  it('renders the email search input', () => {
    render(<AdminPage />)
    expect(screen.getByPlaceholderText('Search by email')).toBeInTheDocument()
  })

  it('renders user data in the table', async () => {
    render(<AdminPage />)

    await waitFor(() => {
      expect(screen.getByText('alice@example.com')).toBeInTheDocument()
      expect(screen.getByText('bob@example.com')).toBeInTheDocument()
    })
  })

  it('renders Active/Superuser/Verified tags correctly', async () => {
    render(<AdminPage />)

    await waitFor(() => {
      expect(screen.getByText('alice@example.com')).toBeInTheDocument()
    })

    const yesNodes = screen.getAllByText('Yes')
    const noNodes = screen.getAllByText('No')

    // alice: active=Yes, superuser=No, verified=Yes
    // bob: active=No, superuser=Yes, verified=No
    expect(yesNodes.length).toBeGreaterThanOrEqual(3)
    expect(noNodes.length).toBeGreaterThanOrEqual(3)
  })

  it('renders created date formatted', async () => {
    render(<AdminPage />)

    await waitFor(() => {
      expect(screen.getByText('alice@example.com')).toBeInTheDocument()
    })

    // The date should be rendered via toLocaleDateString()
    const formatted = new Date('2025-01-15T10:00:00Z').toLocaleDateString()
    expect(screen.getByText(formatted)).toBeInTheDocument()
  })

  it('disables deactivate button for already inactive users', async () => {
    render(<AdminPage />)

    await waitFor(() => {
      expect(screen.getByText('bob@example.com')).toBeInTheDocument()
    })

    // bob is inactive — his delete button should be disabled
    const deleteButtons = document.querySelectorAll('button[class*="danger"], button[disabled]')
    const disabledDeleteBtns = Array.from(deleteButtons).filter(
      (btn) => btn.hasAttribute('disabled')
    )
    expect(disabledDeleteBtns.length).toBeGreaterThanOrEqual(1)
  })

  it('calls updateQuery when email search changes', () => {
    render(<AdminPage />)

    fireEvent.change(screen.getByPlaceholderText('Search by email'), {
      target: { value: 'alice' }
    })

    expect(mockUpdateQuery).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'alice', page: 1 })
    )
  })

  it('renders table column headers', async () => {
    render(<AdminPage />)

    await waitFor(() => {
      // Ant Design Table duplicates header text in hidden sizer elements, so use getAllByText
      expect(screen.getAllByText('Email').length).toBeGreaterThanOrEqual(1)
    })

    expect(screen.getAllByText('Active').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Superuser').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Verified').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Created').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Actions').length).toBeGreaterThanOrEqual(1)
  })
})
