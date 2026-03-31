export const showApiErrors = (
  error: unknown,
  notify: (message: string, type?: string) => void
): void => {
  let errorData: unknown = undefined

  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response: unknown }).response === 'object' &&
    (error as { response: unknown }).response !== null &&
    'data' in (error as { response: { data: unknown } }).response
  ) {
    errorData = (error as { response: { data: unknown } }).response.data
  } else if (typeof error === 'object' && error !== null && 'body' in error) {
    errorData = (error as { body: unknown }).body
  }

  const messages: string[] = []

  if (typeof errorData === 'string') {
    messages.push(errorData)
  } else if (Array.isArray(errorData)) {
    for (const item of errorData) {
      if (typeof item === 'string') messages.push(item)
      else if (typeof item === 'object' && item !== null && 'msg' in item) {
        messages.push(String((item as { msg: string }).msg))
      }
    }
  } else if (typeof errorData === 'object' && errorData !== null && 'detail' in errorData) {
    const detail = (errorData as { detail: unknown }).detail
    if (typeof detail === 'string') {
      messages.push(detail)
    } else if (Array.isArray(detail)) {
      for (const item of detail) {
        if (typeof item === 'string') messages.push(item)
        else if (typeof item === 'object' && item !== null && 'msg' in item) {
          messages.push(String((item as { msg: string }).msg))
        }
      }
    }
  }

  const shown = new Set<string>()
  for (const msg of messages) {
    if (!shown.has(msg)) {
      shown.add(msg)
      notify(msg, 'error')
    }
  }
}
