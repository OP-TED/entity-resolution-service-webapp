
import { AttributeValue } from '@components/EntityAttributes/AttributeValue'
import { DiffIcon } from '@components/EntityAttributes/DiffIcon '
import { EntityAttributes } from '@components/EntityAttributes/EntityAttributes'
import { describe, expect, it } from 'vitest'

import { render, screen } from '../test-utils'

import type { AttributeDiff } from '@utils/comparison'

// ─── EntityAttributes ────────────────────────────────────────────────────────

describe('EntityAttributes', () => {
  it('shows "No attributes available" when parsedData is undefined', () => {
    render(<EntityAttributes />)
    expect(screen.getByText('No attributes available')).toBeInTheDocument()
  })

  it('shows "No attributes available" when parsedData is not an object', () => {
    render(<EntityAttributes parsedData="a string" />)
    expect(screen.getByText('No attributes available')).toBeInTheDocument()
  })

  it('shows "No attributes available" when parsedData is an empty object', () => {
    render(<EntityAttributes parsedData={{}} />)
    expect(screen.getByText('No attributes available')).toBeInTheDocument()
  })

  it('renders key-value pairs from parsedData', () => {
    render(<EntityAttributes parsedData={{ first_name: 'Alice', age: 30 }} />)
    expect(screen.getByText('First name:')).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Age:')).toBeInTheDocument()
    expect(screen.getByText('30')).toBeInTheDocument()
  })

  it('shows "No attributes to compare" when comparison yields no diffs', () => {
    render(
      <EntityAttributes
        parsedData={{}}
        compareWith={{}}
      />
    )
    expect(screen.getByText('No attributes to compare')).toBeInTheDocument()
  })

  it('renders diffs when in comparison mode', () => {
    const current = { name: 'Alice' }
    const proposed = { name: 'Bob', email: 'bob@example.com' }

    render(
      <EntityAttributes
        parsedData={current}
        compareWith={proposed}
      />
    )
    // "modified" name and "added" email should appear
    expect(screen.getByText('Name:')).toBeInTheDocument()
    expect(screen.getByText('Email:')).toBeInTheDocument()
  })

  it('shows "No attributes available" when compareWith is null/undefined but parsedData missing', () => {
    render(<EntityAttributes compareWith={undefined} />)
    expect(screen.getByText('No attributes available')).toBeInTheDocument()
  })
})

// ─── AttributeValue ──────────────────────────────────────────────────────────

describe('AttributeValue', () => {
  it('renders the current value for an "added" diff', () => {
    const diff: AttributeDiff = {
      key: 'name',
      type: 'added',
      currentValue: 'Alice',
      newValue: 'Alice'
    }
    render(<AttributeValue diff={diff} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('renders current value for a "modified" diff', () => {
    const diff: AttributeDiff = {
      key: 'name',
      type: 'modified',
      oldValue: 'Alice',
      newValue: 'Bob',
      currentValue: 'Alice'
    }
    render(<AttributeValue diff={diff} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('renders empty string when diff is undefined', () => {
    const { container } = render(<AttributeValue />)
    expect(container.textContent).toBe('')
  })
})

// ─── DiffIcon ────────────────────────────────────────────────────────────────

describe('DiffIcon', () => {
  it('renders PlusCircleOutlined icon for "added" type', () => {
    const { container } = render(<DiffIcon type="added" />)
    expect(container.querySelector('.anticon-plus-circle')).toBeInTheDocument()
  })

  it('renders CloseCircleOutlined icon for "removed" type', () => {
    const { container } = render(<DiffIcon type="removed" />)
    expect(container.querySelector('.anticon-close-circle')).toBeInTheDocument()
  })

  it('renders EditOutlined icon for "modified" type', () => {
    const { container } = render(<DiffIcon type="modified" />)
    expect(container.querySelector('.anticon-edit')).toBeInTheDocument()
  })

  it('renders CheckCircleOutlined icon for "unchanged" type', () => {
    const { container } = render(<DiffIcon type="unchanged" />)
    expect(container.querySelector('.anticon-check-circle')).toBeInTheDocument()
  })

  it('renders different icons for different diff types', () => {
    const { container: addedContainer } = render(<DiffIcon type="added" />)
    const { container: removedContainer } = render(<DiffIcon type="removed" />)

    expect(addedContainer.querySelector('.anticon-plus-circle')).toBeInTheDocument()
    expect(addedContainer.querySelector('.anticon-close-circle')).not.toBeInTheDocument()
    expect(removedContainer.querySelector('.anticon-close-circle')).toBeInTheDocument()
    expect(removedContainer.querySelector('.anticon-plus-circle')).not.toBeInTheDocument()
  })
})
