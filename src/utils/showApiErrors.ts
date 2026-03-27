export const showApiErrors = (
  error: unknown,
  notify: (
    message: string,
    type: 'success' | 'error' | 'info' | 'warning'
  ) => void
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

  const notificationMessages: string[] = []

  if (typeof errorData === 'string') {
    notificationMessages.push(errorData)
  } else if (Array.isArray(errorData)) {
    notificationMessages.push(...errorData)
  }

  const shown = new Set<string>()
  for (const msg of notificationMessages) {
    if (!shown.has(msg)) {
      shown.add(msg)
      notify(msg, 'error')
    }
  }
}
