/**
 * @jest-environment jsdom
 */

import {createRumi} from '../src/createRumi';

// describe('browser', () => {
//   test('simple styles', () => {
//     const {css} = createRumi({
//       utils: {
//         bg: (val) => ({backgroundColor: val}),
//       },
//     });
//     css({
//       bg: 'red',
//     });
//     css({
//       bg: 'violet',
//     });

//     expect(document.head.innerHTML).toMatchSnapshot();
//   });
// });
