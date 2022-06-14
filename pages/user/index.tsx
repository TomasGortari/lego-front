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
  Stack,
  InputRightAddon,
  InputGroup,
} from '@chakra-ui/react';

import { useQuery, useMutation } from 'react-query';

import {
  Directus,
  FileItem,
  OneItem,
  PartialItem,
  UserItem,
} from '@directus/sdk';
import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import { IUser } from '../../@types/user';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { API_URL } from '../../config/config';
import useDirectus, { IMyCollections } from '../../hooks/useDirectus';
import Section from '../../components/Section';
import { ITag } from '../../@types/tag';
import { CloseIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { IFile } from '../../@types/file';
import slugify from '../../utils/slugify';
import { set } from 'lodash';
import ModalForm from '../../components/user/ModalForm';
import AnnouncementCard from '../../components/AnnouncementCard';

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

  const {
    mutate: updateAnnouncement,
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

const MyAnnouncement = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const directus = useDirectus();

  const {
    data: currentUser,
    isLoading,
    // refetch: reCurrentUser,
    isError,
  } = useQuery(
    ['getMe', directus],
    () =>
      directus?.users.me.read({
        fields: ['id', 'email', 'avatar', 'first_name', 'last_name'],
      }),
    {
      enabled: Boolean(directus?.auth.token) && Boolean(directus),
    }
  );

  const { data: announcements, refetch: fetchAnnouncements } = useQuery(
    'getAnnouncements',
    () =>
      directus
        ?.items('announcement')
        .readByQuery({
          fields: ['*.*.*'],
          filter: {
            user: {
              id: {
                _eq: currentUser?.id,
              },
            },
          },
        })
        .then((res) => res.data),
    {
      enabled: Boolean(currentUser),
    }
  );

  const deleteAnnouncement = async (id: number) => {
    await directus?.items('announcement').deleteOne(id as number);
    fetchAnnouncements();
  };

  return (
    <Box>
      <ModalForm
        fetchAnnouncements={fetchAnnouncements}
        isOpen={isOpen}
        onClose={onClose}
      />
      <Flex mb={10} alignItems="flex-end">
        <Heading color="primary.500">Mes annonces</Heading>
        <Button ml={10} onClick={onOpen} mt={5} colorScheme="secondary">
          Créer une nouvelle annonce
        </Button>
      </Flex>
      <SimpleGrid as={Container} maxW="container.md" spacing={10} columns={1}>
        {currentUser &&
          announcements?.map((announcement) => (
            <Box position="relative">
              <AnnouncementCard announcement={announcement} />
              {currentUser?.email ===
                (announcement?.user as PartialItem<IUser>).email && (
                <Flex position="absolute" top="0" right="0" p={5}>
                  <EditIcon
                    cursor="pointer"
                    color="primary.500"
                    // onClick={
                    //   () =>
                    //   updateAnnouncement(announcement.id as number)
                    // }
                  />
                  <DeleteIcon
                    cursor="pointer"
                    color="red"
                    onClick={() =>
                      deleteAnnouncement(announcement.id as number)
                    }
                  />
                </Flex>
              )}
            </Box>
          ))}
      </SimpleGrid>
    </Box>
  );
};

const MyBookings = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const directus = useDirectus();

  const {
    data: currentUser,
    isLoading,
    // refetch: reCurrentUser,
    isError,
  } = useQuery(
    ['getMe', directus],
    () =>
      directus?.users.me.read({
        fields: ['id', 'email', 'avatar', 'first_name', 'last_name'],
      }),
    {
      enabled: Boolean(directus?.auth.token) && Boolean(directus),
    }
  );

  const { data: bookings, refetch: fetchBookings } = useQuery(
    'getBookings',
    () =>
      directus
        ?.items('booking')
        .readByQuery({
          fields: ['*.*.*'],
          filter: {
            buyer: {
              id: {
                _eq: currentUser?.id,
              },
            },
          },
        })
        .then((res) => res.data),
    {
      enabled: Boolean(currentUser),
    }
  );
  console.log(bookings);

  return (
    <Box>
      <Flex mb={10} alignItems="flex-end">
        <Heading color="primary.500">Mes commandes</Heading>
      </Flex>
      <SimpleGrid as={Container} maxW="container.md" spacing={10} columns={1}>
        {currentUser &&
          bookings?.map((booking) => (
            <SimpleGrid
              spacing={5}
              columns={{ base: 1, md: 2 }}
              boxShadow="xl"
              p={3}
              fontWeight="semibold"
            >
              <Text>Nom produit: {booking.name}</Text>
              <Text>Quantité: x{booking.quantity}</Text>
              <Text>Prix: {booking.price_unity}€</Text>
              <Text>
                Vendeur: {(booking.seller as PartialItem<IUser>).first_name}{' '}
                {(booking.seller as PartialItem<IUser>).last_name}
              </Text>
              <Text>
                État de la réservation:{' '}
                {
                  {
                    process: 'Non aboutie',
                    cancel: 'Annulé',
                    validate: 'Validé',
                  }[booking.status as string]
                }
              </Text>
            </SimpleGrid>
          ))}
      </SimpleGrid>
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
          <Section>
            <MyBookings />
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
