import { describe, expect, it, vi, beforeEach } from 'vitest'

import { UserFormModal } from '../../src/components/UserFormModal'
import { fireEvent, render, screen, waitFor } from '../test-utils'

import type { UserResponse } from '../../src/api/types.gen'

vi.setConfig({ testTimeout: 20000 })

const mockNotification = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn()
}))

const mockCreateMutate = vi.hoisted(() => vi.fn())
const mockPatchMutate = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/@tanstack/react-query.gen', () => ({
  createUserApiV1UsersPostMutation: vi.fn(() => ({
    mutationFn: mockCreateMutate
  })),
  patchUserApiV1UsersUserIdPatchMutation: vi.fn(() => ({
    mutationFn: mockPatchMutate
  })),
  listUsersApiV1UsersGetQueryKey: vi.fn(() => ['users'])
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

const mockOnCancel = vi.fn()

const mockUser: UserResponse = {
  id: 'u1',
  email: 'alice@example.com',
  is_active: true,
  is_superuser: false,
  is_verified: true,
  created_at: '2025-01-15T10:00:00Z',
  updated_at: '2025-01-15T10:00:00Z'
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('UserFormModal', () => {
  describe('create mode', () => {
    it('renders Add User title when no user data provided', () => {
      render(<UserFormModal onCancel={mockOnCancel} />)
      expect(screen.getByText('Add User')).toBeInTheDocument()
    })

    it('renders email and password fields', () => {
      render(<UserFormModal onCancel={mockOnCancel} />)
      expect(screen.getByPlaceholderText('user@example.com')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
    })

    it('renders switch fields for Active, Superuser, Verified', () => {
      render(<UserFormModal onCancel={mockOnCancel} />)
      expect(screen.getByText('Active')).toBeInTheDocument()
      expect(screen.getByText('Superuser')).toBeInTheDocument()
      expect(screen.getByText('Verified')).toBeInTheDocument()
    })

    it('shows email required validation on empty submit', async () => {
      render(<UserFormModal onCancel={mockOnCancel} />)

      fireEvent.click(screen.getByRole('button', { name: /ok/i }))

      await waitFor(() => {
        expect(screen.getByText(/Email is required/i)).toBeInTheDocument()
      })
    })

    it('shows password required validation on empty submit', async () => {
      render(<UserFormModal onCancel={mockOnCancel} />)

      fireEvent.click(screen.getByRole('button', { name: /ok/i }))

      await waitFor(() => {
        expect(screen.getByText(/Password is required/i)).toBeInTheDocument()
      })
    })

    it('shows email format validation for an invalid email', async () => {
      render(<UserFormModal onCancel={mockOnCancel} />)

      fireEvent.change(screen.getByPlaceholderText('user@example.com'), {
        target: { value: 'notanemail' }
      })
      fireEvent.click(screen.getByRole('button', { name: /ok/i }))

      await waitFor(() => {
        expect(screen.getByText(/Enter a valid email/i)).toBeInTheDocument()
      })
    })

    it('shows password min length validation', async () => {
      render(<UserFormModal onCancel={mockOnCancel} />)

      fireEvent.change(screen.getByPlaceholderText('user@example.com'), {
        target: { value: 'test@example.com' }
      })
      fireEvent.change(screen.getByPlaceholderText('••••••••'), {
        target: { value: '123' }
      })
      fireEvent.click(screen.getByRole('button', { name: /ok/i }))

      await waitFor(() => {
        expect(
          screen.getByText(/Password must be at least 8 characters/i)
        ).toBeInTheDocument()
      })
    })

    it('calls onCancel when cancel button is clicked', () => {
      render(<UserFormModal onCancel={mockOnCancel} />)

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

      expect(mockOnCancel).toHaveBeenCalled()
    })
  })

  describe('edit mode', () => {
    it('renders Edit User title with email when user data provided', () => {
      render(<UserFormModal data={mockUser} onCancel={mockOnCancel} />)
      expect(screen.getByText(`Edit User — ${mockUser.email}`)).toBeInTheDocument()
    })

    it('does not render email and password fields in edit mode', () => {
      render(<UserFormModal data={mockUser} onCancel={mockOnCancel} />)
      expect(screen.queryByPlaceholderText('user@example.com')).not.toBeInTheDocument()
      expect(screen.queryByPlaceholderText('••••••••')).not.toBeInTheDocument()
    })

    it('renders switch fields for Active, Superuser, Verified', () => {
      render(<UserFormModal data={mockUser} onCancel={mockOnCancel} />)
      expect(screen.getByText('Active')).toBeInTheDocument()
      expect(screen.getByText('Superuser')).toBeInTheDocument()
      expect(screen.getByText('Verified')).toBeInTheDocument()
    })
  })
})
