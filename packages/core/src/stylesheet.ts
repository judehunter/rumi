let styleTag: HTMLStyleElement | null = null;

let stylesheet: Record<string, {cssString: string; styles: any}> = {};

export let cache: Record<string, string> = {};

export const flushCache = () => (cache = {});

export const addToStylesheetAndCache = (
  className: string,
  cssString: string,
  styles?: any,
) => {
  // if this class is not in the stylesheet yet
  if (!Object.keys(stylesheet).includes(className)) {
    stylesheet[className] = {cssString, styles};

    if (globalThis.document) {
      if (styleTag === null) {
        styleTag = globalThis.document.createElement('style');
        styleTag.setAttribute('data-rumi', '');

        globalThis.document.head.appendChild(styleTag);
      }

      styleTag.appendChild(globalThis.document.createTextNode(cssString));
    }
  }
};

export const getStylesheetCSSText = ({reset = true} = {}) => {
  const ret = Object.values(stylesheet)
    .map((x) => x.cssString)
    .join('');
  if (reset) stylesheet = {};
  return ret;
};
