import {createRumi} from '../src/createRumi';
import renderer from 'react-test-renderer';
import React from 'react';

describe('createRumi', () => {
  test('one class', () => {
    const {css} = createRumi({
      utils: {},
    });
    const cls1 = css({
      color: 'red',
    });
    const cls2 = css({
      color: 'red',
    });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const tree = renderer
      .create(
        <>
          <div className={`${cls1()}`} />
          <div className={`${cls2()}`} />
        </>,
      )
      .toJSON()!;

    expect(cls1()).toEqual(cls2());
    expect(cls1().split(' ').length).toEqual(1);
    expect(tree).toMatchSnapshot();
  });

  test('atomic classes use rule name for hash', () => {
    const {css} = createRumi({
      utils: {},
    });

    const cls1 = css({
      color: 'red',
    });
    const cls2 = css({
      backgroundColor: 'red',
    });

    expect(cls1()).not.toEqual(cls2());
  });

  test('atomic and whole classes', () => {
    const {css} = createRumi({
      utils: {},
    });
    const cls1 = css({
      color: 'red',
      display: 'flex',
      '&:hover': {
        color: 'blue',
        display: 'block',
      },
      '&:focus': {
        color: 'violet',
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const tree = renderer.create(<div className={`${cls1()}`} />).toJSON()!;

    expect(cls1().split(' ').length).toEqual(3);
    expect(tree).toMatchSnapshot();
  });

  test('composition', () => {
    const {css} = createRumi({
      utils: {},
    });
    const cls1 = css({
      color: 'red',
      display: 'flex',
      '&:hover': {
        color: 'blue',
        display: 'block',
      },
      '&:focus': {
        color: 'violet',
      },
    });
  });
});
