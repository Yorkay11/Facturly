import { render, screen } from '@testing-library/react'
import { StatCard } from '../StatCard'
import { DollarSign } from 'lucide-react'

describe('StatCard', () => {
  it('should render title and value', () => {
    render(<StatCard title="Revenue" value="€1,234" />)
    expect(screen.getByText('Revenue')).toBeInTheDocument()
    expect(screen.getByText('€1,234')).toBeInTheDocument()
  })

  it('should render helper text when provided', () => {
    render(<StatCard title="Revenue" value="€1,234" helper="Last 30 days" />)
    expect(screen.getByText('Last 30 days')).toBeInTheDocument()
  })

  it('should render icon when provided', () => {
    render(<StatCard title="Revenue" value="€1,234" icon={<DollarSign data-testid="icon" />} />)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('should render trend with positive indicator', () => {
    render(
      <StatCard
        title="Revenue"
        value="€1,234"
        trend={{ label: '+12%', positive: true }}
      />
    )
    expect(screen.getByText('+12%')).toBeInTheDocument()
  })

  it('should render trend with negative indicator', () => {
    render(
      <StatCard
        title="Revenue"
        value="€1,234"
        trend={{ label: '-5%', positive: false }}
      />
    )
    expect(screen.getByText('-5%')).toBeInTheDocument()
  })

  it('should apply default variant styles', () => {
    const { container } = render(<StatCard title="Revenue" value="€1,234" />)
    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('bg-white')
    expect(card).toHaveClass('border-primary/30')
  })

  it('should apply accent variant styles', () => {
    const { container } = render(
      <StatCard title="Revenue" value="€1,234" variant="accent" />
    )
    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('bg-accent/20')
    expect(card).toHaveClass('border-accent/60')
  })

  it('should render all props together', () => {
    render(
      <StatCard
        title="Total Revenue"
        value="€5,678"
        helper="This month"
        icon={<DollarSign data-testid="revenue-icon" />}
        trend={{ label: '+25%', positive: true }}
        variant="accent"
      />
    )

    expect(screen.getByText('Total Revenue')).toBeInTheDocument()
    expect(screen.getByText('€5,678')).toBeInTheDocument()
    expect(screen.getByText('This month')).toBeInTheDocument()
    expect(screen.getByText('+25%')).toBeInTheDocument()
    expect(screen.getByTestId('revenue-icon')).toBeInTheDocument()
  })

  it('should not render helper when not provided', () => {
    render(<StatCard title="Revenue" value="€1,234" />)
    expect(screen.queryByText(/Last/i)).not.toBeInTheDocument()
  })

  it('should not render trend when not provided', () => {
    render(<StatCard title="Revenue" value="€1,234" />)
    expect(screen.queryByText(/\+/)).not.toBeInTheDocument()
    expect(screen.queryByText(/-/)).not.toBeInTheDocument()
  })
})

