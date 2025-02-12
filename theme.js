import { extendTheme } from "@chakra-ui/react";


export const theme = extendTheme({
  initialColorMode: "light", // 'dark' | 'light'
  useSystemColorMode: false,
  styles: {
    global: {
      "::-webkit-scrollbar": {
        width: "4px",
        height: "4px", // Set the height for the horizontal scrollbar
      },
      "::-webkit-scrollbar-thumb": {
        backgroundColor: "gray.600",
        borderRadius: "4px",
      },
      "::-webkit-scrollbar-track": {
        backgroundColor: "gray.100",
      },
      "::-webkit-scrollbar-thumb:horizontal": {
        backgroundColor: "gray.600",
        borderRadius: "4px",
      },
      "::-webkit-scrollbar-track:horizontal": {
        backgroundColor: "gray.100",
      },
    },
  },
  fonts: {
    body: "Inter, sans-serif",
    heading: "Inter, sans-serif",
    mono: "Inter, monospace",
  },
  colors: {
    main: {
      50: "#c9d438",
      100: "#c9d438",
      200: "#c9d438",
      300: "#457b2f",
      400: "#3a5746",
      500: "#457b2f",
      600: "#457b2f",
      700: "#457b2f",
      800: "#457b2f",
      900: "#457b2f",
      950: "#b0ba33",
      default: "#b0ba33",
    },
  },

  components: {
    Button: {
      variants: {
        blackButton: {
          color: "white",
          bg: "#000",
          _hover: {
            bg: "#000",
          },
        },
        gray: {
          color: "#000",
          bg: "gray.100",
          _hover: {
            bg: "gray.100",
          },
        },
      },
    },
    FormLabel: {
      baseStyle: {
        fontSize: "15px", // Adjust the font size as needed
      },
    },
  },
});
