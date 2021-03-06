import {
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Image,
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
import { useEffect, useMemo, useState } from 'react';
import { IFile } from '../../../@types/file';
import useDirectus, { IMyCollections } from '../../../hooks/useDirectus';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Directus, PartialItem } from '@directus/sdk';
import { ITag } from '../../../@types/tag';
import slugify from '../../../utils/slugify';
import { format } from 'date-fns';
import { CloseIcon } from '@chakra-ui/icons';
import SelectTags from '../../SelectTags';
import { API_URL } from '../../../config/config';
import { IAnnouncement } from '../../../@types/announcement';
import { IGallery } from '../../../@types/gallery';
import { ITagAnnounce } from '../../../@types/tag_announce';

const ModalForm = (props: {
  isOpen: boolean;
  onClose: () => void;
  fetchAnnouncements: () => void;
  type: 'create' | 'update';
  announcement: PartialItem<IAnnouncement> | null;
}) => {
  const { isOpen, onClose } = props;
  const toast = useToast();
  const directus = useDirectus();
  const [createFilesIds, setCreateFilesIds] = useState<string[]>([]);
  const [deleteGalleryIds, setDeleteGalleryIds] = useState<number[]>([]);
  const [createTagsIds, setCreateTagsIds] = useState<number[]>([]);
  const [deleteTagsIds, setDeleteTagsIds] = useState<number[]>([]);
  const defaultInfos = useMemo(
    () => ({
      id: props.announcement?.id || null,
      galleryIds: props.announcement
        ? props.announcement?.gallery?.map((x) => (x as IGallery).id)
        : [],
      gallery:
        (props.announcement?.gallery as IGallery[])?.map(
          (res) =>
            `${API_URL}/assets/${
              (res.directus_files_id as IFile)?.filename_disk
            }`
        ) || ([] as string[]),
      name: props.announcement?.name || '',
      quantity: props.announcement?.quantity?.toString() || '1',
      description: props.announcement?.description || '',
      price: props.announcement?.price?.toString() || '0',
      tags:
        (props.announcement?.tags as ITagAnnounce[])?.map(
          (res) => (res.tags_id as ITag).id
        ) || ([] as PartialItem<ITag>[]),
    }),
    [props.announcement]
  );
  const [infos, setInfos] = useState(defaultInfos);

  useEffect(() => {
    setInfos(defaultInfos);
  }, [props.announcement]);

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

  const queryClient = useQueryClient();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (Number(infos.quantity) > 0 && infos.name !== '' && infos.price !== '') {
      if (props.type === 'create') {
        createAnnounce();
      } else if (props.type === 'update') {
        updateAnnouncement();
      }
    } else {
      toast({
        status: 'error',
        title:
          'Le prix le nom et la quantit?? du produit doivent ??tre correctements remplies',
      });
    }
  };

  const { data: galleryIds, mutate: createFiles } = useMutation(
    'createFiles',
    async (formDatas: FormData[]) =>
      await Promise.all(
        formDatas.map(
          async (formData) =>
            await directus
              ?.items('directus_files')
              .createOne(formData)
              .then(
                (file: any) =>
                  file && {
                    id: file.id,
                    src: `${API_URL}/assets/${file.filename_disk}`,
                  }
              )
        )
      ).then((values: { id: string; src: string }[]) => {
        setInfos({
          ...infos,
          gallery: [...infos.gallery, ...values.map((value) => value.src)],
        });
        setCreateFilesIds(values.map((value) => value.id));
        return values.map((value) => value.id);
      })
  );

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
          title: 'Votre annonce a ??t?? cr??e avec succ??s !',
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

  const handleUpdateGallery = () => ({
    create: createFilesIds?.map((id) => ({
      announcement_id: (infos.id as number)?.toString() as string,
      directus_files_id: id,
    })),
    update: [],
    delete: deleteGalleryIds,
  });

  const handleUpdateTags = () => ({
    create: createTagsIds.map((tagId) => ({
      announcement_id: (infos.id as number)?.toString() as string,
      tags_id: tagId,
    })),
    update: [],
    delete: deleteTagsIds
      ?.map((tagId) =>
        (props.announcement?.tags as PartialItem<ITagAnnounce>[]).find(
          (tagAnnounce) => (tagAnnounce.tags_id as ITag).id === tagId
        )
      )
      .map((tagAnnounce) => (tagAnnounce as PartialItem<ITagAnnounce>).id),
  });

  const { mutate: updateAnnouncement } = useMutation(
    'updateAnnouncement',
    () =>
      (directus as Directus<IMyCollections>)
        .items('announcement')
        .updateOne(infos.id as number, {
          description: infos.description,
          tags: handleUpdateTags() as any,
          gallery: handleUpdateGallery() as any,

          quantity: Math.round(Number(infos.quantity)),
          price: Math.round(Number(infos.price)),
          user: currentUser?.id,
          name: infos.name,
        }),
    {
      onSuccess: () => {
        toast({ status: 'success', title: 'Annonce mis ?? jour avec succ??s' });
        props.fetchAnnouncements();
        setInfos(defaultInfos);
        onClose();
      },
      onError: (err) => {
        console.log(err);
        toast({
          status: 'error',
          title: "Erreur lors de la mis ?? jour de l'annonce",
        });
      },
    }
  );

  return (
    <Modal size="5xl" isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>Cr??ation d'annonce</ModalHeader>
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
              <Flex flexDirection={{ base: 'column', md: 'row' }}>
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
                      const formDatas: FormData[] = Object.values(
                        e.target.files as FileList
                      ).map((file) => {
                        const formData = new FormData();
                        formData.append('file', file as any);
                        return formData;
                      });
                      createFiles(formDatas);
                    }}
                  />
                </Box>
                <SimpleGrid
                  mb={10}
                  columns={{ base: 1, sm: 2, lg: 4 }}
                  spacing={10}
                >
                  {infos.gallery?.map((src, key) => (
                    <Box key={key} position="relative" maxH="150px" maxW="90px">
                      <Image
                        src={src}
                        alt={`Image num??ro pour annonce`}
                        h="100%"
                        w="100%"
                      />
                      <CloseIcon
                        cursor="pointer"
                        position="absolute"
                        top="-3"
                        right="-3"
                        ml={3}
                        fontSize="sm"
                        onClick={() => {
                          setInfos({
                            ...infos,
                            gallery: infos.gallery.filter((res) => res !== src),
                          });
                          setDeleteGalleryIds(
                            (
                              (props.announcement as PartialItem<IAnnouncement>)
                                .gallery as PartialItem<IGallery>[]
                            )
                              .filter(
                                (res) =>
                                  !infos.gallery
                                    .filter((res) => res !== src)
                                    .includes(
                                      `${API_URL}/assets/${
                                        (res.directus_files_id as IFile)
                                          .filename_disk as string
                                      }`
                                    )
                              )
                              .map((x) => x.id as number)
                          );
                        }}
                      />
                    </Box>
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
                setCreateTagsIds([...createTagsIds, id]);
              }}
              removeTags={(id: number) => {
                setInfos({
                  ...infos,
                  tags: infos.tags.filter((tagId) => tagId !== id),
                });
                setDeleteTagsIds([...deleteTagsIds, id]);
              }}
            />

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
                <InputRightAddon children="???" />
              </InputGroup>
            </FormControl>
          </Box>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="secondary" type="submit">
            {props.type === 'create'
              ? 'Cr??er mon annonce'
              : 'Mettre ?? jour mon annonce'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalForm;
