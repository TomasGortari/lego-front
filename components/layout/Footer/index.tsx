import { ReactNode } from 'react';

import {
  Box,
  Container,
  Flex,
  Image,
  Link,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';

const Logo = (props: any) => {
  return <Image h="100%" src="/logo.png" alt="Logo" />;
};

const ListHeader = ({ children }: { children: ReactNode }) => {
  return (
    <Text fontWeight={'500'} fontSize={'lg'} mb={2}>
      {children}
    </Text>
  );
};

export default function Footer() {
  return (
    <Box bg={useColorModeValue('gray.50', 'gray.900')} color="primary.500">
      <Container as={Stack} maxW={'6xl'} py={10}>
        <SimpleGrid
          m="auto"
          columns={{ base: 1, md: 3 }}
          spacing={8}
          alignItems="center"
        >
          <Flex>
            <Box h="32px">
              <Logo />
            </Box>
            <Text ml="25px" fontSize={'sm'}>
              © 2022 LeGold
            </Text>
          </Flex>

          <Stack align={'flex-start'}>
            <ListHeader>Support</ListHeader>
            <Link href={'#'}>Assistance</Link>
            <Link href={'#'}>Conditions d'utilisation</Link>
            <Link href={'#'}>Mentions légales</Link>
            <Link href={'#'}>CGV</Link>
          </Stack>
          <Stack align={'flex-start'}>
            <ListHeader>Suivez nous</ListHeader>
            <Link href={'#'}>Facebook</Link>
            <Link href={'#'}>Twitter</Link>
            <Link href={'#'}>Instagram</Link>
            <Link href={'#'}>LinkedIn</Link>
          </Stack>
        </SimpleGrid>
      </Container>
    </Box>
  );
}
