export function isNumber(n) {
  return typeof n === 'number' && n === n;
}

export function hasNoWhitespace(s) {
  return typeof s === 'string' && (/^\S+$/).test(s);
}
