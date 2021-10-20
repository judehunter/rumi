import {stringify} from '@stitches/stringify';
import {toHash} from './hash';
import {all as mergeAll} from 'deepmerge';
import * as CSSType from 'csstype';
import {
  addToStylesheet,
  getStylesheetCSSText,
  isInStylesheet,
} from './stylesheet';

// type CSSBaseStyles = Pick<
//   CSSType.Properties,
//   'display' | 'color' | 'backgroundColor'
// >;
type CSSBaseStyles = CSSType.Properties;
type CSSPseudos = CSSType.Pseudos extends infer R
  ? R extends string
    ? `&${R}`
    : never
  : never;
type CSSNested = CSSPseudos | `& *` | '& > *' | '& + *' | `& ~ *`;

type Contains<T extends string> = `${string}${T}${string}`;

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

type RumiClassNames = string & {__rumi_brand__: true};

export const createRumi = <T extends RumiConfig>(cfg: T) => {
  type StylesObject =
    | (Partial<CSSBaseStyles> & {
        [Prop in keyof T['media']]?: StylesObject;
      } & {
        [Prop in keyof T['utils']]?: Parameters<T['utils'][Prop]>[0];
      } & {
        [K in Contains<'&'>]?: StylesObject;
      } & {
        [K in CSSNested]?: StylesObject;
      })
    | {styles: StylesObject};

  type ShortCircuitStyles =
    | null
    | undefined
    | boolean
    | number
    | string
    | StylesObject;

  type TOrArrayT<T> = T | T[];

  const getCssText = getStylesheetCSSText;

  const transformSpecialProperties = (styles: any) => {
    let newObj = {} as Record<string, any>;

    // composition
    if (styles.styles) return styles.styles;

    // TODO:
    // if (styles['&']) {
    //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
    //   const {'&': amp, ...rest} = styles;
    //   styles = {...rest, ...styles['&']};
    // }

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

  const mergeStyles = (styles: any[]) => {
    return mergeAll(styles);
  };

  const generateClassNames = (styles: any) => {
    const classes = {} as Record<string, string>;

    // an object which is a subobject of styles, without the atomic styles
    const whole = {} as any;
    for (const [k, v] of Object.entries(styles)) {
      // figure out if it's a special property or regular css
      if (
        ~k.indexOf('&') ||
        Object.entries(cfg.media ?? {}).find(([k2]) => k === k2)
      ) {
        // preserve whole styles
        whole[k] = v;
      } else {
        // break up into atomic styles
        // and stringify into distinct classes
        const atomicStyle = {
          [k]: v,
        };

        const className = `.${cfg.prefix ? cfg.prefix + '-' : ''}rumi-${toHash(
          atomicStyle,
        )}`;
        classes[className] = stringify({[className]: atomicStyle});
      }
    }

    // stringify whole styles as one
    if (Object.keys(whole).length) {
      const className = `.${cfg.prefix ? cfg.prefix + '-' : ''}rumi-${toHash(
        whole,
      )}`;
      classes[className] = stringify({[className]: whole});
    }

    return classes;
  };

  const _css = (styles: TOrArrayT<ShortCircuitStyles>, virtual: boolean) => {
    const enabledStyles = (Array.isArray(styles) ? styles : [styles]).filter(
      (x): x is StylesObject => !!(x && x instanceof Object),
    );

    const transformedStyles = enabledStyles.map((x) =>
      transformSpecialProperties(x),
    );

    const mergedStyles: StylesObject = mergeStyles(transformedStyles);

    const classes = generateClassNames(mergedStyles);

    if (!virtual) {
      for (const [className, cssString] of Object.entries(classes)) {
        if (!isInStylesheet(className)) {
          addToStylesheet(className, cssString);
        }
      }
    }

    const classNameGetter = () => {
      return Object.keys(classes)
        .map((x) => x.slice(1))
        .join(' ');
    };
    classNameGetter.styles = mergedStyles;
    return classNameGetter;
  };

  const css = (styles: TOrArrayT<ShortCircuitStyles>) => _css(styles, false);
  /**
   * This method should be used for defining styles that should not be inserted
   * into the actual stylesheet.
   *
   * That's useful for when you want to define a set of styles purely for composition
   */
  css.virtual = (styles: TOrArrayT<ShortCircuitStyles>) => _css(styles, true);

  return {css, getCssText};
};
