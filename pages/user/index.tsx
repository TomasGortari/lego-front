import {
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Box,
  Text,
  useConst,
  chakra,
  Flex,
  Avatar,
  FormControl,
  FormLabel,
  Input,
  SimpleGrid,
  useToast,
  Button,
  Spinner,
  Alert,
  Heading,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  NumberInput,
  NumberInputField,
  Textarea,
  Badge,
} from '@chakra-ui/react';

import { useQuery, useMutation } from 'react-query';

import { Directus, PartialItem, UserItem } from '@directus/sdk';
import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import { IUser } from '../../@types/user';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { API_URL } from '../../config/config';
import useDirectus, { IMyCollections } from '../../hooks/useDirectus';
import Section from '../../components/Section';
import { ITag } from '../../@types/tag';

const MySpace = () => {
  const directus = useDirectus();
  const toast = useToast();

  const [infos, setInfos] = useState({
    first_name: '',
    last_name: '',
  });
  const {
    data: currentUser,
    isLoading,
    refetch: reCurrentUser,
    isError,
  } = useQuery(
    ['getMe', directus],
    () =>
      directus?.users.me.read({
        fields: ['id', 'email', 'avatar', 'first_name', 'last_name'],
      }),
    {
      onSuccess: (data) => {
        if (
          (infos.first_name !== data?.first_name ||
            infos.last_name !== data.last_name) &&
          data
        ) {
          setInfos({ first_name: data.first_name, last_name: data.last_name });
        }
      },
      enabled: Boolean(directus?.auth.token) && Boolean(directus),
    }
  );

  const layout = useConst([
    {
      label: 'Prénom',
      name: 'first_name',
    },
    {
      label: 'Nom',
      name: 'last_name',
    },
  ]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setInfos({ ...infos, [e.target.name]: e.target.value });

  const {
    mutate: updateUser,
    // isLoading,
    // isError,
  } = useMutation(
    'updateUser',
    () => (directus as Directus<IMyCollections>)?.users.me.update(infos),
    {
      onSuccess: (data) => {
        reCurrentUser();
        toast({
          status: 'success',
          title: 'Données personnel mis à jour avec succès',
        });
      },
      onError: (err: any) => {
        toast({
          status: 'error',
          title:
            "Une erreur est survenue, les données n'ont pas pu être mis à jour",
        });
      },
    }
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      infos.first_name !== currentUser?.first_name ||
      infos.last_name !== currentUser?.last_name
    ) {
      updateUser();
    }
  };

  console.log(currentUser, infos);

  return (
    <Box>
      <Flex alignItems="center">
        <Avatar
          size="xl"
          src={`${API_URL}/assets/${currentUser?.avatar}`}
          name={
            currentUser?.first_name && currentUser?.last_name
              ? `${currentUser?.first_name} ${currentUser?.last_name}`
              : currentUser?.email
          }
          bgColor="primary.500"
          color="white"
          mr={5}
        />
        <Box>
          {(currentUser?.first_name || currentUser?.last_name) && (
            <Text fontWeight="bold" fontSize="lg">
              {currentUser?.first_name} {currentUser?.last_name}
            </Text>
          )}
          <Text color="gray.400">{currentUser?.email}</Text>
        </Box>
      </Flex>
      {(!currentUser?.first_name || !currentUser?.last_name) && currentUser && (
        <Alert
          display="flex"
          justifyContent="center"
          fontSize="lg"
          borderRadius="2xl"
          my={5}
          color="primary.600"
          fontWeight="bold"
          status="error"
        >
          {' '}
          Pour favoriser les ventes nous vous conseillons de rentrer votre
          prénom et nom{' '}
        </Alert>
      )}
      <chakra.form onSubmit={handleSubmit}>
        <SimpleGrid
          px={{ base: 0, lg: '20%' }}
          mt={5}
          columns={{ base: 1, md: 2 }}
        >
          {layout.map((res, key) => (
            <FormControl key={key}>
              <FormLabel fontWeight="semibold">{res.label}</FormLabel>
              <Input
                name={res.name}
                value={infos[(res.name as 'first_name') || 'last_name']}
                onChange={onChange}
              />
            </FormControl>
          ))}
        </SimpleGrid>

        <Button mt={5} type="submit" colorScheme="secondary">
          Mettre à jour
        </Button>
      </chakra.form>
    </Box>
  );
};

const ModalForm = (props: { isOpen: boolean; onClose: () => void }) => {
  const { isOpen, onClose } = props;
  const toast = useToast();
  const directus = useDirectus();
  const [infos, setInfos] = useState({
    name: '',
    quantity: '',
    description: '',
    price: null,
    tags: [],
  });
  const [searchTag, setSearchTag] = useState('');
  const [newTag, setNewTag] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };
  const { data: tags, refetch: refetchTags } = useQuery(
    ['getTags', directus, searchTag],
    () =>
      (directus as Directus<IMyCollections>)
        ?.items('tags')
        .readByQuery({
          fields: ['name'],
          filter:
            searchTag !== ''
              ? {
                  name: {
                    _contains: searchTag.toLowerCase(),
                  },
                }
              : {},
          limit: 20,
        })
        .then((res) => res.data)
  );

  const { mutate: createTag } = useMutation(
    'createTag',
    () =>
      (directus as Directus<IMyCollections>).items('tags').createOne({
        name: newTag.toLowerCase(),
      }),
    {
      onSuccess: () => {
        toast({
          status: 'success',
          title:
            "Votre tag a bel est bien été crée rechercher pour les sélctionner à l'aide de la barre de recherche",
        });
        setNewTag('');
        refetchTags();
      },
      onError: () => {
        toast({
          status: 'error',
          title: 'Une erreur est survenue lors de la cration de votre tag',
        });
      },
    }
  );

  console.log(tags);

  return (
    <Modal size="5xl" isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>Création d'annonce</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box>
            <FormControl mb={5}>
              <FormLabel fontWeight="semibold">Nom du produit </FormLabel>
              <Input
                value={infos.name}
                onChange={(e) => setInfos({ ...infos, name: e.target.value })}
              />
            </FormControl>
            <FormControl mb={5}>
              <FormLabel fontWeight="semibold">
                Nombre d'exemplaire du produit
              </FormLabel>
              <Input
                type="number"
                value={infos.quantity}
                onChange={(e) =>
                  setInfos({ ...infos, quantity: e.target.value })
                }
              ></Input>
            </FormControl>
            <FormControl mb={5}>
              <FormLabel fontWeight="semibold">
                Description du produit
              </FormLabel>
              <Textarea
                value={infos.description}
                onChange={(e) =>
                  setInfos({ ...infos, description: e.target.value })
                }
              ></Textarea>
            </FormControl>
            <FormControl>
              <FormLabel fontWeight="semibold">
                Tags à associer aux produit
              </FormLabel>
              <Box m="auto" width="container.md">
                <Input
                  placeholder="Rechercher tags"
                  value={searchTag}
                  onChange={(e) => setSearchTag(e.target.value)}
                />
                <Box mt={5} spacing={3} columns={{ base: 2, sm: 3, md: 4 }}>
                  <Flex my={3}>
                    {(tags as PartialItem<ITag>[])?.map((tag, key) => (
                      <Badge
                        ml={2}
                        borderRadius="2xl"
                        w="min-content"
                        p={2}
                        key={key}
                        colorScheme="primary"
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </Flex>
                  <Text fontWeight="semibold">Ajouter un nouveau tag</Text>
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                  />
                  <Button
                    width="75px"
                    onClick={() => {
                      if (newTag !== '') createTag();
                    }}
                    colorScheme="secondary"
                  >
                    Ajouter{' '}
                  </Button>
                </Box>
              </Box>
            </FormControl>
          </Box>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="secondary" type="submit">
            Créer mon annonce
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const MyAnnouncement = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box>
      <ModalForm isOpen={isOpen} onClose={onClose} />
      <Heading color="primary.500">Mes annonces</Heading>
      <Button onClick={onOpen} mt={5} colorScheme="secondary">
        Créer une nouvelle annonce
      </Button>
    </Box>
  );
};

const User = () => {
  const router = useRouter();
  const directus = useDirectus();

  useEffect(() => {
    if (directus?.auth?.token === null) {
      router.push('/auth/login');
    }
  }, [directus]);

  // to put announcements
  // const { data: comments, isLoading: commentLoading } = useQuery(
  //   ['getComments', currentUser],
  //   () =>
  //     _directus
  //       ?.items('comments')
  //       .readByQuery({
  //         fields: ['content', 'post.title', 'date_created'],
  //         filter: {
  //           author: {
  //             id: {
  //               _eq: currentUser?.id,
  //             },
  //           },
  //         },
  //       })
  //       .then((res) => res.data),
  //   {
  //     enabled: Boolean(currentUser) && Boolean(_directus),
  //   }
  // );

  return (
    <>
      {Boolean(directus?.auth?.token) && (
        <Container mt="100px" maxW="container.xl">
          <Section>
            <MySpace />
          </Section>
          <Section>
            <MyAnnouncement />
          </Section>
        </Container>
      )}
      {!Boolean(directus?.auth?.token) && (
        <Flex alignItems="center" justifyContent="center" h="70vh">
          <Spinner />
        </Flex>
      )}
    </>
  );
};

export default User;
