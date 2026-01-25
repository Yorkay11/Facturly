import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreditsPurchaseModal } from '../credits-purchase-modal';

// Mock RTK Query
jest.mock('@/services/facturlyApi', () => ({
  useGetPlansQuery: jest.fn(),
  usePurchaseCreditsMutation: jest.fn(),
  usePurchasePackMutation: jest.fn(),
}));

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      'settings.subscription.credits.title': 'Acheter des crédits',
      'settings.subscription.credits.unitPurchase': 'Achat unitaire',
      'settings.subscription.credits.packs': 'Packs',
      'settings.subscription.credits.quantity': 'Quantité',
      'settings.subscription.credits.purchase': 'Acheter',
      'settings.subscription.credits.errors.invalidQuantity': 'Quantité invalide',
      'settings.subscription.credits.errors.checkoutUrlMissing': 'URL de paiement manquante',
      'settings.subscription.credits.errors.purchaseFailed': 'Échec de l\'achat',
      'common.error': 'Erreur',
      'common.cancel': 'Annuler',
    };
    return translations[key] || key;
  }),
}));

// Mock i18n routing
jest.mock('@/i18n/routing', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
  })),
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

describe('CreditsPurchaseModal', () => {
  const mockPlans = {
    data: [
      {
        plan: 'pay_as_you_go',
        type: 'unit',
        pricePerInvoice: 150,
      },
      {
        plan: 'pay_as_you_go',
        type: 'pack',
        packType: 'starter',
        price: 5000,
        credits: 60,
      },
      {
        plan: 'pay_as_you_go',
        type: 'pack',
        packType: 'pro',
        price: 15000,
        credits: 200,
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocation.href = '';

    (require('@/services/facturlyApi').useGetPlansQuery as jest.Mock).mockReturnValue({
      data: mockPlans,
      isLoading: false,
    });
  });

  it('should render modal when open', () => {
    // Arrange & Act
    render(<CreditsPurchaseModal open={true} onOpenChange={jest.fn()} />);

    // Assert
    expect(screen.getByText(/acheter des crédits/i)).toBeInTheDocument();
  });

  it('should not render modal when closed', () => {
    // Arrange & Act
    render(<CreditsPurchaseModal open={false} onOpenChange={jest.fn()} />);

    // Assert
    expect(screen.queryByText(/acheter des crédits/i)).not.toBeInTheDocument();
  });

  it('should display unit purchase option', () => {
    // Arrange & Act
    render(<CreditsPurchaseModal open={true} onOpenChange={jest.fn()} />);

    // Assert
    expect(screen.getByText(/achat unitaire/i)).toBeInTheDocument();
  });

  it('should display available packs', () => {
    // Arrange & Act
    render(<CreditsPurchaseModal open={true} onOpenChange={jest.fn()} />);

    // Assert
    expect(screen.getByText(/packs/i)).toBeInTheDocument();
  });

  it('should purchase unit credits successfully', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockPurchaseCredits = jest.fn().mockResolvedValue({
      unwrap: jest.fn().mockResolvedValue({
        checkoutUrl: 'https://checkout.moneroo.io/pay_123',
      }),
    });

    (require('@/services/facturlyApi').usePurchaseCreditsMutation as jest.Mock).mockReturnValue([
      mockPurchaseCredits,
      { isLoading: false },
    ]);

    render(<CreditsPurchaseModal open={true} onOpenChange={jest.fn()} />);

    // Act
    const quantityInput = screen.getByLabelText(/quantité/i);
    await user.clear(quantityInput);
    await user.type(quantityInput, '5');

    const purchaseButton = screen.getByRole('button', { name: /acheter/i });
    await user.click(purchaseButton);

    // Assert
    await waitFor(() => {
      expect(mockPurchaseCredits).toHaveBeenCalledWith({ quantity: 5 });
    });

    await waitFor(() => {
      expect(mockLocation.href).toBe('https://checkout.moneroo.io/pay_123');
    });
  });

  it('should purchase pack successfully', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockPurchasePack = jest.fn().mockResolvedValue({
      unwrap: jest.fn().mockResolvedValue({
        checkoutUrl: 'https://checkout.moneroo.io/pay_456',
      }),
    });

    (require('@/services/facturlyApi').usePurchasePackMutation as jest.Mock).mockReturnValue([
      mockPurchasePack,
      { isLoading: false },
    ]);

    render(<CreditsPurchaseModal open={true} onOpenChange={jest.fn()} />);

    // Act
    // Trouver et cliquer sur le pack starter
    const packButtons = screen.getAllByRole('button', { name: /acheter/i });
    // Le premier bouton d'achat de pack (après le bouton d'achat unitaire)
    if (packButtons.length > 1) {
      await user.click(packButtons[1]);
    }

    // Assert
    await waitFor(() => {
      expect(mockPurchasePack).toHaveBeenCalled();
    });
  });

  it('should validate quantity is greater than 0', async () => {
    // Arrange
    const user = userEvent.setup();

    (require('@/services/facturlyApi').usePurchaseCreditsMutation as jest.Mock).mockReturnValue([
      jest.fn(),
      { isLoading: false },
    ]);

    render(<CreditsPurchaseModal open={true} onOpenChange={jest.fn()} />);

    // Act
    const quantityInput = screen.getByLabelText(/quantité/i);
    await user.clear(quantityInput);
    await user.type(quantityInput, '0');

    const purchaseButton = screen.getByRole('button', { name: /acheter/i });
    await user.click(purchaseButton);

    // Assert
    await waitFor(() => {
      expect(require('sonner').toast.error).toHaveBeenCalled();
    });
  });

  it('should handle purchase error', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockPurchaseCredits = jest.fn().mockRejectedValue({
      data: { message: 'Erreur de paiement' },
    });

    (require('@/services/facturlyApi').usePurchaseCreditsMutation as jest.Mock).mockReturnValue([
      mockPurchaseCredits,
      { isLoading: false },
    ]);

    render(<CreditsPurchaseModal open={true} onOpenChange={jest.fn()} />);

    // Act
    const quantityInput = screen.getByLabelText(/quantité/i);
    await user.type(quantityInput, '5');

    const purchaseButton = screen.getByRole('button', { name: /acheter/i });
    await user.click(purchaseButton);

    // Assert
    await waitFor(() => {
      expect(require('sonner').toast.error).toHaveBeenCalled();
    });
  });

  it('should close modal when cancel is clicked', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockOnOpenChange = jest.fn();

    render(<CreditsPurchaseModal open={true} onOpenChange={mockOnOpenChange} />);

    // Act
    const cancelButton = screen.getByRole('button', { name: /annuler/i });
    await user.click(cancelButton);

    // Assert
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
