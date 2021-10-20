/** @jsx jsx */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {jsx, css} from './jsx-export';
import renderer from 'react-test-renderer';
import React from 'react';

describe('@jsx', () => {
  test('attaches classname', () => {
    const tree = renderer
      .create(
        <section
          css={{
            'color': 'red',
            
          }}
        />,
      )
      .toJSON();

    console.log(tree);
  });
});
