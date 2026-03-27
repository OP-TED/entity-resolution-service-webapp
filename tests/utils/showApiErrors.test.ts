import { describe, expect, it, vi } from 'vitest'

import { showApiErrors } from '../../src/utils/showApiErrors'

describe('showApiErrors', () => {
  it('does nothing for non-object errors', () => {
    const notify = vi.fn()
    showApiErrors('plain string error', notify)
    showApiErrors(null, notify)
    showApiErrors(undefined, notify)
    expect(notify).not.toHaveBeenCalled()
  })

  it('reads string error from response.data', () => {
    const notify = vi.fn()
    showApiErrors({ response: { data: 'Something went wrong' } }, notify)
    expect(notify).toHaveBeenCalledOnce()
    expect(notify).toHaveBeenCalledWith('Something went wrong', 'error')
  })

  it('reads array of messages from response.data', () => {
    const notify = vi.fn()
    showApiErrors({ response: { data: ['Error A', 'Error B'] } }, notify)
    expect(notify).toHaveBeenCalledTimes(2)
    expect(notify).toHaveBeenNthCalledWith(1, 'Error A', 'error')
    expect(notify).toHaveBeenNthCalledWith(2, 'Error B', 'error')
  })

  it('reads string error from body', () => {
    const notify = vi.fn()
    showApiErrors({ body: 'Body error message' }, notify)
    expect(notify).toHaveBeenCalledOnce()
    expect(notify).toHaveBeenCalledWith('Body error message', 'error')
  })

  it('deduplicates identical messages', () => {
    const notify = vi.fn()
    showApiErrors(
      { response: { data: ['Duplicate error', 'Duplicate error', 'Unique error'] } },
      notify
    )
    expect(notify).toHaveBeenCalledTimes(2)
    expect(notify).toHaveBeenNthCalledWith(1, 'Duplicate error', 'error')
    expect(notify).toHaveBeenNthCalledWith(2, 'Unique error', 'error')
  })

  it('does nothing when response.data is not a string or array', () => {
    const notify = vi.fn()
    showApiErrors({ response: { data: { nested: 'object' } } }, notify)
    expect(notify).not.toHaveBeenCalled()
  })

  it('prefers response.data over body when both are present', () => {
    const notify = vi.fn()
    showApiErrors(
      { response: { data: 'Response error' }, body: 'Body error' },
      notify
    )
    expect(notify).toHaveBeenCalledOnce()
    expect(notify).toHaveBeenCalledWith('Response error', 'error')
  })

  it('handles empty array in response.data', () => {
    const notify = vi.fn()
    showApiErrors({ response: { data: [] } }, notify)
    expect(notify).not.toHaveBeenCalled()
  })
})
