import { Text } from '@components/Text'
import { describe, expect, it } from 'vitest'

import { render, screen } from '../test-utils'

describe('Text', () => {
  it('renders its children', () => {
    render(<Text>Hello world</Text>)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('merges custom className with generated styles', () => {
    render(<Text className="my-class">Styled</Text>)
    const el = screen.getByText('Styled')
    // className should contain both the generated style and the custom class
    expect(el.className).toContain('my-class')
    // Generated styles from useStyles should also be present
    expect(el.className.split(' ').length).toBeGreaterThan(1)
  })

  it('passes through antd Typography props like strong', () => {
    render(<Text strong>Bold text</Text>)
    const el = screen.getByText('Bold text')
    expect(el.tagName).toBe('STRONG')
  })

  it('applies ellipsis config when isEllipsis is true', () => {
    const { container } = render(<Text isEllipsis>Long text that might overflow</Text>)
    // antd Typography with ellipsis renders a specific CSS class
    const ellipsisEl = container.querySelector('.ant-typography-ellipsis')
    expect(ellipsisEl).toBeInTheDocument()
    expect(ellipsisEl).toHaveTextContent('Long text that might overflow')
  })

  it('does not apply ellipsis when isEllipsis is false (default)', () => {
    const { container } = render(<Text>Normal text</Text>)
    expect(container.querySelector('.ant-typography-ellipsis')).not.toBeInTheDocument()
  })
})
