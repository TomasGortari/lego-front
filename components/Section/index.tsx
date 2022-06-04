import { Box, BoxProps } from '@chakra-ui/react';

const Section = (props: { children: any } & BoxProps) => {
  return (
    <Box as="section" mb="100px" {...props}>
      {props.children}
    </Box>
  );
};

export default Section;
