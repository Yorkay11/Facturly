import { renderHook, act } from '@testing-library/react'
import { useIsMobile } from '../use-mobile'

describe('useIsMobile', () => {
  beforeEach(() => {
    // Reset window.innerWidth before each test
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
  })

  it('should return false for desktop width initially', () => {
    window.innerWidth = 1024
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it('should return true for mobile width initially', () => {
    window.innerWidth = 500
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it('should return false when width is exactly at breakpoint', () => {
    window.innerWidth = 768
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it('should return true when width is just below breakpoint', () => {
    window.innerWidth = 767
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it('should update when window is resized to mobile', () => {
    window.innerWidth = 1024
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)

    act(() => {
      window.innerWidth = 500
      window.dispatchEvent(new Event('resize'))
    })

    expect(result.current).toBe(true)
  })

  it('should update when window is resized to desktop', () => {
    window.innerWidth = 500
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)

    act(() => {
      window.innerWidth = 1024
      window.dispatchEvent(new Event('resize'))
    })

    expect(result.current).toBe(false)
  })

  it('should clean up event listener on unmount', () => {
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener')
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() => useIsMobile())

    expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))

    addEventListenerSpy.mockRestore()
    removeEventListenerSpy.mockRestore()
  })
})

