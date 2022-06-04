import { extendTheme } from '@chakra-ui/react';
import { colors } from './foundations/colors';
// import { Box } from './components/heading';
import { fonts } from './foundations/fonts';

export const HEADER_HEIGHT = '70px';

export const appTheme = extendTheme({
  styles: {
    global: {
      a: {
        _focus: {
          boxShadow: 'none !important',
          outlineColor: 'secondary.500',
        },
      },
    },
  },
  colors,
  fonts,
});
