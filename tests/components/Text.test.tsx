import { describe, expect, it } from 'vitest'

import { Text } from '../../src/components/Text'
import { render, screen } from '../test-utils'

describe('Text', () => {
  it('renders its children', () => {
    render(<Text>Hello world</Text>)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('renders with custom size and weight', () => {
    render(<Text size={18} weight={700}>Bold Text</Text>)
    expect(screen.getByText('Bold Text')).toBeInTheDocument()
  })

  it('renders with a custom className', () => {
    render(<Text className="my-class">Styled</Text>)
    const el = screen.getByText('Styled')
    expect(el.className).toContain('my-class')
  })

  it('renders with isEllipsis=true without crashing', () => {
    render(<Text isEllipsis>Long text that might overflow</Text>)
    expect(screen.getByText('Long text that might overflow')).toBeInTheDocument()
  })

  it('renders with color prop without crashing', () => {
    render(<Text color="colorTextSecondary">Secondary</Text>)
    expect(screen.getByText('Secondary')).toBeInTheDocument()
  })
})
