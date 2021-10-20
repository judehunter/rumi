import {createRumi} from '../src/createRumi';
import renderer from 'react-test-renderer';
import React from 'react';

describe('createRumi', () => {
  test('simple styles', () => {
    const {css} = createRumi({
      utils: {},
      media: {
        '@lg': '(min-width: 700px)',
      },
    });
    const cls1 = css({});
    const cls2 = css({
      '@lg': {
        'color': 'green',
        '& > *': {
          'color': 'red',
          '& > *': {
            'color': 'blue',
            '@lg': {
              color: 'green',
            },
          },
        },
      },
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
