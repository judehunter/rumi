import {createRumi} from '@rumi/core/src/createRumi';

type CSS = Parameters<ReturnType<typeof createRumi>['css']>[0];

declare module 'react' {
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  interface DOMAttributes<T> {
    css?: CSS;
  }
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    css?: CSS;
  }
}

declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      css?: CSS;
    }
  }
}

export {};
