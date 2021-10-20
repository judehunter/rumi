import {createRumi} from '@rumi/core/src/createRumi';
import {css} from './jsx-export';

// type CSS = Parameters<ReturnType<typeof createRumi>['css']>[0];

type CSS = Parameters<typeof css>[0];

declare module 'react' {
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  interface Attributes {
    css?: CSS;
  }
  // interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
  //   css?: CSS;
  // }
}

// declare global {
//   namespace JSX {
//     interface IntrinsicAttributes {
//       css?: CSS;
//     }
//   }
// }

export {};
