/* eslint-disable @typescript-eslint/camelcase */
import keysToCamel from '../keysToCamel';

test('should change object keys to camel', () => {
  const testObject = {
    key_one: 'key_one',
    key_two: ['key-two'],
    key_three: [
      {
        key_three_one: 'key_three_one',
      },
    ],
    key_four: {
      key_four_one: 'key_four_one',
    },
  };

  expect(keysToCamel(testObject)).toEqual({
    keyOne: 'key_one',
    keyTwo: ['key-two'],
    keyThree: [
      {
        keyThreeOne: 'key_three_one',
      },
    ],
    keyFour: {
      keyFourOne: 'key_four_one',
    },
  });
});
