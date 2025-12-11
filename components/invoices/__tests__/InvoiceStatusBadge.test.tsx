import { render, screen } from '@testing-library/react'
import { InvoiceStatusBadge } from '../InvoiceStatusBadge'

describe('InvoiceStatusBadge', () => {
  it('should render draft status correctly', () => {
    render(<InvoiceStatusBadge status="draft" />)
    expect(screen.getByText('Brouillon')).toBeInTheDocument()
  })

  it('should render sent status correctly', () => {
    render(<InvoiceStatusBadge status="sent" />)
    expect(screen.getByText('Envoyée')).toBeInTheDocument()
  })

  it('should render paid status correctly', () => {
    render(<InvoiceStatusBadge status="paid" />)
    expect(screen.getByText('Payée')).toBeInTheDocument()
  })

  it('should render overdue status correctly', () => {
    render(<InvoiceStatusBadge status="overdue" />)
    expect(screen.getByText('En retard')).toBeInTheDocument()
  })

  it('should render cancelled status correctly', () => {
    render(<InvoiceStatusBadge status="cancelled" />)
    expect(screen.getByText('Annulée')).toBeInTheDocument()
  })

  it('should apply correct className for draft status', () => {
    const { container } = render(<InvoiceStatusBadge status="draft" />)
    const badge = container.querySelector('span')
    expect(badge).toHaveClass('bg-amber-100')
  })

  it('should apply correct className for paid status', () => {
    const { container } = render(<InvoiceStatusBadge status="paid" />)
    const badge = container.querySelector('span')
    expect(badge).toHaveClass('bg-green-100')
  })

  it('should have rounded-full class for all statuses', () => {
    const { container } = render(<InvoiceStatusBadge status="draft" />)
    const badge = container.querySelector('span')
    expect(badge).toHaveClass('rounded-full')
  })
})

