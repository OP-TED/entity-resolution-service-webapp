const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null

// Friendly copy for the cases where the server is unreachable or unresponsive.
// Without these, the raw AxiosError (`message: 'Network Error'`, no `.response`)
// produces zero notifications, leaving the user with no signal.
export const NETWORK_ERROR_MESSAGE =
  'Cannot reach the server. Check your connection or try again in a moment.'
export const TIMEOUT_ERROR_MESSAGE =
  'The server took too long to respond. Try again in a moment.'
export const SERVER_ERROR_MESSAGE =
  'Something went wrong on the server. Please try again.'

const getConnectivityMessage = (error: unknown): string | undefined => {
  if (!isObject(error)) return undefined

  const code = typeof error.code === 'string' ? error.code : undefined
  const message = typeof error.message === 'string' ? error.message : ''
  const hasResponse = isObject(error.response)

  if (code === 'ECONNABORTED' || (!hasResponse && /timeout/i.test(message))) {
    return TIMEOUT_ERROR_MESSAGE
  }

  if (!hasResponse) {
    // Axios surfaces network failures with no `response` and either a
    // recognizable `code` (ERR_NETWORK / ERR_CONNECTION_REFUSED / DNS-class
    // codes) or a "Network Error" message.
    if (code === 'ERR_NETWORK' || /network|fetch/i.test(message)) {
      return NETWORK_ERROR_MESSAGE
    }
  }

  if (hasResponse) {
    const status =
      typeof (error.response as Record<string, unknown>).status === 'number'
        ? ((error.response as Record<string, unknown>).status as number)
        : undefined
    if (typeof status === 'number' && status >= 500) {
      return SERVER_ERROR_MESSAGE
    }
  }

  return undefined
}

const extractMessages = (errorData: unknown): string[] => {
  const out: string[] = []

  if (typeof errorData === 'string') {
    // Reverse proxies (nginx, etc.) return HTML for 5xx — don't surface that
    // verbatim; fall through so the connectivity fallback can show a friendly
    // 5xx message instead.
    if (errorData && !/^\s*</.test(errorData)) out.push(errorData)

    return out
  }

  if (Array.isArray(errorData)) {
    for (const item of errorData) {
      if (typeof item === 'string') out.push(item)
      else if (isObject(item) && 'msg' in item) out.push(String(item.msg))
    }

    return out
  }

  if (isObject(errorData) && 'detail' in errorData) {
    const detail = errorData.detail
    if (typeof detail === 'string') {
      out.push(detail)
    } else if (Array.isArray(detail)) {
      for (const item of detail) {
        if (typeof item === 'string') out.push(item)
        else if (isObject(item) && 'msg' in item) out.push(String(item.msg))
      }
    }

    return out
  }

  // Curation API standardized on { error_code, message } in place of { detail }.
  // Fall back to `message` only when `detail` is absent so older endpoints keep
  // working unchanged.
  if (isObject(errorData) && 'message' in errorData) {
    const message = errorData.message
    if (typeof message === 'string') {
      out.push(message)
    }
  }

  return out
}

export const showApiErrors = (
  error: unknown,
  notify: (message: string, type?: string) => void
): void => {
  let errorData: unknown = undefined

  if (isObject(error) && isObject(error.response) && 'data' in error.response) {
    errorData = error.response.data
  } else if (isObject(error) && 'body' in error) {
    errorData = error.body
  }

  const messages = extractMessages(errorData)

  // Only fall back to a connectivity message when the server didn't supply one
  // we could parse. This preserves backend-provided detail strings verbatim.
  if (messages.length === 0) {
    const connectivity = getConnectivityMessage(error)
    if (connectivity) {
      notify(connectivity, 'error')
    }

    return
  }

  const shown = new Set<string>()
  for (const msg of messages) {
    if (!shown.has(msg)) {
      shown.add(msg)
      notify(msg, 'error')
    }
  }
}
