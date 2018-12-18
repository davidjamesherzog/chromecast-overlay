/**
 * Whether the value is a `Number`.
 *
 * Both `Infinity` and `-Infinity` are accepted, but `NaN` is not.
 *
 * @param  {Number} n
 * @return {Boolean}
 */
export function isNumber(n) {
  return typeof n === 'number' && n === n;
}

/**
 * Whether a value is a string with no whitespace.
 *
 * @param  {string} s
 * @return {boolean}
 */
export function hasNoWhitespace(s) {
  return typeof s === 'string' && (/^\S+$/).test(s);
}
