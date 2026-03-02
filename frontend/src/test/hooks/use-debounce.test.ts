import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/hooks/use-debounce';

describe('useDebounce', () => {
  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 500));
    expect(result.current).toBe('hello');
  });

  it('updates the debounced value after delay', async () => {
    let value = 'initial';
    const { result, rerender } = renderHook(() => useDebounce(value, 100));

    expect(result.current).toBe('initial');

    value = 'updated';
    rerender();

    // Value should not change immediately
    expect(result.current).toBe('initial');

    // Wait for debounce
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
    });

    expect(result.current).toBe('updated');
  });

  it('cancels previous timeout on rapid changes', async () => {
    let value = 'first';
    const { result, rerender } = renderHook(() => useDebounce(value, 100));

    value = 'second';
    rerender();

    value = 'third';
    rerender();

    // Wait for debounce
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
    });

    // Should only have the last value
    expect(result.current).toBe('third');
  });
});
