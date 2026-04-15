import { describe, expect, it } from 'vitest'

import { LoadingScreen } from '../../src/components/LoadingScreen'
import { render } from '../test-utils'

describe('LoadingScreen', () => {
  it('renders without crashing', () => {
    render(<LoadingScreen />)
    // antd Spin renders an aria-label by default
    const spinElement = document.querySelector('.ant-spin')
    expect(spinElement).toBeInTheDocument()
  })
})
