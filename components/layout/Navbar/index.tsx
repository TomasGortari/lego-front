import {
  Box,
  Container,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Icon,
  Link,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
  Image,
} from '@chakra-ui/react';
import {
  HamburgerIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@chakra-ui/icons';
import NextLink from 'next/link';
import useDirectus, { IMyCollections } from '../../../hooks/useDirectus';
import { useMutation, useQueryClient } from 'react-query';
import { Directus } from '@directus/sdk';
import { useRouter } from 'next/router';

const Navbar = () => {
  const { isOpen, onToggle } = useDisclosure();
  const directus = useDirectus();
  const router = useRouter();

  const { mutate: logout } = useMutation('logout', () =>
    (directus as Directus<IMyCollections>)?.auth.logout()
  );
  return (
    <Box as={Container} maxW="container.xl">
      <Flex
        bg={useColorModeValue('gray.50', 'gray.900')}
        color="white"
        justifyContent="space-between"
        minH="60px"
        py={{ base: 2 }}
        px={{ base: 0, lg: 4 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.900')}
        align={{ base: 'center', lg: 'unset' }}
      >
        <Flex
          flex={{ base: 1, md: 'auto' }}
          ml={{ base: -2 }}
          display={{ base: 'flex', md: 'none' }}
        >
          <IconButton
            colorScheme="primary"
            onClick={onToggle}
            icon={
              isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
            }
            variant={'ghost'}
            aria-label={'Toggle Navigation'}
          />
        </Flex>
        <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
          <NextLink href="/" passHref>
            <Box as="a">
              <Image src="/logo.png" alt="Accueil" />
            </Box>
          </NextLink>

          <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
            <DesktopNav />
          </Flex>
        </Flex>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify={'flex-end'}
          direction={'row'}
          spacing={6}
          px={0}
          alignItems="center"
        >
          {directus?.auth?.token === null && (
            <>
              {' '}
              <Button
                as={'a'}
                fontSize={'sm'}
                fontWeight={600}
                variant={'link'}
                href={'/auth/login'}
                colorScheme="primary"
              >
                Connexion
              </Button>
              <Button
                as="a"
                display={{ base: 'none', md: 'inline-flex' }}
                fontSize={'sm'}
                fontWeight={600}
                color={'white'}
                colorScheme="secondary"
                href={'/auth/signup'}
                _hover={{
                  bg: 'primary.500',
                }}
              >
                S'inscrire
              </Button>
            </>
          )}
          {directus?.auth?.token && (
            <Button
              size="sm"
              colorScheme="red"
              onClick={() => {
                logout();
                router.push('/');
              }}
            >
              Deconnexion
            </Button>
          )}
        </Stack>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav />
      </Collapse>
    </Box>
  );
};

const DesktopNav = () => {
  const linkColor = useColorModeValue('gray.600', 'gray.200');
  const linkHoverColor = useColorModeValue('gray.800', 'white');
  const popoverContentBgColor = useColorModeValue('white', 'gray.800');

  return (
    <Stack direction={'row'} spacing={4}>
      {NAV_ITEMS.map((navItem) => (
        <Flex alignItems="center" key={navItem.label}>
          <Popover trigger={'hover'} placement={'bottom-start'}>
            <PopoverTrigger>
              <NextLink href={navItem.href} passHref>
                <Text
                  as="a"
                  p={2}
                  color="primary.500"
                  fontSize={'lg'}
                  fontWeight={600}
                  _hover={{
                    textDecoration: 'none',
                    color: linkHoverColor,
                  }}
                >
                  {navItem.label}
                </Text>
              </NextLink>
            </PopoverTrigger>

            {/* {navItem.children && (
              <PopoverContent
                border={0}
                boxShadow={'xl'}
                bg={popoverContentBgColor}
                p={4}
                rounded={'xl'}
                minW={'sm'}
              >
                <Stack>
                  {navItem.children.map((child) => (
                    <DesktopSubNav key={child.label} {...child} />
                  ))}
                </Stack>
              </PopoverContent>
            )} */}
          </Popover>
        </Flex>
      ))}
    </Stack>
  );
};

const MobileNav = () => {
  return (
    <Stack
      bg={useColorModeValue('white', 'gray.800')}
      p={4}
      display={{ md: 'none' }}
    >
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
    </Stack>
  );
};

const MobileNavItem = ({ label, children, href }: NavItem) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Flex
        py={2}
        as={Link}
        href={href ?? '#'}
        justify={'space-between'}
        align={'center'}
        _hover={{
          textDecoration: 'none',
        }}
      >
        <Text
          fontWeight={600}
          color={useColorModeValue('gray.600', 'gray.200')}
        >
          {label}
        </Text>
        {children && (
          <Icon
            as={ChevronDownIcon}
            transition={'all .25s ease-in-out'}
            transform={isOpen ? 'rotate(180deg)' : ''}
            w={6}
            h={6}
          />
        )}
      </Flex>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={'solid'}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          align={'start'}
        >
          {children &&
            children.map((child) => (
              <Link key={child.label} py={2} href={child.href}>
                {child.label}
              </Link>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};

interface NavItem {
  label: string;
  subLabel?: string;
  children?: Array<NavItem>;
  href: string;
}

const NAV_ITEMS: Array<NavItem> = [
  {
    label: 'Accueil',
    href: '/',
  },

  {
    label: 'Mon espace',
    href: '/user',
  },
];

export default Navbar;
