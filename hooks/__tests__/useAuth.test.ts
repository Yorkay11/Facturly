import { renderHook, waitFor } from '@testing-library/react'
import { useAuth } from '../useAuth'
import { useGetMeQuery } from '@/services/facturlyApi'

// Mock des dépendances
jest.mock('@/services/facturlyApi')

const mockUseGetMeQuery = useGetMeQuery as jest.MockedFunction<typeof useGetMeQuery>

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock document.cookie
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    })
  })

  it('should return not authenticated when no token exists', () => {
    document.cookie = ''
    mockUseGetMeQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: undefined,
    } as any)

    const { result } = renderHook(() => useAuth())

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.hasToken).toBe(false)
    expect(result.current.user).toBeUndefined()
  })

  it('should return authenticated when token exists and user data is available', () => {
    document.cookie = 'facturly_access_token=test-token'
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    }

    mockUseGetMeQuery.mockReturnValue({
      data: mockUser,
      isLoading: false,
      error: undefined,
    } as any)

    const { result } = renderHook(() => useAuth())

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.hasToken).toBe(true)
    expect(result.current.user).toEqual(mockUser)
  })

  it('should return not authenticated when token exists but API returns error', () => {
    document.cookie = 'facturly_access_token=test-token'
    mockUseGetMeQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { status: 401, data: 'Unauthorized' },
    } as any)

    const { result } = renderHook(() => useAuth())

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.hasToken).toBe(true)
    expect(result.current.user).toBeUndefined()
  })

  it('should return not authenticated while loading', () => {
    document.cookie = 'facturly_access_token=test-token'
    mockUseGetMeQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: undefined,
    } as any)

    const { result } = renderHook(() => useAuth())

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isLoading).toBe(true)
  })

  it('should skip API call when no token exists', () => {
    document.cookie = ''
    mockUseGetMeQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: undefined,
    } as any)

    renderHook(() => useAuth())

    expect(mockUseGetMeQuery).toHaveBeenCalledWith(undefined, {
      skip: true,
    })
  })

  it('should make API call when token exists', () => {
    document.cookie = 'facturly_access_token=test-token'
    mockUseGetMeQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: undefined,
    } as any)

    renderHook(() => useAuth())

    expect(mockUseGetMeQuery).toHaveBeenCalledWith(undefined, {
      skip: false,
    })
  })
})

