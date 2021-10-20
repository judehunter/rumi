let styleTag: HTMLStyleElement | null = null;

const stylesheet: Record<string, {cssString: string; styles: any}> = {};

export const isInStylesheet = (className: string) => {
  return Object.keys(stylesheet).includes(className);
};

export const addToStylesheet = (
  className: string,
  cssString: string,
  styles?: any,
) => {
  stylesheet[className] = {cssString, styles};

  if (globalThis.document) {
    if (styleTag === null) {
      styleTag = globalThis.document.createElement('style');
      styleTag.setAttribute('data-rumi', '');

      globalThis.document.head.appendChild(styleTag);
    }

    styleTag.appendChild(globalThis.document.createTextNode(cssString));
  }
};
