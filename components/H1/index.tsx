import { Heading, HeadingProps } from '@chakra-ui/react';

const H1 = (props: { children: any } & HeadingProps) => {
  return (
    <Heading as="h1" size="2xl" {...props}>
      {props.children}
    </Heading>
  );
};

export default H1;
