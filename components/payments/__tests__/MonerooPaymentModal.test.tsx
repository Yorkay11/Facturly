import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MonerooPaymentModal } from '../MonerooPaymentModal';

// Mock RTK Query
jest.mock('@/services/facturlyApi', () => ({
  useInitMonerooPaymentMutation: jest.fn(),
}));

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      'payments.moneroo.title': 'Payer avec Mobile Money',
      'payments.moneroo.description': 'Vous allez être redirigé vers Moneroo',
      'payments.moneroo.amount': 'Montant',
      'payments.moneroo.redirectInfo': 'Redirection vers Moneroo...',
      'payments.moneroo.processing': 'Traitement...',
      'payments.moneroo.continue': 'Continuer',
      'payments.moneroo.errors.checkoutUrlMissing': 'URL de paiement manquante',
      'payments.moneroo.errors.paymentFailed': 'Échec du paiement',
      'common.error': 'Erreur',
      'common.cancel': 'Annuler',
    };
    return translations[key] || key;
  }),
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock window.location
const mockLocation = {
  href: '',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

describe('MonerooPaymentModal', () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    invoiceId: 'inv-123',
    amount: '10000',
    currency: 'XOF',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '+225712345678',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocation.href = '';
  });

  it('should render modal when open', () => {
    // Arrange & Act
    render(<MonerooPaymentModal {...defaultProps} />);

    // Assert
    expect(screen.getByText('Payer avec Mobile Money')).toBeInTheDocument();
    expect(screen.getByText('10 000,00 XOF')).toBeInTheDocument();
  });

  it('should not render modal when closed', () => {
    // Arrange & Act
    render(<MonerooPaymentModal {...defaultProps} open={false} />);

    // Assert
    expect(screen.queryByText('Payer avec Mobile Money')).not.toBeInTheDocument();
  });

  it('should initiate payment and redirect to checkout', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockInitPayment = jest.fn().mockResolvedValue({
      unwrap: jest.fn().mockResolvedValue({
        checkoutUrl: 'https://checkout.moneroo.io/pay_123',
      }),
    });

    (require('@/services/facturlyApi').useInitMonerooPaymentMutation as jest.Mock).mockReturnValue([
      mockInitPayment,
      { isLoading: false },
    ]);

    render(<MonerooPaymentModal {...defaultProps} />);

    // Act
    const continueButton = screen.getByRole('button', { name: /continuer/i });
    await user.click(continueButton);

    // Assert
    await waitFor(() => {
      expect(mockInitPayment).toHaveBeenCalledWith({
        invoiceId: 'inv-123',
        phoneNumber: '+225712345678',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
      });
    });

    await waitFor(() => {
      expect(mockLocation.href).toBe('https://checkout.moneroo.io/pay_123');
    });
  });

  it('should show error when checkoutUrl is missing', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockInitPayment = jest.fn().mockResolvedValue({
      unwrap: jest.fn().mockResolvedValue({
        checkoutUrl: null,
      }),
    });

    (require('@/services/facturlyApi').useInitMonerooPaymentMutation as jest.Mock).mockReturnValue([
      mockInitPayment,
      { isLoading: false },
    ]);

    render(<MonerooPaymentModal {...defaultProps} />);

    // Act
    const continueButton = screen.getByRole('button', { name: /continuer/i });
    await user.click(continueButton);

    // Assert
    await waitFor(() => {
      expect(require('sonner').toast.error).toHaveBeenCalledWith('Erreur', {
        description: 'URL de paiement manquante',
      });
    });
  });

  it('should handle payment initiation error', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockInitPayment = jest.fn().mockRejectedValue({
      data: { message: 'Erreur de paiement' },
    });

    (require('@/services/facturlyApi').useInitMonerooPaymentMutation as jest.Mock).mockReturnValue([
      mockInitPayment,
      { isLoading: false },
    ]);

    render(<MonerooPaymentModal {...defaultProps} />);

    // Act
    const continueButton = screen.getByRole('button', { name: /continuer/i });
    await user.click(continueButton);

    // Assert
    await waitFor(() => {
      expect(require('sonner').toast.error).toHaveBeenCalledWith('Erreur', {
        description: 'Erreur de paiement',
      });
    });
  });

  it('should disable button while loading', () => {
    // Arrange
    (require('@/services/facturlyApi').useInitMonerooPaymentMutation as jest.Mock).mockReturnValue([
      jest.fn(),
      { isLoading: true },
    ]);

    render(<MonerooPaymentModal {...defaultProps} />);

    // Assert
    const continueButton = screen.getByRole('button', { name: /traitement/i });
    expect(continueButton).toBeDisabled();
  });

  it('should close modal when cancel button is clicked', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockOnOpenChange = jest.fn();

    (require('@/services/facturlyApi').useInitMonerooPaymentMutation as jest.Mock).mockReturnValue([
      jest.fn(),
      { isLoading: false },
    ]);

    render(<MonerooPaymentModal {...defaultProps} onOpenChange={mockOnOpenChange} />);

    // Act
    const cancelButton = screen.getByRole('button', { name: /annuler/i });
    await user.click(cancelButton);

    // Assert
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should display amount correctly formatted', () => {
    // Arrange & Act
    render(<MonerooPaymentModal {...defaultProps} amount="15000.50" currency="XOF" />);

    // Assert
    expect(screen.getByText('15 000,50 XOF')).toBeInTheDocument();
  });

  it('should work without customer phone', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockInitPayment = jest.fn().mockResolvedValue({
      unwrap: jest.fn().mockResolvedValue({
        checkoutUrl: 'https://checkout.moneroo.io/pay_123',
      }),
    });

    (require('@/services/facturlyApi').useInitMonerooPaymentMutation as jest.Mock).mockReturnValue([
      mockInitPayment,
      { isLoading: false },
    ]);

    render(<MonerooPaymentModal {...defaultProps} customerPhone={undefined} />);

    // Act
    const continueButton = screen.getByRole('button', { name: /continuer/i });
    await user.click(continueButton);

    // Assert
    await waitFor(() => {
      expect(mockInitPayment).toHaveBeenCalledWith({
        invoiceId: 'inv-123',
        phoneNumber: undefined,
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
      });
    });
  });
});
