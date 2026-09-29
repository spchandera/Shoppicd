/**
 * Shared, framework-free helpers for the Shoppicd theme.
 *
 * These are pure (or DOM-only) functions extracted so they can be unit tested
 * and reused, rather than re-implemented inline across the theme's components.
 * They are authored as ES modules purely for tooling (tests + coverage); the
 * storefront continues to load the compiled assets in `assets/`.
 */

/**
 * Clamp a number to an inclusive range.
 * @param {number} value - Value to clamp.
 * @param {number} min - Lower bound.
 * @param {number} max - Upper bound.
 * @returns {number} The clamped value.
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Format an amount given in the currency's smallest unit (e.g. cents) as a
 * money string, mirroring Shopify's default `amount` behaviour.
 * @param {number} cents - Amount in the smallest currency unit.
 * @param {object} [options] - Formatting options.
 * @param {string} [options.currencySymbol='$'] - Leading currency symbol.
 * @param {number} [options.precision=2] - Number of decimal places.
 * @returns {string} The formatted money string.
 */
/**
 * Insert comma thousands separators into a string of digits (with optional
 * leading minus sign). Uses a linear scan rather than a regular expression.
 * @param {string} whole - The integer part as a string.
 * @returns {string} The value with thousands separators.
 */
function addThousandsSeparators(whole) {
  const negative = whole.startsWith('-');
  const digits = negative ? whole.slice(1) : whole;
  let result = '';

  for (let i = 0; i < digits.length; i += 1) {
    if (i > 0 && (digits.length - i) % 3 === 0) result += ',';
    result += digits[i];
  }

  return negative ? `-${result}` : result;
}

export function formatMoney(cents, { currencySymbol = '$', precision = 2 } = {}) {
  const amount = Number(cents);
  if (Number.isNaN(amount)) return `${currencySymbol}0.00`;

  const value = (amount / 100).toFixed(precision);
  const [whole, fraction] = value.split('.');
  const withThousands = addThousandsSeparators(whole);

  return fraction ? `${currencySymbol}${withThousands}.${fraction}` : `${currencySymbol}${withThousands}`;
}

/**
 * Create a debounced version of a function that delays invoking `fn` until
 * `wait` ms have elapsed since the last call.
 * @param {Function} fn - Function to debounce.
 * @param {number} [wait=0] - Delay in milliseconds.
 * @returns {Function} The debounced function.
 */
export function debounce(fn, wait = 0) {
  let timer = null;
  return function debounced(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn.apply(this, args);
    }, wait);
  };
}

/**
 * Build a Shopify product URL with an optional variant query parameter.
 * @param {string} baseUrl - The product URL.
 * @param {number|string|null} [variantId] - Variant id to append.
 * @returns {string} The URL, with `?variant=` appended when an id is provided.
 */
export function buildVariantUrl(baseUrl, variantId = null) {
  if (!baseUrl) return '';
  if (variantId === null || variantId === undefined || variantId === '') return baseUrl;

  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}variant=${variantId}`;
}

/**
 * Return the visible, keyboard-focusable descendants of a container, in DOM
 * order. Used by focus-trap logic.
 * @param {Element} container - The container element to search within.
 * @returns {Element[]} Focusable elements.
 */
export function getFocusableElements(container) {
  if (!container) return [];

  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  return Array.from(container.querySelectorAll(selector)).filter(
    (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true'
  );
}
