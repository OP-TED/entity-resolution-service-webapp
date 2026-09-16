import {
  DEFAULT_SCORE_THRESHOLDS,
  getScoreThresholds,
  loadAppConfig
} from '@utils/appConfig'
import { afterEach, describe, expect, it, vi } from 'vitest'

const respondWith = (body: unknown, ok = true) =>
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok,
      json: async () => body
    })
  )

describe('loadAppConfig', () => {
  afterEach(async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('no config')))
    await loadAppConfig()
    vi.unstubAllGlobals()
  })

  it('uses the built-in boundaries before any config is loaded', () => {
    expect(getScoreThresholds()).toEqual({ lowMax: 0.4, mediumMax: 0.7 })
    expect(DEFAULT_SCORE_THRESHOLDS).toEqual({ lowMax: 0.4, mediumMax: 0.7 })
  })

  it('applies the boundaries served in /config.json', async () => {
    respondWith({ scoreLevels: { lowMax: 0.25, mediumMax: 0.8 } })

    await loadAppConfig()

    expect(getScoreThresholds()).toEqual({ lowMax: 0.25, mediumMax: 0.8 })
  })

  it('falls back to the defaults for values that are not numbers', async () => {
    respondWith({ scoreLevels: { lowMax: 'not a number' } })

    await loadAppConfig()

    expect(getScoreThresholds()).toEqual({ lowMax: 0.4, mediumMax: 0.7 })
  })

  it('keeps the defaults when the config is not served', async () => {
    respondWith({}, false)

    await loadAppConfig()

    expect(getScoreThresholds()).toEqual({ lowMax: 0.4, mediumMax: 0.7 })
  })

  it('keeps the defaults when the body is not JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new SyntaxError('Unexpected token')
        }
      })
    )

    await loadAppConfig()

    expect(getScoreThresholds()).toEqual({ lowMax: 0.4, mediumMax: 0.7 })
  })

  it('keeps the defaults when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))

    await loadAppConfig()

    expect(getScoreThresholds()).toEqual({ lowMax: 0.4, mediumMax: 0.7 })
  })
})
