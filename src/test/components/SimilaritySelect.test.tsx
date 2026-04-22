import { SimilaritySelect } from '@components/SimilaritySelect'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { render, screen } from '../test-utils'

// Mock antd Select to use native select for reliable testing
vi.mock('antd', async (importOriginal) => {
  const antd = await importOriginal<typeof import('antd')>()

  const NativeSelect = ({
    value,
    onChange,
    options,
    ...rest
  }: {
    value?: string
    onChange?: (v: string) => void
    options?: Array<{ label: string; value: string }>
    [key: string]: unknown
  }) => (
    <select
      aria-label={rest['aria-label'] as string | undefined}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    >
      {options?.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )

  return { ...antd, Select: NativeSelect }
})

describe('SimilaritySelect', () => {
  it('renders with "All Similarity" selected by default', () => {
    render(<SimilaritySelect onChange={vi.fn()} />)
    expect(screen.getByRole('combobox')).toHaveValue('All Similarity')
  })

  it('shows "Low (0-0.4)" label when min=0 and max=0.4', () => {
    render(
      <SimilaritySelect
        onChange={vi.fn()}
        similarityMin={0}
        similarityMax={0.4}
      />
    )
    expect(screen.getByRole('combobox')).toHaveValue('Low (0-0.4)')
  })

  it('shows "Medium (0.4-0.7)" label when min=0.4 and max=0.7', () => {
    render(
      <SimilaritySelect
        onChange={vi.fn()}
        similarityMin={0.4}
        similarityMax={0.7}
      />
    )
    expect(screen.getByRole('combobox')).toHaveValue('Medium (0.4-0.7)')
  })

  it('shows "High (0.7-1)" label when min=0.7 and max=1', () => {
    render(
      <SimilaritySelect
        onChange={vi.fn()}
        similarityMin={0.7}
        similarityMax={1}
      />
    )
    expect(screen.getByRole('combobox')).toHaveValue('High (0.7-1)')
  })

  it('calls onChange with correct min/max when Low option is selected', async () => {
    const onChange = vi.fn()
    render(<SimilaritySelect onChange={onChange} />)

    await userEvent.selectOptions(screen.getByRole('combobox'), 'Low (0-0.4)')

    expect(onChange).toHaveBeenCalledWith({ similarity_min: 0, similarity_max: 0.4 })
  })

  it('calls onChange with correct min/max when Medium option is selected', async () => {
    const onChange = vi.fn()
    render(<SimilaritySelect onChange={onChange} />)

    await userEvent.selectOptions(screen.getByRole('combobox'), 'Medium (0.4-0.7)')

    expect(onChange).toHaveBeenCalledWith({ similarity_min: 0.4, similarity_max: 0.7 })
  })

  it('calls onChange with correct min/max when High option is selected', async () => {
    const onChange = vi.fn()
    render(<SimilaritySelect onChange={onChange} />)

    await userEvent.selectOptions(screen.getByRole('combobox'), 'High (0.7-1)')

    expect(onChange).toHaveBeenCalledWith({ similarity_min: 0.7, similarity_max: 1 })
  })

  it('calls onChange with undefined min/max when All Similarity is selected', async () => {
    const onChange = vi.fn()
    render(
      <SimilaritySelect
        onChange={onChange}
        similarityMin={0.4}
        similarityMax={0.7}
      />
    )

    await userEvent.selectOptions(screen.getByRole('combobox'), 'All Similarity')

    expect(onChange).toHaveBeenCalledWith({
      similarity_min: undefined,
      similarity_max: undefined
    })
  })

  it('updates current value when props change', async () => {
    const { rerender } = render(
      <SimilaritySelect onChange={vi.fn()} similarityMin={0} similarityMax={0.4} />
    )
    expect(screen.getByRole('combobox')).toHaveValue('Low (0-0.4)')

    rerender(
      <SimilaritySelect onChange={vi.fn()} similarityMin={0.7} similarityMax={1} />
    )
    expect(screen.getByRole('combobox')).toHaveValue('High (0.7-1)')
  })

  it('returns undefined for unrecognized min/max combination', () => {
    render(
      <SimilaritySelect onChange={vi.fn()} similarityMin={0.5} similarityMax={0.9} />
    )
    // Should fall back to "All Similarity" for unrecognized combination
    expect(screen.getByRole('combobox')).toHaveValue('All Similarity')
  })

  it('renders all four options', () => {
    render(<SimilaritySelect onChange={vi.fn()} />)
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(4)
    expect(options[0]).toHaveTextContent('All Similarity')
    expect(options[1]).toHaveTextContent('Low (0-0.4)')
    expect(options[2]).toHaveTextContent('Medium (0.4-0.7)')
    expect(options[3]).toHaveTextContent('High (0.7-1)')
  })

  it('does not call onChange when component mounts', () => {
    const onChange = vi.fn()
    render(<SimilaritySelect onChange={onChange} />)
    expect(onChange).not.toHaveBeenCalled()
  })
})
