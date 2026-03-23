import { describe, expect, it } from 'vitest'

import { AttributeValue } from '../../src/components/EntityAttributes/AttributeValue'
import { DiffIcon } from '../../src/components/EntityAttributes/DiffIcon '
import { DiffSummary } from '../../src/components/EntityAttributes/DiffSummary'
import { EntityAttributes } from '../../src/components/EntityAttributes/EntityAttributes'
import { render, screen } from '../test-utils'

import type { AttributeDiff } from '../../src/utils/comparison'

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

  it('renders DiffSummary when showDiffSummary=true and diffs exist', () => {
    const current = { name: 'Alice' }
    const proposed = { name: 'Bob' }

    render(
      <EntityAttributes
        parsedData={current}
        compareWith={proposed}
        showDiffSummary
      />
    )
    // DiffSummary renders "1 Modified" tag
    expect(screen.getByText(/Modified/)).toBeInTheDocument()
  })

  it('shows "No attributes available" when compareWith is null/undefined but parsedData missing', () => {
    render(<EntityAttributes compareWith={undefined} />)
    expect(screen.getByText('No attributes available')).toBeInTheDocument()
  })
})

// ─── AttributeValue ──────────────────────────────────────────────────────────

describe('AttributeValue', () => {
  it('returns the current value string for a non-modified diff', () => {
    const diff: AttributeDiff = {
      key: 'name',
      type: 'added',
      currentValue: 'Alice',
      newValue: 'Alice'
    }
    render(<AttributeValue diff={diff} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('renders old and new Alert boxes for a "modified" diff', () => {
    const diff: AttributeDiff = {
      key: 'name',
      type: 'modified',
      oldValue: 'Alice',
      newValue: 'Bob',
      currentValue: 'Bob'
    }
    render(<AttributeValue diff={diff} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('renders empty string when diff is undefined', () => {
    const { container } = render(<AttributeValue />)
    expect(container.textContent).toBe('')
  })
})

// ─── DiffIcon ────────────────────────────────────────────────────────────────

describe('DiffIcon', () => {
  it('renders for "added" type without crashing', () => {
    const { container } = render(<DiffIcon type="added" />)
    expect(container.firstChild).not.toBeNull()
  })

  it('renders for "removed" type without crashing', () => {
    const { container } = render(<DiffIcon type="removed" />)
    expect(container.firstChild).not.toBeNull()
  })

  it('renders for "modified" type without crashing', () => {
    const { container } = render(<DiffIcon type="modified" />)
    expect(container.firstChild).not.toBeNull()
  })

  it('renders for "unchanged" type without crashing', () => {
    const { container } = render(<DiffIcon type="unchanged" />)
    expect(container.firstChild).not.toBeNull()
  })
})

// ─── DiffSummary ─────────────────────────────────────────────────────────────

describe('DiffSummary', () => {
  it('renders nothing visible when there are no changes', () => {
    const diffs: AttributeDiff[] = [
      { key: 'a', type: 'unchanged', currentValue: 'x' }
    ]
    render(<DiffSummary diffs={diffs} />)
    expect(screen.queryByText(/Modified/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Added/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Removed/)).not.toBeInTheDocument()
  })

  it('shows "Modified" tag when there are modified diffs', () => {
    const diffs: AttributeDiff[] = [
      { key: 'a', type: 'modified', oldValue: '1', newValue: '2', currentValue: '2' }
    ]
    render(<DiffSummary diffs={diffs} />)
    expect(screen.getByText(/1 Modified/)).toBeInTheDocument()
  })

  it('shows "Added" tag when there are added diffs', () => {
    const diffs: AttributeDiff[] = [
      { key: 'b', type: 'added', newValue: 'new', currentValue: 'new' }
    ]
    render(<DiffSummary diffs={diffs} />)
    expect(screen.getByText(/1 Added/)).toBeInTheDocument()
  })

  it('shows "Removed" tag when there are removed diffs', () => {
    const diffs: AttributeDiff[] = [
      { key: 'c', type: 'removed', oldValue: 'old', currentValue: 'old' }
    ]
    render(<DiffSummary diffs={diffs} />)
    expect(screen.getByText(/1 Removed/)).toBeInTheDocument()
  })

  it('shows multiple tags when multiple change types exist', () => {
    const diffs: AttributeDiff[] = [
      { key: 'a', type: 'modified', oldValue: '1', newValue: '2', currentValue: '2' },
      { key: 'b', type: 'added', newValue: 'new', currentValue: 'new' },
      { key: 'c', type: 'removed', oldValue: 'old', currentValue: 'old' }
    ]
    render(<DiffSummary diffs={diffs} />)
    expect(screen.getByText(/1 Modified/)).toBeInTheDocument()
    expect(screen.getByText(/1 Added/)).toBeInTheDocument()
    expect(screen.getByText(/1 Removed/)).toBeInTheDocument()
  })
})
