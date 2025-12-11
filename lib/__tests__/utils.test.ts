import { cn } from '../utils'

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    const result = cn('foo', 'bar')
    expect(result).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    const result = cn('foo', false && 'bar', 'baz')
    expect(result).toBe('foo baz')
  })

  it('should merge Tailwind classes correctly', () => {
    const result = cn('px-2 py-1', 'px-4')
    expect(result).toBe('py-1 px-4')
  })

  it('should handle empty strings', () => {
    const result = cn('foo', '', 'bar')
    expect(result).toBe('foo bar')
  })

  it('should handle undefined and null values', () => {
    const result = cn('foo', undefined, null, 'bar')
    expect(result).toBe('foo bar')
  })

  it('should handle arrays of classes', () => {
    const result = cn(['foo', 'bar'], 'baz')
    expect(result).toBe('foo bar baz')
  })

  it('should handle objects with conditional classes', () => {
    const result = cn({
      'foo': true,
      'bar': false,
      'baz': true,
    })
    expect(result).toBe('foo baz')
  })

  it('should handle complex combinations', () => {
    const result = cn(
      'base-class',
      {
        'conditional-class': true,
        'another-conditional': false,
      },
      'px-2',
      'px-4'
    )
    expect(result).toBe('base-class conditional-class px-4')
  })
})

