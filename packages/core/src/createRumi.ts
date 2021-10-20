import {stringify} from '@stitches/stringify';
import {toHash} from './hash';
import {all as mergeAll} from 'deepmerge';
import * as CSSType from 'csstype';

type CSSBaseStyles = Pick<CSSType.Properties, 'display' | 'color'>;

type Contains<T extends string> =
  | `${T}${string}`
  | `${string}${T}${string}`
  | `${string}${T}`;

type UtilFunction = (value: any) => Partial<CSSBaseStyles>;

type RumiTheme = any;

type Media = Record<string, string>;

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export type RumiConfig = {
  utils: Record<string, UtilFunction>;
  theme?: RumiTheme;
  media?: Media;
  prefix?: string;
};

type ID<T> = {[Prop in keyof T]: T[Prop]};

export const createRumi = <T extends RumiConfig>(cfg: T) => {
  type StylesObject = CSSBaseStyles & {
    [Prop in keyof T['media']]: StylesObject;
  } & {
    // eslint-disable-next-line @typescript-eslint/ban-types
    [K in Contains<'&'>]: StylesObject;
  };

  type ShortCircuitStyles =
    | null
    | undefined
    | boolean
    | number
    | string
    | DeepPartial<StylesObject>;

  type TOrArrayT<T> = T | T[];

  let stylesheet = {} as Record<string, any>;

  const getCssText = ({reset = true} = {}) => {
    const ret = Object.values(stylesheet).join('');
    if (reset) stylesheet = {};
    return ret;
  };

  const addToStylesheet = (hash: string, cssString: string) => {
    stylesheet[hash] = cssString;

    // do different things depending on the environment
    if (globalThis.document) {
      let styleTag = globalThis.document.head.querySelector('style[data-rumi]');
      if (styleTag == null) {
        styleTag = globalThis.document.createElement('style');
        styleTag.setAttribute('data-rumi', '');

        globalThis.document.head.appendChild(styleTag);
      }

      styleTag.appendChild(globalThis.document.createTextNode(cssString));
    }
  };

  const transformSpecialProperties = (styles: any) => {
    const newObj = {} as Record<string, any>;

    for (const key of Object.keys(styles)) {
      // console.log('key', key);

      // const foundUtilFunction = Object.entries(cfg.utils).find(
      //   ([k]) => k === key,
      // )?.[1];

      // if (foundUtilFunction) {
      //   newObj = {...newObj, ...foundUtilFunction(styles[key])};
      //   continue;
      // }

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

  const mergeStyles = (styles: any[]) => {
    return mergeAll(styles);
  };

  const css = (styles: TOrArrayT<ShortCircuitStyles>) => {
    const enabledStyles = (Array.isArray(styles) ? styles : [styles]).filter(
      (x) => x && x instanceof Object,
    );

    const transformedStyles = enabledStyles.map((x) =>
      transformSpecialProperties(x),
    );

    const mergedStyles = mergeStyles(transformedStyles);

    const className = `.${cfg.prefix ? cfg.prefix + '-' : ''}rumi-${toHash(
      mergedStyles,
    )}`;

    if (!Object.keys(stylesheet).includes(className)) {
      addToStylesheet(
        className,
        stringify({
          [className]: mergedStyles,
        }),
      );
    }

    const classNameGetter = () => {
      return className;
    };
    return classNameGetter;
  };

  return {css, getCssText};
};
