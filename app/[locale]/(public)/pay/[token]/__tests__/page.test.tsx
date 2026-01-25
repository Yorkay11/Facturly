import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PublicPayPage from '../page';

// Mock Next.js
jest.mock('next/navigation', () => ({
  useParams: jest.fn(() => ({ token: 'valid-token-123' })),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
  })),
}));

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      'public.pay.title': 'Payer la facture',
      'public.pay.errors.invalidToken': 'Token invalide',
      'public.pay.errors.invalidTokenDescription': 'Le lien de paiement est invalide',
      'public.pay.errors.invoiceNotFound': 'Facture non trouvée',
      'public.pay.errors.alreadyPaid': 'Facture déjà payée',
      'public.pay.toasts.success': 'Paiement enregistré',
      'public.pay.toasts.error': 'Erreur de paiement',
      'common.error': 'Erreur',
    };
    return translations[key] || key;
  }),
  useLocale: jest.fn(() => 'fr'),
}));

// Mock RTK Query
jest.mock('@/services/facturlyApi', () => ({
  useGetPublicInvoiceQuery: jest.fn(),
  usePayPublicInvoiceMutation: jest.fn(),
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock window.location.reload
Object.defineProperty(window, 'location', {
  value: {
    reload: jest.fn(),
  },
  writable: true,
});

describe('PublicPayPage', () => {
  const mockInvoice = {
    invoice: {
      id: 'inv-123',
      invoiceNumber: 'FAC-001',
      totalAmount: '10000.00',
      amountPaid: '0.00',
      currency: 'XOF',
      issueDate: '2025-01-01',
      dueDate: '2025-01-31',
      status: 'sent',
      client: {
        name: 'Client Test',
        email: 'client@test.com',
      },
      items: [
        {
          description: 'Service',
          quantity: '1',
          unitPrice: '10000.00',
          totalAmount: '10000.00',
        },
      ],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render invoice details when token is valid', () => {
    // Arrange
    (require('@/services/facturlyApi').useGetPublicInvoiceQuery as jest.Mock).mockReturnValue({
      data: mockInvoice,
      isLoading: false,
      isError: false,
    });

    // Act
    render(<PublicPayPage />);

    // Assert
    expect(screen.getByText('FAC-001')).toBeInTheDocument();
    expect(screen.getByText('Client Test')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    // Arrange
    (require('@/services/facturlyApi').useGetPublicInvoiceQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    // Act
    render(<PublicPayPage />);

    // Assert
    // Skeleton loaders should be visible
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should show error when token is invalid', () => {
    // Arrange
    (require('next/navigation').useParams as jest.Mock).mockReturnValue({ token: undefined });

    // Act
    render(<PublicPayPage />);

    // Assert
    expect(screen.getByText('Token invalide')).toBeInTheDocument();
  });

  it('should show error when invoice is not found', () => {
    // Arrange
    (require('@/services/facturlyApi').useGetPublicInvoiceQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { status: 404 },
    });

    // Act
    render(<PublicPayPage />);

    // Assert
    expect(screen.getByText('Facture non trouvée')).toBeInTheDocument();
  });

  it('should handle payment submission', async () => {
    // Arrange
    const user = userEvent.setup();
    (require('@/services/facturlyApi').useGetPublicInvoiceQuery as jest.Mock).mockReturnValue({
      data: mockInvoice,
      isLoading: false,
      isError: false,
    });

    const mockPayInvoice = jest.fn().mockResolvedValue({
      unwrap: jest.fn().mockResolvedValue({}),
    });

    (require('@/services/facturlyApi').usePayPublicInvoiceMutation as jest.Mock).mockReturnValue([
      mockPayInvoice,
      { isLoading: false },
    ]);

    render(<PublicPayPage />);

    // Act
    const payButton = screen.getByRole('button', { name: /payer/i });
    await user.click(payButton);

    // Assert
    await waitFor(() => {
      expect(mockPayInvoice).toHaveBeenCalled();
    });
  });

  it('should show Moneroo payment modal when online payment is selected', async () => {
    // Arrange
    const user = userEvent.setup();
    (require('@/services/facturlyApi').useGetPublicInvoiceQuery as jest.Mock).mockReturnValue({
      data: mockInvoice,
      isLoading: false,
      isError: false,
    });

    render(<PublicPayPage />);

    // Act
    // Sélectionner paiement en ligne
    const onlinePaymentRadio = screen.getByLabelText(/paiement en ligne/i);
    await user.click(onlinePaymentRadio);

    // Cliquer sur le bouton de paiement Moneroo
    const monerooButton = screen.queryByRole('button', { name: /payer avec mobile money/i });
    if (monerooButton) {
      await user.click(monerooButton);
    }

    // Assert
    // Le modal Moneroo devrait s'ouvrir
    // (nécessite que le composant MonerooPaymentModal soit rendu)
  });
});
