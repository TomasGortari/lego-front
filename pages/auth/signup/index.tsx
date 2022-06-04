import {
  Box,
  Flex,
  Text,
  useToast,
  chakra,
  Container,
  useConst,
  FormControl,
  FormLabel,
  Input,
  Button,
} from '@chakra-ui/react';

import { InfiniteQueryObserver, useMutation } from 'react-query';
import axios from 'axios';
import {
  API_URL,
  PUBLIC_URL,
  ROLE_AUTHENTICATED_ID,
} from '../../../config/config';
import NextLink from 'next/link';
import Section from '../../../components/Section';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDirectus } from '../../../hooks/useDirectus';
import H1 from '../../../components/H1';
import { InfoOutlineIcon } from '@chakra-ui/icons';

const Header = () => (
  <Flex
    color="white"
    h="250px"
    bgGradient="linear(to-b, primary.500, primary.600)"
    alignItems="center"
    justifyContent="center"
    mb="50px"
  >
    <H1>Inscription </H1>
  </Flex>
);

const SignUp = () => {
  const router = useRouter();
  const [infos, setInfos] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const directus = useDirectus();

  useEffect(() => {
    if (directus.auth?.token) {
      router.push('/user');
    }
  }, []);

  const toast = useToast();
  const {
    mutate: createUser,
    isLoading,
    isError,
  } = useMutation(
    'createUser',
    () =>
      axios.post(`${API_URL}/users`, {
        email: infos.email,
        password: infos.password,
        role: ROLE_AUTHENTICATED_ID,
      }),
    {
      onSuccess: (data) => {
        toast({
          status: 'success',
          duration: null,
          isClosable: true,
          title:
            'Votre compte a été bien crée vous pouvez des à présent vous connecter',
        });
        setInfos({ email: '', password: '', confirmPassword: '' });
        router.push('/auth/login');
      },
      onError: (err: any) => {
        if (
          err?.response?.data?.errors?.filter(
            (res: any) => res.extensions.code === 'RECORD_NOT_UNIQUE'
          )?.length > 0
        ) {
          toast({ status: 'error', title: 'Ce mail existe déjà' });
        } else {
          toast({ status: 'error', title: 'Oups une erreur est survenue' });
        }
      },
    }
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (infos.password === infos.confirmPassword) {
      createUser();
    } else {
      toast({
        status: 'error',
        title: 'Les deux champs mot de passes ne correspondent pas',
      });
    }
  };

  const layout = useConst([
    {
      name: 'email',
      label: 'Email',
      type: 'text',
    },
    {
      name: 'password',
      label: 'Mot de passe',
      type: 'password',
    },
    {
      name: 'confirmPassword',
      label: 'Confirmation de mot de passe',
      type: 'password',
    },
  ]);

  return (
    <>
      <Header />
      <Section
        as={Container}
        maxW="container.sm"
        boxShadow="2xl"
        p={10}
        textAlign="center"
      >
        <Text>
          Vous êtes déjà inscrit ?{' '}
          <NextLink href="/auth/login" passHref>
            <chakra.a
              _hover={{ textDecoration: 'underline' }}
              color="primary.500"
              fontWeight="bold"
            >
              Connectez vous !
            </chakra.a>
          </NextLink>{' '}
        </Text>
        <chakra.form onSubmit={handleSubmit}>
          {layout.map((res, key) => (
            <FormControl key={key}>
              <FormLabel fontWeight="semibold">{res.label} </FormLabel>
              <Input
                type={res.type}
                value={
                  infos[res.name as 'confirmPassword' | 'password' | 'email']
                }
                onChange={(e) =>
                  setInfos({ ...infos, [res.name]: e.target.value })
                }
              />
            </FormControl>
          ))}

          <Button
            disabled={isLoading}
            mt={5}
            type="submit"
            colorScheme="secondary"
          >
            M'inscrire
          </Button>
        </chakra.form>
      </Section>
    </>
  );
};

export default SignUp;
