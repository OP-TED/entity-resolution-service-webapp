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

  it('extracts error messages from objects with msg property in response.data array', () => {
    const notify = vi.fn()
    showApiErrors(
      {
        response: {
          data: [
            { msg: 'First error' },
            { msg: 'Second error' }
          ]
        }
      },
      notify
    )
    expect(notify).toHaveBeenCalledTimes(2)
    expect(notify).toHaveBeenNthCalledWith(1, 'First error', 'error')
    expect(notify).toHaveBeenNthCalledWith(2, 'Second error', 'error')
  })

  it('handles detail string in response.data', () => {
    const notify = vi.fn()
    showApiErrors(
      { response: { data: { detail: 'Detailed error message' } } },
      notify
    )
    expect(notify).toHaveBeenCalledWith('Detailed error message', 'error')
  })

  it('handles detail array in response.data', () => {
    const notify = vi.fn()
    showApiErrors(
      {
        response: {
          data: {
            detail: ['Error 1', 'Error 2']
          }
        }
      },
      notify
    )
    expect(notify).toHaveBeenCalledTimes(2)
    expect(notify).toHaveBeenNthCalledWith(1, 'Error 1', 'error')
    expect(notify).toHaveBeenNthCalledWith(2, 'Error 2', 'error')
  })

  it('extracts msg from objects in detail array', () => {
    const notify = vi.fn()
    showApiErrors(
      {
        response: {
          data: {
            detail: [
              { msg: 'Validation error 1' },
              { msg: 'Validation error 2' }
            ]
          }
        }
      },
      notify
    )
    expect(notify).toHaveBeenCalledTimes(2)
    expect(notify).toHaveBeenNthCalledWith(1, 'Validation error 1', 'error')
    expect(notify).toHaveBeenNthCalledWith(2, 'Validation error 2', 'error')
  })

  it('deduplicates messages from detail array', () => {
    const notify = vi.fn()
    showApiErrors(
      {
        response: {
          data: {
            detail: ['Duplicate', 'Different', 'Duplicate']
          }
        }
      },
      notify
    )
    expect(notify).toHaveBeenCalledTimes(2)
    expect(notify).toHaveBeenNthCalledWith(1, 'Duplicate', 'error')
    expect(notify).toHaveBeenNthCalledWith(2, 'Different', 'error')
  })

  it('ignores non-string and non-msg values in arrays', () => {
    const notify = vi.fn()
    showApiErrors(
      {
        response: {
          data: [
            'Valid error',
            123,
            null,
            { /* no msg property */ },
            'Another valid'
          ]
        }
      },
      notify
    )
    expect(notify).toHaveBeenCalledTimes(2)
    expect(notify).toHaveBeenNthCalledWith(1, 'Valid error', 'error')
    expect(notify).toHaveBeenNthCalledWith(2, 'Another valid', 'error')
  })

  it('converts non-string msg values to strings', () => {
    const notify = vi.fn()
    showApiErrors(
      {
        response: {
          data: [
            { msg: 123 },
            { msg: true }
          ]
        }
      },
      notify
    )
    expect(notify).toHaveBeenCalledTimes(2)
    expect(notify).toHaveBeenNthCalledWith(1, '123', 'error')
    expect(notify).toHaveBeenNthCalledWith(2, 'true', 'error')
  })

  it('prefers response.data over body for complex errors', () => {
    const notify = vi.fn()
    showApiErrors(
      {
        response: {
          data: { detail: 'Response detail error' }
        },
        body: 'Body error'
      },
      notify
    )
    expect(notify).toHaveBeenCalledOnce()
    expect(notify).toHaveBeenCalledWith('Response detail error', 'error')
  })

  it('handles errors with empty detail array', () => {
    const notify = vi.fn()
    showApiErrors(
      { response: { data: { detail: [] } } },
      notify
    )
    expect(notify).not.toHaveBeenCalled()
  })

  it('handles mixed string and object messages in detail', () => {
    const notify = vi.fn()
    showApiErrors(
      {
        response: {
          data: {
            detail: [
              'String error',
              { msg: 'Object error' },
              'Another string'
            ]
          }
        }
      },
      notify
    )
    expect(notify).toHaveBeenCalledTimes(3)
    expect(notify).toHaveBeenNthCalledWith(1, 'String error', 'error')
    expect(notify).toHaveBeenNthCalledWith(2, 'Object error', 'error')
    expect(notify).toHaveBeenNthCalledWith(3, 'Another string', 'error')
  })
})
