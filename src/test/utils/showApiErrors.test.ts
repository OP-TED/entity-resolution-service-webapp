import {
  NETWORK_ERROR_MESSAGE,
  SERVER_ERROR_MESSAGE,
  showApiErrors,
  TIMEOUT_ERROR_MESSAGE
} from '@utils/showApiErrors'
import { describe, expect, it, vi } from 'vitest'


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

  describe('curation API { error_code, message } shape', () => {
    it('extracts message when detail is absent', () => {
      const notify = vi.fn()
      showApiErrors(
        {
          response: {
            data: { error_code: 'INVALID_ARG', message: 'Bad request payload' }
          }
        },
        notify
      )
      expect(notify).toHaveBeenCalledOnce()
      expect(notify).toHaveBeenCalledWith('Bad request payload', 'error')
    })

    it('prefers detail over message when both are present', () => {
      const notify = vi.fn()
      showApiErrors(
        {
          response: {
            data: {
              detail: 'Detail wins',
              message: 'Should not appear'
            }
          }
        },
        notify
      )
      expect(notify).toHaveBeenCalledOnce()
      expect(notify).toHaveBeenCalledWith('Detail wins', 'error')
    })

    it('ignores non-string message field', () => {
      const notify = vi.fn()
      showApiErrors(
        { response: { data: { message: 123 } } },
        notify
      )
      expect(notify).not.toHaveBeenCalled()
    })

    it('extracts message from body shape', () => {
      const notify = vi.fn()
      showApiErrors(
        { body: { error_code: 'X', message: 'From body' } },
        notify
      )
      expect(notify).toHaveBeenCalledWith('From body', 'error')
    })
  })

  describe('connectivity fallbacks', () => {
    it('shows the timeout message when error.code is ECONNABORTED', () => {
      const notify = vi.fn()
      showApiErrors({ code: 'ECONNABORTED', message: 'timeout of 5000ms' }, notify)
      expect(notify).toHaveBeenCalledOnce()
      expect(notify).toHaveBeenCalledWith(TIMEOUT_ERROR_MESSAGE, 'error')
    })

    it('shows the timeout message when message contains "timeout" and there is no response', () => {
      const notify = vi.fn()
      showApiErrors({ message: 'Request timeout' }, notify)
      expect(notify).toHaveBeenCalledWith(TIMEOUT_ERROR_MESSAGE, 'error')
    })

    it('shows the network message when error.code is ERR_NETWORK', () => {
      const notify = vi.fn()
      showApiErrors({ code: 'ERR_NETWORK', message: 'Network Error' }, notify)
      expect(notify).toHaveBeenCalledOnce()
      expect(notify).toHaveBeenCalledWith(NETWORK_ERROR_MESSAGE, 'error')
    })

    it('shows the network message when message contains "Network Error"', () => {
      const notify = vi.fn()
      showApiErrors({ message: 'Network Error' }, notify)
      expect(notify).toHaveBeenCalledWith(NETWORK_ERROR_MESSAGE, 'error')
    })

    it('shows the server-error message for 5xx responses without parseable data', () => {
      const notify = vi.fn()
      showApiErrors(
        { response: { status: 503, data: { unrelated: 'shape' } } },
        notify
      )
      expect(notify).toHaveBeenCalledOnce()
      expect(notify).toHaveBeenCalledWith(SERVER_ERROR_MESSAGE, 'error')
    })

    it('shows the server-error message when a 5xx response body is HTML (e.g. nginx 504 page)', () => {
      const notify = vi.fn()
      showApiErrors(
        {
          response: {
            status: 504,
            data: '<html><head><title>504 Gateway Time-out</title></head><body><center><h1>504 Gateway Time-out</h1></center></body></html>'
          }
        },
        notify
      )
      expect(notify).toHaveBeenCalledOnce()
      expect(notify).toHaveBeenCalledWith(SERVER_ERROR_MESSAGE, 'error')
    })

    it('does not emit a connectivity message for a 4xx response with no parseable data', () => {
      const notify = vi.fn()
      showApiErrors(
        { response: { status: 404, data: {} } },
        notify
      )
      expect(notify).not.toHaveBeenCalled()
    })

    it('prefers backend-supplied detail over the connectivity fallback', () => {
      const notify = vi.fn()
      showApiErrors(
        {
          code: 'ERR_NETWORK',
          message: 'Network Error',
          response: { data: { detail: 'Backend says no' } }
        },
        notify
      )
      expect(notify).toHaveBeenCalledOnce()
      expect(notify).toHaveBeenCalledWith('Backend says no', 'error')
    })

    it('prefers backend-supplied 5xx detail over the SERVER_ERROR_MESSAGE fallback', () => {
      const notify = vi.fn()
      showApiErrors(
        { response: { status: 500, data: { message: 'kaboom' } } },
        notify
      )
      expect(notify).toHaveBeenCalledOnce()
      expect(notify).toHaveBeenCalledWith('kaboom', 'error')
    })

    it('emits no notification for an unrecognizable error with no signal', () => {
      const notify = vi.fn()
      showApiErrors({ foo: 'bar' }, notify)
      expect(notify).not.toHaveBeenCalled()
    })

    it('treats "fetch failed" as a network error', () => {
      const notify = vi.fn()
      showApiErrors({ message: 'fetch failed' }, notify)
      expect(notify).toHaveBeenCalledWith(NETWORK_ERROR_MESSAGE, 'error')
    })
  })
})
