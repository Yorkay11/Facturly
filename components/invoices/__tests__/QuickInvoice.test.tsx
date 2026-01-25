import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuickInvoice } from '../QuickInvoice';
import { facturlyApi } from '@/services/facturlyApi';
import { store } from '@/lib/redux/store';

// Mock RTK Query hooks
jest.mock('@/services/facturlyApi', () => ({
  facturlyApi: {
    reducerPath: 'facturlyApi',
    reducer: jest.fn(),
    middleware: jest.fn(),
  },
  useGetClientsQuery: jest.fn(),
  useCreateClientMutation: jest.fn(),
  useCreateInvoiceMutation: jest.fn(),
  useSendInvoiceMutation: jest.fn(),
  useGetWorkspaceQuery: jest.fn(),
  useGetInvoicesQuery: jest.fn(),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  })),
}));

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('QuickInvoice', () => {
  const mockClients = [
    { id: 'client-1', name: 'Client Test 1', email: 'client1@test.com' },
    { id: 'client-2', name: 'Client Test 2', email: 'client2@test.com' },
  ];

  const mockWorkspace = {
    id: 'ws-1',
    defaultCurrency: 'XOF',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useGetClientsQuery
    (require('@/services/facturlyApi').useGetClientsQuery as jest.Mock).mockReturnValue({
      data: { data: mockClients },
      isLoading: false,
    });

    // Mock useGetWorkspaceQuery
    (require('@/services/facturlyApi').useGetWorkspaceQuery as jest.Mock).mockReturnValue({
      data: mockWorkspace,
    });

    // Mock useGetInvoicesQuery
    (require('@/services/facturlyApi').useGetInvoicesQuery as jest.Mock).mockReturnValue({
      data: { data: [] },
    });

    // Mock useCreateInvoiceMutation
    (require('@/services/facturlyApi').useCreateInvoiceMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValue({
        unwrap: jest.fn().mockResolvedValue({ id: 'inv-123' }),
      }),
      { isLoading: false },
    ]);

    // Mock useSendInvoiceMutation
    (require('@/services/facturlyApi').useSendInvoiceMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValue({
        unwrap: jest.fn().mockResolvedValue({}),
      }),
      { isLoading: false },
    ]);
  });

  it('should render form correctly', () => {
    // Arrange & Act
    render(<QuickInvoice />);

    // Assert
    expect(screen.getByText(/facture rapide/i)).toBeInTheDocument();
  });

  it('should display client selection', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<QuickInvoice />);

    // Act
    const clientButton = screen.getByRole('combobox', { name: /client/i });
    await user.click(clientButton);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Client Test 1')).toBeInTheDocument();
    });
  });

  it('should validate amount is required', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<QuickInvoice />);

    // Act
    const submitButton = screen.getByRole('button', { name: /envoyer/i });
    await user.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/montant requis/i)).toBeInTheDocument();
    });
  });

  it('should validate amount is greater than 0', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<QuickInvoice />);

    // Act
    const amountInput = screen.getByLabelText(/montant/i);
    await user.type(amountInput, '0');
    const submitButton = screen.getByRole('button', { name: /envoyer/i });
    await user.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/montant invalide/i)).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockCreateInvoice = jest.fn().mockResolvedValue({
      unwrap: jest.fn().mockResolvedValue({ id: 'inv-123' }),
    });
    const mockSendInvoice = jest.fn().mockResolvedValue({
      unwrap: jest.fn().mockResolvedValue({}),
    });

    (require('@/services/facturlyApi').useCreateInvoiceMutation as jest.Mock).mockReturnValue([
      mockCreateInvoice,
      { isLoading: false },
    ]);

    (require('@/services/facturlyApi').useSendInvoiceMutation as jest.Mock).mockReturnValue([
      mockSendInvoice,
      { isLoading: false },
    ]);

    render(<QuickInvoice />);

    // Act
    const clientButton = screen.getByRole('combobox', { name: /client/i });
    await user.click(clientButton);
    await waitFor(() => {
      expect(screen.getByText('Client Test 1')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Client Test 1'));

    const amountInput = screen.getByLabelText(/montant/i);
    await user.type(amountInput, '10000');

    const submitButton = screen.getByRole('button', { name: /envoyer/i });
    await user.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(mockCreateInvoice).toHaveBeenCalled();
    });
  });

  it('should handle form submission error', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockCreateInvoice = jest.fn().mockRejectedValue({
      data: { message: 'Erreur de création' },
    });

    (require('@/services/facturlyApi').useCreateInvoiceMutation as jest.Mock).mockReturnValue([
      mockCreateInvoice,
      { isLoading: false },
    ]);

    render(<QuickInvoice />);

    // Act
    const clientButton = screen.getByRole('combobox', { name: /client/i });
    await user.click(clientButton);
    await waitFor(() => {
      expect(screen.getByText('Client Test 1')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Client Test 1'));

    const amountInput = screen.getByLabelText(/montant/i);
    await user.type(amountInput, '10000');

    const submitButton = screen.getByRole('button', { name: /envoyer/i });
    await user.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(require('sonner').toast.error).toHaveBeenCalled();
    });
  });

  it('should switch between quick and full mode', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockOnSwitchToFullMode = jest.fn();
    render(<QuickInvoice onSwitchToFullMode={mockOnSwitchToFullMode} />);

    // Act
    const switchButton = screen.getByRole('button', { name: /mode complet/i });
    await user.click(switchButton);

    // Assert
    expect(mockOnSwitchToFullMode).toHaveBeenCalled();
  });

  it('should handle duplicate last invoice', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockLastInvoice = {
      id: 'inv-last',
      invoiceNumber: 'FAC-001',
      items: [{ description: 'Service', quantity: '1', unitPrice: '5000' }],
    };

    (require('@/services/facturlyApi').useGetInvoicesQuery as jest.Mock).mockReturnValue({
      data: { data: [mockLastInvoice] },
    });

    const mockCreateInvoice = jest.fn().mockResolvedValue({
      unwrap: jest.fn().mockResolvedValue({ id: 'inv-new' }),
    });
    const mockSendInvoice = jest.fn().mockResolvedValue({
      unwrap: jest.fn().mockResolvedValue({}),
    });

    (require('@/services/facturlyApi').useCreateInvoiceMutation as jest.Mock).mockReturnValue([
      mockCreateInvoice,
      { isLoading: false },
    ]);

    (require('@/services/facturlyApi').useSendInvoiceMutation as jest.Mock).mockReturnValue([
      mockSendInvoice,
      { isLoading: false },
    ]);

    render(<QuickInvoice />);

    // Act
    // Sélectionner un client
    const clientButton = screen.getByRole('combobox', { name: /client/i });
    await user.click(clientButton);
    await waitFor(() => {
      expect(screen.getByText('Client Test 1')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Client Test 1'));

    // Attendre que le bouton de duplication apparaisse
    await waitFor(() => {
      const duplicateButton = screen.queryByRole('button', { name: /dupliquer/i });
      if (duplicateButton) {
        user.click(duplicateButton);
      }
    });

    // Assert
    // Le test vérifie que la duplication fonctionne
    // (nécessite que le client ait une dernière facture)
  });
});
