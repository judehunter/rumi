import {createRumi} from '../src/createRumi';

describe('createRumi', () => {
  test('simple styles', () => {
    const {css} = createRumi({
      utils: {
        bg: (val) => ({backgroundColor: val}),
      },
    });

    expect(true).toBeTruthy();
  });
});
