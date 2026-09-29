import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  clamp,
  formatMoney,
  debounce,
  buildVariantUrl,
  getFocusableElements
} from '../src/theme-utils.js';

describe('clamp', () => {
  it('returns the value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('clamps to the lower bound', () => {
    expect(clamp(-3, 0, 10)).toBe(0);
  });

  it('clamps to the upper bound', () => {
    expect(clamp(42, 0, 10)).toBe(10);
  });
});

describe('formatMoney', () => {
  it('formats whole amounts with thousands separators', () => {
    expect(formatMoney(123456)).toBe('$1,234.56');
  });

  it('formats small amounts', () => {
    expect(formatMoney(500)).toBe('$5.00');
  });

  it('supports a custom currency symbol and precision', () => {
    expect(formatMoney(100000, { currencySymbol: '£', precision: 0 })).toBe('£1,000');
  });

  it('falls back to zero for non-numeric input', () => {
    expect(formatMoney('not-a-number')).toBe('$0.00');
  });

  it('handles negative amounts', () => {
    expect(formatMoney(-123456)).toBe('$-1,234.56');
  });

  it('does not add a separator below one thousand', () => {
    expect(formatMoney(12345)).toBe('$123.45');
  });
});

describe('debounce', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('invokes the function only once after the wait window', () => {
    const spy = vi.fn();
    const debounced = debounce(spy, 100);

    debounced();
    debounced();
    debounced();
    expect(spy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('passes the latest arguments through', () => {
    const spy = vi.fn();
    const debounced = debounce(spy, 50);

    debounced('a');
    debounced('b');
    vi.advanceTimersByTime(50);

    expect(spy).toHaveBeenCalledWith('b');
  });
});

describe('buildVariantUrl', () => {
  it('returns an empty string for a falsy base URL', () => {
    expect(buildVariantUrl('')).toBe('');
  });

  it('returns the base URL unchanged when no variant is provided', () => {
    expect(buildVariantUrl('/products/shirt')).toBe('/products/shirt');
  });

  it('appends the variant with a "?" when there is no query string', () => {
    expect(buildVariantUrl('/products/shirt', 42)).toBe('/products/shirt?variant=42');
  });

  it('appends the variant with an "&" when a query string already exists', () => {
    expect(buildVariantUrl('/products/shirt?ref=home', 42)).toBe('/products/shirt?ref=home&variant=42');
  });
});

describe('getFocusableElements', () => {
  it('returns an empty array for a missing container', () => {
    expect(getFocusableElements(null)).toEqual([]);
  });

  it('collects visible, enabled focusable descendants in DOM order', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <a href="#one">one</a>
      <button>two</button>
      <button disabled>skip</button>
      <input type="hidden" />
      <input type="text" />
      <div tabindex="-1">skip</div>
      <div tabindex="0" aria-hidden="true">skip</div>
      <div tabindex="0">last</div>
    `;

    const focusable = getFocusableElements(container);
    const labels = focusable.map((el) => el.textContent || el.tagName.toLowerCase());

    expect(focusable).toHaveLength(4);
    expect(labels[0]).toBe('one');
    expect(labels[focusable.length - 1]).toBe('last');
  });
});
