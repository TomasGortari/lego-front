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

import { useMutation } from 'react-query';
import axios from 'axios';
import { API_URL } from '../../../config/config';
import NextLink from 'next/link';
import Section from '../../../components/Section';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import H1 from '../../../components/H1';
import useDirectus from '../../../hooks/useDirectus';

const Header = () => (
  <Flex
    color="white"
    h="250px"
    bgGradient="linear(to-b, primary.500, primary.600)"
    alignItems="center"
    justifyContent="center"
    mb="50px"
  >
    <H1>Connexion </H1>
  </Flex>
);

const SignIn = () => {
  const router = useRouter();
  const [infos, setInfos] = useState({ email: '', password: '' });
  const directus = useDirectus();
  useEffect(() => {
    if (directus?.auth?.token) {
      router.push('/user');
    }
  }, []);

  const layout = useConst([
    {
      name: 'email',
      label: 'Email',
      type: 'text',
    },
    {
      name: 'password',
      type: 'password',
      label: 'Mot de passe',
    },
  ]);

  const toast = useToast();
  const {
    mutate: login,
    isLoading,
    isError,
  } = useMutation('login', (data: any) => directus.auth.login(infos), {
    onSuccess: (data) => {
      toast({ status: 'success', title: 'Connexion réussie !' });
      setInfos({ email: '', password: '' });
      router.push('/user');
    },
    onError: (err: any) => {
      console.log(err.message === 'Invalid user credentials.');
      if (err.message === 'Invalid user credentials.') {
        toast({ status: 'error', title: 'Email ou Mot de passe incorrect' });
      } else {
        toast({ status: 'error', title: 'Oups une erreur est survenue' });
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    login(infos);
  };

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
          Pas encore inscrit ?{' '}
          <NextLink href="/auth/signup" passHref>
            <chakra.a
              _hover={{ textDecoration: 'underline' }}
              color="primary.500"
              fontWeight="bold"
            >
              Inscrivez vous !
            </chakra.a>
          </NextLink>{' '}
        </Text>
        <chakra.form onSubmit={handleSubmit}>
          {layout.map((res, key) => (
            <FormControl key={key}>
              <FormLabel fontWeight="semibold"> {res.label} </FormLabel>
              <Input
                name={res.name}
                type={res.type}
                value={infos[res.name as 'email' | 'password']}
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
            Se connecter
          </Button>
        </chakra.form>
      </Section>
    </>
  );
};

export default SignIn;
