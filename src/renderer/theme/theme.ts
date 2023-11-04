import {
  extendTheme,
  ButtonProps,
  TextProps,
  StyleConfig,
} from '@chakra-ui/react';

export const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: 'gray.800',
      },
    },
  },
  components: {
    Button: {
      variants: {
        primary: {
          bg: 'gray.700',
          color: 'white',
          fontSize: 'lg',
          _hover: {
            bg: 'gray.100',
            color: 'gray.900',
          },
        } as ButtonProps,
        red: {
          bg: '#e53e3e',
          color: 'white',
          fontSize: 'lg',
          _hover: {
            bg: '#ff0000',
          },
        } as ButtonProps,
        functional: {
          bg: 'Highlight',
          color: 'white',
          fontSize: 'lg',
          _hover: {
            bg: 'white',
            color: 'black',
          },
        } as ButtonProps,
      },
    },
    Text: {
      baseStyle: {
        color: 'whiteAlpha.800',
        fontSize: '2xl',
      } as TextProps,
    },
  },
} as Record<string, StyleConfig>);
