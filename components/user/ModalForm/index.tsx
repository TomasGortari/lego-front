import {
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightAddon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import { IFile } from '../../../@types/file';
import useDirectus, { IMyCollections } from '../../../hooks/useDirectus';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Directus, PartialItem } from '@directus/sdk';
import { ITag } from '../../../@types/tag';
import slugify from '../../../utils/slugify';
import { format } from 'date-fns';
import { CloseIcon } from '@chakra-ui/icons';
import SelectTags from '../../SelectTags';

const ModalForm = (props: {
  isOpen: boolean;
  onClose: () => void;
  fetchAnnouncements: () => void;
}) => {
  const { isOpen, onClose } = props;
  const toast = useToast();
  const directus = useDirectus();
  const defaultInfos = {
    gallery: [] as any[],
    name: '',
    quantity: '1',
    description: '',
    price: '0',
    tags: [] as number[],
  };
  const [infos, setInfos] = useState(defaultInfos);

  const { data: currentUser } = useQuery(
    ['getMe', directus],
    () =>
      directus?.users.me.read({
        fields: ['id'],
      }),
    {
      enabled: Boolean(directus?.auth?.token),
    }
  );
  const [searchTag, setSearchTag] = useState('');
  const [newTag, setNewTag] = useState('');
  const [tagsSelectedState, setTagsSelectedState] = useState<
    PartialItem<ITag>[] | null | undefined
  >();
  const [selectingTags, setSelectingTags] = useState(false);
  const queryClient = useQueryClient();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formDatas: FormData[] = infos.gallery.map((file, key) => {
      const formData = new FormData();
      formData.append('title', (file as any).name.slice(0, -4));
      formData.append('file', file as any);
      return formData;
      //  createFile(formData);
      // console.log(key, createFile(formData));
      // setGallery([
      //   ...gallery,
      //   ((createFile(formData) as any).data as PartialItem<FileItem>).id,
      // ]);
    });

    await createFiles(formDatas);

    if (Number(infos.quantity) > 0 && infos.name !== '' && infos.price !== '') {
      await createAnnounce();
    } else {
      toast({
        status: 'error',
        title:
          'Le prix le nom et la quantité du produit doivent être correctements remplies',
      });
    }
  };
  // const { data: tags, refetch: refetchTags } = useQuery<
  //   PartialItem<ITag>[] | null | undefined
  // >(['getTags', directus, searchTag], () =>
  //   (directus as Directus<IMyCollections>)
  //     ?.items('tags')
  //     .readByQuery({
  //       fields: ['name', 'id'],
  //       filter:
  //         searchTag !== ''
  //           ? {
  //               name: {
  //                 _contains: searchTag.toLowerCase(),
  //               },
  //             }
  //           : {},
  //       limit: 20,
  //     })
  //     .then((res) => res.data)
  // );

  // const { data: tagsSelected } = useQuery<
  //   PartialItem<ITag>[] | null | undefined
  // >(
  //   ['getTags', infos.tags],
  //   () =>
  //     (directus as Directus<IMyCollections>)
  //       ?.items('tags')
  //       .readMany(infos.tags, {
  //         fields: ['name', 'id'],
  //       })
  //       .then((res) => res.data),
  //   {
  //     onSuccess: (data) => {
  //       setTagsSelectedState(data);
  //     },
  //     enabled: infos.tags.length > 0,
  //   }
  // );

  const { data: galleryIds, mutate: createFiles } = useMutation(
    'createFiles',
    async (formDatas: FormData[]) =>
      await Promise.all(
        formDatas.map(
          async (formData) =>
            await directus
              ?.items('directus_files')
              .createOne(formData)
              .then((file: any) => file?.id && file.id)
        )
      ).then((values) => values)

    // {
    //   onSuccess: (data: any) => {
    //     setGallery(data);
    //   },
    // }
  );

  // const { mutate: createTag } = useMutation(
  //   'createTag',
  //   () =>
  //     (directus as Directus<IMyCollections>).items('tags').createOne({
  //       name: newTag.toLowerCase(),
  //     }),
  //   {
  //     onSuccess: () => {
  //       toast({
  //         status: 'success',
  //         title:
  //           "Votre tag a bel est bien été crée rechercher pour les sélctionner à l'aide de la barre de recherche",
  //       });
  //       setNewTag('');
  //       refetchTags();
  //     },
  //     onError: () => {
  //       toast({
  //         status: 'error',
  //         title: 'Une erreur est survenue lors de la cration de votre tag',
  //       });
  //     },
  //   }
  // );

  const { mutate: createAnnounce } = useMutation(
    'createAnnounce',
    () =>
      (directus as Directus<IMyCollections>).items('announcement').createOne({
        description: infos.description,
        tags: {
          create: infos.tags.map((tag) => ({
            announcement_id: '+',
            tags_id: tag,
          })),
        } as any,
        gallery: {
          create: galleryIds?.map((id) => ({
            announcement_id: '+',
            directus_files_id: id,
          })),
        } as any,
        quantity: Math.round(Number(infos.quantity)),
        price: Math.round(Number(infos.price)),
        user: currentUser?.id,
        name: infos.name,
        slug: `${slugify(infos.name)}-${format(
          new Date(),
          "yyyy-MM-dd'T'HH:mm:ss"
        )}`,
      }),
    {
      retry: !Boolean(galleryIds),
      onSuccess: async (data) => {
        queryClient.invalidateQueries('createFiles');
        toast({
          status: 'success',
          title: 'Votre annonce a été crée avec succès !',
        });
        onClose();
        setInfos(defaultInfos);
        props.fetchAnnouncements();
      },
      onError: () => {
        toast({
          status: 'error',
          title: 'Une erreur est survenue lors de la cration de votre annonce',
        });
      },
    }
  );

  const handleClick = (id: number) => {
    setInfos({ ...infos, tags: [...infos.tags, id] });
    setSearchTag('');
  };

  const handleTagSelectClick = (id: number) => {
    setInfos({ ...infos, tags: infos.tags.filter((tagId) => tagId !== id) });
  };

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
              <Text fontWeight="semibold">Images produit </Text>
              <Flex>
                <Box>
                  <FormLabel
                    m={5}
                    fontWeight="bold"
                    color="white"
                    w="11rem"
                    bgColor="black"
                    borderRadius="full"
                    p={2}
                    htmlFor="upload-image"
                    cursor="pointer"
                  >
                    Selectionner images
                  </FormLabel>
                  <Input
                    opacity={0}
                    id="upload-image"
                    multiple
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={async (e) => {
                      // if (gallery.length > 0) {
                      //   setGallery([]);
                      // }
                      setInfos({
                        ...infos,
                        gallery: [
                          ...infos.gallery.filter((res) => {
                            return !Object.values(e.target.files as FileList)
                              .map((x) => x.name)
                              .includes(res.name);
                          }),
                          ...Object.values(e.target.files as FileList),
                        ],
                      });
                    }}
                  />
                </Box>
                <SimpleGrid
                  ml={5}
                  mb={10}
                  columns={{ base: 1, lg: 2 }}
                  spacing={5}
                >
                  {infos.gallery?.map((file, key) => (
                    <Flex alignItems="center">
                      <Text fontWeight="semibold">{file?.name}</Text>
                      <CloseIcon
                        cursor="pointer"
                        ml={3}
                        onClick={() =>
                          setInfos({
                            ...infos,
                            gallery: infos.gallery.filter(
                              (res) => res !== file
                            ),
                          })
                        }
                      />
                    </Flex>
                  ))}
                </SimpleGrid>
              </Flex>
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
            <SelectTags
              tags={infos.tags}
              addTags={(id: number) => {
                setInfos({ ...infos, tags: [...infos.tags, id] });
              }}
              removeTags={(id: number) => {
                setInfos({
                  ...infos,
                  tags: infos.tags.filter((tagId) => tagId !== id),
                });
              }}
            />
            {/* <FormControl mb={5}>
              <FormLabel fontWeight="semibold">
                Tags à associer aux produit
              </FormLabel>

              <Box m="auto" width="container.md">
                {infos.tags.length > 0 && (
                  <Box my={5}>
                    <Text fontWeight="semibold">Selections</Text>

                    <Flex>
                      <Stack
                        alignItems="flex-end"
                        flexDirection="row"
                        flexWrap="wrap"
                        gap={3}
                        my={3}
                      >
                        {tagsSelectedState?.map((tag, key) => (
                          <Badge
                            cursor="pointer"
                            ml={2}
                            borderRadius="2xl"
                            w="min-content"
                            p={2}
                            key={key}
                            color="white"
                            bgColor="black"
                            onClick={(e) =>
                              tag.id && handleTagSelectClick(tag.id)
                            }
                          >
                            {tag.name}
                          </Badge>
                        ))}
                        {selectingTags && (
                          <Button
                            variant="outline"
                            onClick={() => setSelectingTags(false)}
                            mt={5}
                            borderRadius="full"
                            colorScheme="secondary"
                          >
                            Valider la séléction
                          </Button>
                        )}
                      </Stack>
                    </Flex>
                  </Box>
                )}
                {selectingTags && (
                  <>
                    {' '}
                    <Input
                      placeholder="Rechercher tags"
                      value={searchTag}
                      onChange={(e) => setSearchTag(e.target.value)}
                    />
                    <Box my={5}>
                      <Stack
                        alignItems="flex-end"
                        flexDirection="row"
                        flexWrap="wrap"
                        gap={3}
                        my={3}
                      >
                        {(
                          tags?.filter(
                            (res) => res.id && !infos.tags.includes(res.id)
                          ) as PartialItem<ITag>[]
                        )?.map((tag, key) => (
                          <Badge
                            cursor="pointer"
                            ml={2}
                            borderRadius="2xl"
                            w="min-content"
                            p={2}
                            key={key}
                            onClick={() => tag.id && handleClick(tag.id)}
                            colorScheme="primary"
                          >
                            {tag.name}
                          </Badge>
                        ))}
                      </Stack>
                      <Text fontWeight="semibold">Ajouter un nouveau tag</Text>
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                      />
                      <Button
                        mt={5}
                        width="75px"
                        onClick={() => {
                          if (newTag !== '') createTag();
                        }}
                        colorScheme="secondary"
                        borderRadius="full"
                      >
                        Ajouter{' '}
                      </Button>
                    </Box>
                  </>
                )}
              </Box>
              {!selectingTags && (
                <Button
                  mt={5}
                  onClick={() => setSelectingTags(true)}
                  borderRadius="full"
                  colorScheme="secondary"
                >
                  Sélectionner tags{' '}
                </Button>
              )}
            </FormControl> */}
            <FormControl mb={5}>
              <FormLabel fontWeight="semibold">Prix</FormLabel>
              <InputGroup>
                <Input
                  width="10rem"
                  type="number"
                  value={infos.price}
                  onChange={(e) =>
                    setInfos({ ...infos, price: e.target.value })
                  }
                />
                <InputRightAddon children="€" />
              </InputGroup>
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

export default ModalForm;
