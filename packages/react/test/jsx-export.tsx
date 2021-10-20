import {createRumi} from '../src/index';

export const {jsx, css} = createRumi({
  utils: {},
  media: {
    '@lg': '(min-width: 700px)',
  },
});
