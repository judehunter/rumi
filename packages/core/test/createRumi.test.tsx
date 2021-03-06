import renderer from 'react-test-renderer';
import React from 'react';
import {flushCache, createRumi} from '../src/index';
import {cache} from '../src/stylesheet';

describe('createRumi', () => {
  test('one class', () => {
    const {css, getCssText} = createRumi({});
    getCssText();

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
    const {css, getCssText} = createRumi({
      utils: {},
    });
    getCssText();

    const cls1 = css({
      color: 'red',
    });
    const cls2 = css({
      backgroundColor: 'red',
    });

    expect(cls1()).not.toEqual(cls2());
  });

  test('atomic and whole classes', () => {
    const {css, getCssText} = createRumi({});
    getCssText();

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

  test.skip('force whole classes', () => {
    const {css, getCssText} = createRumi({});
    getCssText();

    const cls1 = css({
      backgroundColor: 'yellow',
      color: 'red',
      '&': {
        color: 'blue',
      },
      '&:hover': {
        color: 'blue',
      },
    });

    expect((cls1.styles as any).color).toEqual('blue');
    expect(cls1().split(' ').length).toEqual(2);
  });

  test('composition', () => {
    const {css, media, getCssText} = createRumi({
      media: {
        lg: '(min-width: 1000px)',
        md: '(min-width: 600px)',
      } as const,
    });
    getCssText();

    const cls1 = css({
      color: 'red',
    });
    const cls2 = css([
      cls1,
      {
        backgroundColor: 'blue',
        '&:hover': cls1,
        [media.lg]: cls1,
        [media.md]: css.virtual([
          cls1,
          {
            backgroundColor: 'yellow',
          },
        ]),
      },
    ]);

    expect(cls2.styles).toEqual({
      color: 'red',
      backgroundColor: 'blue',
      '&:hover': {
        color: 'red',
      },
      '@media (min-width: 1000px)': {
        color: 'red',
      },
      '@media (min-width: 600px)': {
        color: 'red',
        backgroundColor: 'yellow',
      },
    });
  });

  test('virtual styles', () => {
    const {css, getCssText} = createRumi({});
    getCssText();

    const cls1 = css.virtual({
      color: 'red',
    });
    expect(getCssText({reset: false})).toEqual('');
    css(cls1);
    expect(getCssText()).not.toEqual('');
  });

  test('deep merging of styles', () => {
    const {css, getCssText} = createRumi({});
    getCssText();

    const cls1 = css.virtual({
      color: 'red',
      '&:hover': {
        color: 'blue',
      },
    });
    const cls2 = css([
      cls1,
      {
        color: 'yellow',
        '&:hover': {
          backgroundColor: 'green',
        },
      },
    ]);

    expect(cls2.styles).toEqual({
      color: 'yellow',
      '&:hover': {
        color: 'blue',
        backgroundColor: 'green',
      },
    });
  });

  test('utils', () => {
    const {css, getCssText} = createRumi({
      utils: {
        px: (v: string | number) => ({
          paddingLeft: v,
          paddingRight: v,
        }),
      },
    });
    getCssText();

    const cls1 = css({
      px: '10px',
      '&:hover': {
        px: 20,
      },
    });

    expect(cls1.styles as any).toEqual({
      paddingLeft: '10px',
      paddingRight: '10px',
      '&:hover': {
        paddingLeft: 20,
        paddingRight: 20,
      },
    });
  });

  test.skip('cache', () => {
    const {css, getCssText} = createRumi({});
    flushCache();
    getCssText();

    const cls1 = css({
      color: 'red',
    });

    expect(cache).toHaveProperty('.' + cls1());

    flushCache();

    expect(cache).toEqual({});

    css.virtual({
      color: 'red',
    });

    expect(cache).toHaveProperty('.' + cls1());
  });

  test('advanced composition and fallbacks', () => {
    const {css, getCssText} = createRumi({});
    getCssText();

    const colorRed = css.virtual({
      color: ['red', '#ff0000', '#ff0000ff'],
    });

    const cls1 = css([
      colorRed,
      {
        '& > *': {
          color: 'pink',
        },
      },
    ]);

    const cls2 = css({
      '&:hover': [
        cls1,
        {
          '& > *': {
            backgroundColor: 'green',
          },
        },
      ],
    });

    expect(cls2.styles).toEqual({
      '&:hover': {
        color: ['red', '#ff0000', '#ff0000ff'],
        '& > *': {
          color: 'pink',
          backgroundColor: 'green',
        },
      },
    });

    expect(getCssText()).toMatchInlineSnapshot(
      `".rumi-jPBIFL{color:red;color:#ff0000;color:#ff0000ff;}.rumi-kLRtZQ > *{color:pink;}.rumi-gwqVvC:hover{color:red;color:#ff0000;color:#ff0000ff;}.rumi-gwqVvC:hover > *{color:pink;background-color:green;}"`,
    );
  });

  test('target a rumi component', () => {
    const {css, getCssText} = createRumi({});
    getCssText();

    const cls1 = css({
      color: 'red',
    });

    const cls2 = css({
      [`& .${cls1}`]: {
        color: 'pink',
      },
    });

    expect(cls2.styles).toEqual({
      [`& .${cls1()}`]: {
        color: 'pink',
      },
    });

    expect(getCssText()).toMatchInlineSnapshot(
      `".rumi-gmqXFB{color:red;}.rumi-dDoUWf .rumi-gmqXFB{color:pink;}"`,
    );
  });
});
