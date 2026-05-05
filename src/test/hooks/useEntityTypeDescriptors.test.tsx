import { useEntityTypeDescriptors } from '@hooks/useEntityTypeDescriptors'
import { waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { createTestQueryClient, renderHook } from '../test-utils'

vi.mock('@api/index', () => ({
  listEntityTypesApiV1CurationEntityTypesGetOptions: vi.fn(() => ({
    queryKey: ['entity-types'],
    queryFn: vi.fn().mockResolvedValue([
      { name: 'Person', display_name_field: 'full_name' },
      { name: 'Organization', display_name_field: 'org_name' }
    ])
  }))
}))

describe('useEntityTypeDescriptors', () => {
  it('returns an empty map before data resolves', () => {
    const queryClient = createTestQueryClient()
    const { result } = renderHook(() => useEntityTypeDescriptors(), { queryClient })
    expect(result.current).toEqual({})
  })

  it('builds an entity-type → display-field map from the API response', async () => {
    const queryClient = createTestQueryClient()
    queryClient.setQueryData(['entity-types'], [
      { name: 'Person', display_name_field: 'full_name' },
      { name: 'Organization', display_name_field: 'org_name' }
    ])

    const { result } = renderHook(() => useEntityTypeDescriptors(), { queryClient })

    await waitFor(() => {
      expect(result.current).toEqual({
        Person: 'full_name',
        Organization: 'org_name'
      })
    })
  })

  it('skips descriptors that are missing name or display_name_field', async () => {
    const queryClient = createTestQueryClient()
    queryClient.setQueryData(['entity-types'], [
      { name: 'Person', display_name_field: 'full_name' },
      { name: 'NoField' },
      { display_name_field: 'orphan' },
      null,
      { name: '', display_name_field: 'full_name' }
    ])

    const { result } = renderHook(() => useEntityTypeDescriptors(), { queryClient })

    await waitFor(() => {
      expect(result.current).toEqual({ Person: 'full_name' })
    })
  })

  it('returns an empty map when data is null', async () => {
    const queryClient = createTestQueryClient()
    queryClient.setQueryData(['entity-types'], null)

    const { result } = renderHook(() => useEntityTypeDescriptors(), { queryClient })

    await waitFor(() => {
      expect(result.current).toEqual({})
    })
  })
})
