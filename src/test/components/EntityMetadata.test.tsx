import { EntityMetadata } from '@components/EntityMetadata'
import { describe, expect, it } from 'vitest'

import { fireEvent, render, screen, waitFor } from '../test-utils'

const identifier = {
  source_id: 'src-123',
  request_id: 'req-456',
  entity_type: 'http://example.org/Organisation'
}

describe('EntityMetadata (TEDSWS-514)', () => {
  it('renders no trigger when no identifier is provided', () => {
    render(<EntityMetadata />)
    expect(
      screen.queryByRole('button', { name: /show entity mention metadata/i })
    ).not.toBeInTheDocument()
  })

  it('renders an on-demand info trigger that does not show metadata up front', () => {
    render(<EntityMetadata identifier={identifier} />)

    expect(
      screen.getByRole('button', { name: /show entity mention metadata/i })
    ).toBeInTheDocument()
    // Metadata stays hidden until the user opens the popover (non-intrusive).
    expect(screen.queryByText('src-123')).not.toBeInTheDocument()
  })

  it('reveals source_id, request_id and entity_type when opened', async () => {
    render(<EntityMetadata identifier={identifier} />)

    fireEvent.click(
      screen.getByRole('button', { name: /show entity mention metadata/i })
    )

    await waitFor(() => {
      expect(screen.getByText('Source ID')).toBeInTheDocument()
      expect(screen.getByText('src-123')).toBeInTheDocument()
      expect(screen.getByText('Request ID')).toBeInTheDocument()
      expect(screen.getByText('req-456')).toBeInTheDocument()
      expect(screen.getByText('Entity Type')).toBeInTheDocument()
      expect(
        screen.getByText('http://example.org/Organisation')
      ).toBeInTheDocument()
    })
  })
})
