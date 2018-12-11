import {isNumber, hasNoWhitespace} from './utils';

describe('utils', () => {


  describe('isNumber', () => {

    test('should be a number', () => {
      expect(isNumber(5)).toBeTruthy();
    });

    const invalidNumbers = ['abc', undefined, null, false, {}];
    invalidNumbers.forEach(number => {
      test(`should not be a number when (${number}) is passed`, () => {
        expect(isNumber(number)).toBeFalsy();
      });
    });

  });

  describe('hasNoWhitespace', () => {

    test('should be a string', () => {
      expect(hasNoWhitespace('abc')).toBeTruthy();
    });

    const invalidStrings = [5, 'white space', undefined, null, false, {}];
    invalidStrings.forEach(value => {
      test(`should not be a string when (${value}) is passed`, () => {
        expect(hasNoWhitespace(value)).toBeFalsy();
      });
    });

  });


});
