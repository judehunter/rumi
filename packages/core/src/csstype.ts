import {StandardProperties, SimplePseudos} from 'csstype';
import {RumiConfig} from './createRumi';
import {TOrArrayT} from './utils';
// import * as Native from './css';

// export {Native};

export type CSSBaseStyles = StandardProperties<
  string | number,
  string | number
>;
// export interface CSSBaseStyles
//   extends Native.StandardLonghandProperties,
//     Native.StandardShorthandProperties,
//     Native.SvgProperties {}

export type CSSProperties = {
  [K in keyof CSSBaseStyles]:
    | CSSBaseStyles[K]
    | Array<Extract<CSSBaseStyles[K], string>>;
};

export type CSSPseudos<T extends RumiConfig> = {
  [K in SimplePseudos as `&${K}`]?: TOrArrayT<StylesObject<T>>;
};

export type CSSNested<T extends RumiConfig> = {
  [K in
    | `& *`
    | '& > *'
    | '& + *'
    | `& ~ *`
    | `${string}&${string}`
    | `${string}@${string}`]?: TOrArrayT<StylesObject<T>>;
};

export type CSSUtils<T extends RumiConfig> = {
  [Prop in keyof T['utils']]?: T['utils'][Prop] extends (...args: any) => any
    ? Parameters<T['utils'][Prop]>[0]
    : never;
};

export type CSSMedia<T extends RumiConfig> = {
  [Prop in keyof T['media']]?: StylesObject<T>;
};
export interface StylesObjectInterface<T extends RumiConfig>
  extends CSSProperties,
    CSSPseudos<T>,
    CSSNested<T> {}

export type StylesObject<T extends RumiConfig> =
  | (StylesObjectInterface<T> & CSSUtils<T>)
  | {styles: StylesObject<T>};

// export type StylesObject<T extends RumiConfig> =
//   | ({[Prop in keyof CSSBaseStyles]?: CSSBaseStyles[Prop]} & {
//       [Prop in keyof T['media']]?: StylesObject<T>;
// } & {
//   [Prop in keyof T['utils']]?: T['utils'][Prop] extends (
//     ...args: any
//   ) => any
//     ? Parameters<T['utils'][Prop]>[0]
//     : never;
// } & {
//       [K in Contains<'&'>]?: StylesObject<T>;
//     } & {
//       [K in keyof CSSNestedSelectors]?: StylesObject<T>;
//     })
//   | {styles: StylesObject<T>};
