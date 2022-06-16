import { CloseIcon, DeleteIcon } from '@chakra-ui/icons';
import {
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { Directus, PartialItem } from '@directus/sdk';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { ITag } from '../../@types/tag';
import useDirectus, { IMyCollections } from '../../hooks/useDirectus';

const SelectTags = (props: {
  tags: number[];
  addTags: (tagId: number) => void;
  removeTags: (tagId: number) => void;
}) => {
  const router = useRouter();
  const toast = useToast();
  const { onOpen, isOpen, onClose } = useDisclosure();
  const [value, setValue] = useState('');
  const directus = useDirectus();
  const [hoverSelected, setHoverSelected] = useState(false);
  const {
    data: tags,
    isLoading,
    refetch: fetchTags,
  } = useQuery(
    ['getTags', value],
    () =>
      (directus as Directus<IMyCollections> | undefined)
        ?.items('tags')
        .readByQuery({
          fields: ['id', 'name'],
          filter: {
            name: {
              _contains: value,
            },
            id: {
              _nin: props.tags.length > 0 ? props.tags : [-1],
            },
          },
        })
        .then((res) => res.data),
    {
      enabled: value.length > 0,
    }
  );
  const { data: tagsSelected, refetch: fetchSelectedTags } = useQuery(
    ['getTagsSelected', props.tags],
    () =>
      (directus as Directus<IMyCollections> | undefined)
        ?.items('tags')
        .readByQuery({
          filter: {
            id: {
              _in: props.tags,
            },
          },
        })
        .then((res) => res.data),
    {
      retry: 2,
      enabled: props?.tags?.length > 0,
    }
  );

  const { mutate: createTag } = useMutation(
    'createTag',
    () =>
      (directus as Directus<IMyCollections>).items('tags').createOne({
        name: value.toLowerCase(),
      }),
    {
      onSuccess: (data) => {
        toast({
          status: 'success',
          title:
            "Votre tag a bel est bien été crée rechercher pour les sélctionner à l'aide de la barre de recherche",
        });
        setValue('');
        props.addTags((data as any).id);
        fetchTags();
        fetchSelectedTags();
      },
      onError: () => {
        toast({
          status: 'error',
          title: 'Une erreur est survenue lors de la cration de votre tag',
        });
      },
    }
  );

  return (
    <FormControl position="relative">
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Tags sélectionnés</ModalHeader>
          <ModalCloseButton />
          <ModalBody p={5}>
            <SimpleGrid
              alignItems="flex-end"
              // flexDirection="row"
              // flexWrap="wrap"
              spacing="10px"
              columns={{ base: 1 }}
            >
              {(tagsSelected as PartialItem<ITag>[])?.map((tag, key) => (
                <Flex
                  // flexDirection="column"
                  justifyContent="space-between"
                  p={3}
                  alignItems="center"
                  borderBottom="1px primary"
                  bgColor="primary.300"
                  borderRadius="2xl"
                >
                  <Text fontWeight="semibold" fontSize="xl">
                    {tag.name}{' '}
                  </Text>
                  <DeleteIcon
                    cursor="pointer"
                    color="red"
                    onClick={() => props.removeTags(tag.id as number)}
                  />
                </Flex>
              ))}
            </SimpleGrid>
          </ModalBody>
        </ModalContent>
      </Modal>
      <Flex>
        <FormLabel fontWeight="bold">Tags</FormLabel>
        <Box
          onMouseEnter={() => setHoverSelected(true)}
          onMouseLeave={() => setHoverSelected(false)}
          position="relative"
          onClick={onOpen}
          fontWeight="bold"
          color={
            router.pathname.includes('user')
              ? 'gray.800'
              : hoverSelected && !router.pathname.includes('user')
              ? 'black'
              : 'white'
          }
          cursor="pointer"
          title="Voir les tags selectionnés"
        >
          {(tagsSelected as PartialItem<ITag>[])?.length > 0 && (
            <>
              <Text>Sélectionnés</Text>
              <Flex
                color={hoverSelected ? 'white' : 'black'}
                bgColor={hoverSelected ? 'black' : 'white'}
                alignItems="center"
                justifyContent="center"
                top="-2"
                right="-6"
                position="absolute"
                h="25px"
                w="25px"
                borderRadius="full"
              >
                {tagsSelected?.length}
              </Flex>
            </>
          )}
        </Box>
      </Flex>
      <Flex>
        <Input
          bgColor="white"
          color="black"
          maxW="350px"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        {!(router.pathname === '/') && tags?.length === 0 && !isLoading && (
          <Button colorScheme="secondary" ml={5} onClick={() => createTag()}>
            Ajouter Tag
          </Button>
        )}
      </Flex>
      {((tags && tags?.length > 0) || isLoading) && (
        <Box
          maxH="200px"
          overflowY="scroll"
          w="100%"
          borderRadius="lg"
          position="absolute"
          top="72px"
          bgColor="white"
          zIndex="10000"
        >
          {isLoading ? (
            <Flex
              h="25px"
              bgColor="white"
              alignItems="center"
              justifyContent="center"
            >
              {' '}
              <Spinner />{' '}
            </Flex>
          ) : (
            (tags as PartialItem<ITag>[]).map((tag) => (
              <Flex>
                <Text
                  cursor="pointer"
                  p={3}
                  bgColor="white"
                  color="black"
                  fontWeight="semibold"
                  _hover={{ color: 'primary.500' }}
                  onClick={() => {
                    props.addTags(tag.id as number);
                    setValue('');
                  }}
                >
                  {tag.name}
                </Text>
              </Flex>
            ))
          )}
        </Box>
      )}
    </FormControl>
  );
};

export default SelectTags;
