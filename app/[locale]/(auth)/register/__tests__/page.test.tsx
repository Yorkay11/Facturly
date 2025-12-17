import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import RegisterPage from '../page'
import { useRegisterMutation } from '@/services/facturlyApi'

// Mock des dépendances
const mockPush = jest.fn()
const mockRegister = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

jest.mock('@/services/facturlyApi', () => ({
  useRegisterMutation: jest.fn(),
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    const { priority, ...restProps } = props
    return <img {...restProps} />
  },
}))

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
    ;(useRegisterMutation as jest.Mock).mockReturnValue([
      mockRegister,
      {
        isLoading: false,
        isSuccess: false,
        isError: false,
        error: null,
        data: null,
      },
    ])
  })

  it('should render the register form', () => {
    render(<RegisterPage />)
    
    expect(screen.getByText('Créer un compte Facturly')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /prénom/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /^nom$/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /adresse email/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /nom de l'entreprise/i })).toBeInTheDocument()
  })

  it('should show validation errors for empty fields', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)

    const nextButton = screen.getByRole('button', { name: /suivant/i })
    await user.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText(/le prénom doit contenir au moins 2 caractères/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should navigate to step 2 when step 1 fields are valid', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)

    // Remplir tous les champs de l'étape 1
    await user.type(screen.getByRole('textbox', { name: /prénom/i }), 'John')
    await user.type(screen.getByRole('textbox', { name: /^nom$/i }), 'Doe')
    await user.type(screen.getByRole('textbox', { name: /adresse email/i }), 'john@example.com')
    await user.type(screen.getByRole('textbox', { name: /nom de l'entreprise/i }), 'Test Company')

    const nextButton = screen.getByRole('button', { name: /suivant/i })
    await user.click(nextButton)

    // Attendre que l'étape 2 soit affichée - utiliser getByPlaceholderText ou getByRole avec type password
    await waitFor(() => {
      // Vérifier que les champs de mot de passe sont présents en utilisant leur placeholder ou leur type
      const passwordInputs = screen.getAllByPlaceholderText('••••••••')
      expect(passwordInputs.length).toBeGreaterThanOrEqual(2)
    }, { timeout: 5000 })
  })

  it('should show password validation error for short password', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)

    // Remplir l'étape 1
    await user.type(screen.getByRole('textbox', { name: /prénom/i }), 'John')
    await user.type(screen.getByRole('textbox', { name: /^nom$/i }), 'Doe')
    await user.type(screen.getByRole('textbox', { name: /adresse email/i }), 'john@example.com')
    await user.type(screen.getByRole('textbox', { name: /nom de l'entreprise/i }), 'Test Company')
    await user.click(screen.getByRole('button', { name: /suivant/i }))

    // Remplir l'étape 2 avec un mot de passe trop court
    await waitFor(() => {
      expect(screen.getByLabelText(/^mot de passe$/i)).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText(/^mot de passe$/i), 'short')
    await user.type(screen.getByLabelText(/confirmer le mot de passe/i), 'short')

    const submitButton = screen.getByRole('button', { name: /créer mon compte/i })
    await user.click(submitButton)

    await waitFor(() => {
      // Utiliser getAllByText et vérifier qu'au moins un message d'erreur est présent
      const errorMessages = screen.getAllByText(/le mot de passe doit contenir au moins 8 caractères/i)
      expect(errorMessages.length).toBeGreaterThan(0)
      // Vérifier qu'au moins un message d'erreur a la classe destructive
      const destructiveError = errorMessages.find(msg => 
        msg.className.includes('text-destructive')
      )
      expect(destructiveError).toBeInTheDocument()
    })
  })

  it('should show error when passwords do not match', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)

    // Remplir l'étape 1
    await user.type(screen.getByRole('textbox', { name: /prénom/i }), 'John')
    await user.type(screen.getByRole('textbox', { name: /^nom$/i }), 'Doe')
    await user.type(screen.getByRole('textbox', { name: /adresse email/i }), 'john@example.com')
    await user.type(screen.getByRole('textbox', { name: /nom de l'entreprise/i }), 'Test Company')
    await user.click(screen.getByRole('button', { name: /suivant/i }))

    // Remplir l'étape 2 avec des mots de passe différents
    await waitFor(() => {
      expect(screen.getByLabelText(/^mot de passe$/i)).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText(/^mot de passe$/i), 'password123')
    await user.type(screen.getByLabelText(/confirmer le mot de passe/i), 'password456')

    const submitButton = screen.getByRole('button', { name: /créer mon compte/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/les mots de passe ne correspondent pas/i)).toBeInTheDocument()
    })
  })

  it('should call register mutation with correct data on successful submission', async () => {
    const user = userEvent.setup()
    mockRegister.mockResolvedValue({
      data: {
        accessToken: 'test-token',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      },
    })

    ;(useRegisterMutation as jest.Mock).mockReturnValue([
      mockRegister,
      {
        isLoading: false,
        isSuccess: true,
        isError: false,
        error: null,
        data: {
          accessToken: 'test-token',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        },
      },
    ])

    render(<RegisterPage />)

    // Remplir l'étape 1
    await user.type(screen.getByRole('textbox', { name: /prénom/i }), 'John')
    await user.type(screen.getByRole('textbox', { name: /^nom$/i }), 'Doe')
    await user.type(screen.getByRole('textbox', { name: /adresse email/i }), 'john@example.com')
    await user.type(screen.getByRole('textbox', { name: /nom de l'entreprise/i }), 'Test Company')
    await user.click(screen.getByRole('button', { name: /suivant/i }))

    // Remplir l'étape 2
    await waitFor(() => {
      expect(screen.getByLabelText(/^mot de passe$/i)).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText(/^mot de passe$/i), 'password123')
    await user.type(screen.getByLabelText(/confirmer le mot de passe/i), 'password123')

    const submitButton = screen.getByRole('button', { name: /créer mon compte/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: 'john@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        companyName: 'Test Company',
      })
    })
  })

  it('should toggle password visibility', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)

    // Aller à l'étape 2
    await user.type(screen.getByRole('textbox', { name: /prénom/i }), 'John')
    await user.type(screen.getByRole('textbox', { name: /^nom$/i }), 'Doe')
    await user.type(screen.getByRole('textbox', { name: /adresse email/i }), 'john@example.com')
    await user.type(screen.getByRole('textbox', { name: /nom de l'entreprise/i }), 'Test Company')
    await user.click(screen.getByRole('button', { name: /suivant/i }))

    await waitFor(() => {
      expect(screen.getByLabelText(/^mot de passe$/i)).toBeInTheDocument()
    })

    const passwordInput = screen.getByLabelText(/^mot de passe$/i) as HTMLInputElement
    const toggleButton = screen.getByLabelText(/afficher le mot de passe/i)

    expect(passwordInput.type).toBe('password')

    await user.click(toggleButton)

    await waitFor(() => {
      expect(passwordInput.type).toBe('text')
    })
  })

  it('should navigate back to step 1 when clicking previous', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)

    // Aller à l'étape 2
    await user.type(screen.getByRole('textbox', { name: /prénom/i }), 'John')
    await user.type(screen.getByRole('textbox', { name: /^nom$/i }), 'Doe')
    await user.type(screen.getByRole('textbox', { name: /adresse email/i }), 'john@example.com')
    await user.type(screen.getByRole('textbox', { name: /nom de l'entreprise/i }), 'Test Company')
    await user.click(screen.getByRole('button', { name: /suivant/i }))

    await waitFor(() => {
      expect(screen.getByLabelText(/^mot de passe$/i)).toBeInTheDocument()
    })

    // Cliquer sur précédent
    const previousButton = screen.getByRole('button', { name: /précédent/i })
    await user.click(previousButton)

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /prénom/i })).toBeInTheDocument()
      expect(screen.queryByLabelText(/^mot de passe$/i)).not.toBeInTheDocument()
    })
  })
})

