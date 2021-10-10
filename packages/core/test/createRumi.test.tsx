import {createRumi} from '../src/createRumi';
import renderer from 'react-test-renderer';
import React from 'react';

describe('createRumi', () => {
  test('simple styles', () => {
    const {css} = createRumi({
      utils: {},
    });
    const cls1 = css({
      bg: 'red',
    });
    const cls2 = css({
      bg: 'violet',
    });

    const tree = renderer
      .create(
        <>
          <div className={`${cls1()} ${cls2()}`} />
        </>,
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });
});
