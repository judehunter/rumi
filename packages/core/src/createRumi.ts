import {stringify} from '@stitches/stringify';
import {toHash} from './hash';
import {all as mergeAll} from 'deepmerge';
import * as CSSType from 'csstype';
import {addToStylesheetAndCache, getStylesheetCSSText} from './stylesheet';
import {cache} from './stylesheet';

// type CSSBaseStyles = Pick<
//   CSSType.Properties,
//   'display' | 'color' | 'backgroundColor'
// >;
export type CSSBaseStyles = CSSType.Properties<
  string | number,
  string | number
>;
export type CSSPseudos = CSSType.SimplePseudos extends infer R
  ? R extends string
    ? `&${R}`
    : never
  : never;
export type CSSNestedSelectors =
  | CSSPseudos
  | `& *`
  | '& > *'
  | '& + *'
  | `& ~ *`;

export type Contains<T extends string> = `${string}${T}${string}`;

export type UtilFunction = (value: any) => Partial<CSSBaseStyles>;

export type RumiTheme = any;

export type Media = Record<string, string>;

// eslint-disable-next-line @typescript-eslint/ban-types
// type TryParameters<T> = T extends (args: infer R) => any ? R : [];

export type StylesObject<T extends RumiConfig> =
  | ({[Prop in keyof CSSBaseStyles]?: CSSBaseStyles[Prop]} & {
      [Prop in keyof T['media']]?: StylesObject<T>;
    } & {
      [Prop in keyof T['utils']]?: T['utils'][Prop] extends (
        ...args: any
      ) => any
        ? Parameters<T['utils'][Prop]>[0]
        : never;
    } & {
      [K in Contains<'&'> | CSSNestedSelectors]?: StylesObject<T>;
    } & {
      [K in CSSNestedSelectors]?: StylesObject<T>;
    })
  | {styles: StylesObject<T>};

export type ShortCircuitStyles<T extends RumiConfig> =
  | null
  | undefined
  | boolean
  | number
  | string
  | StylesObject<T>;

export type TOrArrayT<T> = T | T[];

// export type DeepPartial<T> = {
//   [P in keyof T]?: DeepPartial<T[P]>;
// };

export type RumiConfig = {
  utils?: Record<string, UtilFunction>;
  theme?: RumiTheme;
  media?: Media;
  prefix?: string;
};

// export type CreateRumi<T extends RumiConfig> =
export type ID<T> = {[K in keyof T]: T[K]};

export const createRumi = <T extends RumiConfig>(cfg: T) => {
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

      const foundUtilFunction = Object.entries(cfg.utils ?? {}).find(
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
        classes[className] = cache[className] ||= stringify({
          [className]: atomicStyle,
        });
      }
    }

    // stringify whole styles as one
    if (Object.keys(whole).length) {
      const className = `.${cfg.prefix ? cfg.prefix + '-' : ''}rumi-${toHash(
        whole,
      )}`;
      classes[className] = cache[className] ||= stringify({
        [className]: whole,
      });
    }

    return classes;
  };

  const _css = (
    styles: TOrArrayT<ShortCircuitStyles<T>>,
    virtual: boolean,
  ): {
    (): string;
    styles: StylesObject<T>;
  } => {
    const enabledStyles = (Array.isArray(styles) ? styles : [styles]).filter(
      (x): x is StylesObject<T> => !!(x && x instanceof Object),
    );

    const transformedStyles = enabledStyles.map((x) =>
      transformSpecialProperties(x),
    );

    const mergedStyles: StylesObject<T> = mergeStyles(transformedStyles);

    const classes = generateClassNames(mergedStyles);

    if (!virtual) {
      for (const [className, cssString] of Object.entries(classes)) {
        addToStylesheetAndCache(className, cssString);
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

  const css = (styles: TOrArrayT<ShortCircuitStyles<T>>) => _css(styles, false);
  /**
   * This method should be used for defining styles that should not be inserted
   * into the actual stylesheet.
   *
   * That's useful for when you want to define a set of styles purely for composition
   */
  css.virtual = (styles: TOrArrayT<ShortCircuitStyles<T>>) =>
    _css(styles, true);

  return {css, getCssText};
};
