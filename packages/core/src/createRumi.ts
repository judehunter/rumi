import {stringify} from '@stitches/stringify';
import {toHash} from './hash';

type CSSBaseStyles = {
  color: string;
  backgroundColor: string;
  display: 'block' | 'inline' | 'flex';
  justifyContent: any;
};

type UtilFunction = (value: any) => Partial<CSSBaseStyles>;

type RumiTheme = any;

type Media = Record<string, string>;

type RumiConfig = {
  utils: Record<string, UtilFunction>;
  theme?: RumiTheme;
  media?: Media;
  prefix?: string;
};

type ID<T> = {[Prop in keyof T]: T[Prop]};

let styleTag = '';

export const createRumi = <T extends RumiConfig>(cfg: T) => {
  type CSS1 = ID<
    CSSBaseStyles & {
      [Prop in keyof T['utils']]: Parameters<T['utils'][Prop]>[0];
    }
  >;
  type FinalCSS = ID<CSS1 & {[Prop in keyof T['media']]: Partial<CSS1>}>; // remove partial here and add deep partial elsewhere

  const stylesheet = {};

  const addToStylesheet = (hash: string, styleString: string) => {
    stylesheet[hash] = styleString;

    // do different things depending on the environment
    // for now, assume env=browser
    // const styleTag = document.head.querySelector('style[data-rumi]');
    if (styleTag !== null)
      styleTag += `
        ${styleString}
      `;
  };

  const transformSpecialProperties = (styles: any) => {
    let newObj = {};

    for (const key of Object.keys(styles)) {
      // console.log('key', key);

      const foundUtilFunction = Object.entries(cfg.utils).find(
        ([k]) => k === key,
      )?.[1];

      if (foundUtilFunction) {
        newObj = {...newObj, ...foundUtilFunction(styles[key])};
        continue;
      }

      let foundAtRule = Object.entries(cfg.media ?? {}).find(
        ([k]) => k === key,
      )?.[1];

      if (foundAtRule) {
        foundAtRule = `@media ${foundAtRule}`;
        newObj[foundAtRule] = styles[key];
        if (newObj[foundAtRule] instanceof Object) {
          newObj[foundAtRule] = transformSpecialProperties(newObj[foundAtRule]);
        }
        continue;
      }

      if (styles[key] instanceof Object) {
        newObj[key] = transformSpecialProperties(styles[key]);

        continue;
      }

      newObj[key] = styles[key];
    }

    return newObj;
  };

  const css = (styles: Partial<FinalCSS>) => {
    const className = `.${cfg.prefix ? cfg.prefix + '-' : ''}rumi-${toHash(
      styles,
    )}`;
    if (!Object.keys(stylesheet).includes(className)) {
      addToStylesheet(
        className,
        stringify({
          [className]: transformSpecialProperties(styles),
        }),
      );
    }

    const classNameGetter = () => {
      return className;
    };
    return classNameGetter;
  };

  return {css};
};

const {css} = createRumi({
  utils: {
    f: (value: {justify: 'center' | 'start'}) => ({
      display: 'flex',
      justifyContent: value.justify,
    }),
  },
  media: {
    '@bp1': '(min-width: 500px)',
  },
});

const button = css({
  'color': 'red',
  'f': {justify: 'center'},
  '@bp1': {
    f: {
      justify: 'start',
    },
  },
});
