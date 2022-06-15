import { PartialItem } from '@directus/sdk';
import { IAnnouncement } from '../../@types/announcement';
import { IGallery } from '../../@types/gallery';
import directus from '../../lib/directus';
import { IFile } from '../../@types/file';
import { ITagAnnounce } from '../../@types/tag_announce';
import { ITag } from '../../@types/tag';
import {
  Avatar,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { API_URL } from '../../config/config';
import { IUser } from '../../@types/user';
import Carousel from '../../components/Carousel';
import Tags from '../../components/Tags';
import { useQuery } from 'react-query';
import useDirectus from '../../hooks/useDirectus';
import Section from '../../components/Section';

const AnnouncementContent = (props: {
  announcement: PartialItem<IAnnouncement>;
}) => {
  const { announcement } = props;

  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Box p={5} w="100%" boxShadow="xl">
      <Modal size="full" isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {(announcement?.gallery as string[]).length === 1
              ? 'Image annonce'
              : 'Images annonces'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Carousel images={announcement.gallery as string[]} />
          </ModalBody>
        </ModalContent>
      </Modal>
      <Box
        cursor="pointer"
        onClick={onOpen}
        position="relative"
        h="350px"
        bgColor={
          (announcement.gallery as string[])[0] ? 'unset' : 'blackAlpha.500'
        }
      >
        {(announcement.gallery as string[])[0] ? (
          <Image
            w="100%"
            h="100%"
            src={(announcement.gallery as string[])[0]}
          />
        ) : (
          <Text fontSize="2xl" fontWeight="bold" color="white">
            Aucune image
          </Text>
        )}
        <Flex
          position="absolute"
          borderRadius="full"
          bottom="5"
          right="5"
          bgColor="blackAlpha.600"
          color="white"
          w="2rem"
          h="2rem"
          alignItems="center"
          justifyContent="center"
        >
          {announcement.gallery?.length}
        </Flex>
      </Box>
      <Heading as="h1" my={5}>
        {announcement.name}{' '}
      </Heading>
      {announcement.tags && <Tags tags={announcement.tags as string[]} />}
      <Text fontWeight="semibold" mt={5}>
        Exemplaire disponible: {announcement.quantity}
      </Text>
      <Text mt={5}>{announcement.description} </Text>
      <Text fontWeight="bold" fontSize="2xl" mt={5}>
        {' '}
        {announcement.price} €
      </Text>
    </Box>
  );
};

const UserContact = (props: {
  user: PartialItem<IUser>;
  announcementId: number;
}) => {
  const directus = useDirectus();
  const { user } = props;
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
  return (
    <Section
      ml={{ base: 0, lg: 5 }}
      h="min-content"
      w="350px"
      boxShadow="2xl"
      p={5}
    >
      <Flex alignItems="center">
        <Avatar size="lg" name={`${user?.first_name} ${user?.last_name}`} />
        <Text ml={5} fontWeight="semibold">
          {user?.first_name} {user?.last_name}{' '}
        </Text>
      </Flex>
      <Button mt={5} w="100%" variant="outline" colorScheme="secondary">
        Envoyer un message
      </Button>
      {directus?.auth?.token && (
        <Button
          as="a"
          href={`/booking/${props.announcementId}?buyerId=${currentUser?.id}&sellerId=${user.id}`}
          mt={3}
          w="100%"
          colorScheme="secondary"
        >
          Acheter
        </Button>
      )}
      {!directus?.auth?.token && (
        <Button
          as="a"
          href={`/auth/login?announcementId=${props.announcementId}&sellerId=${user.id}`}
          mt={3}
          w="100%"
          colorScheme="secondary"
        >
          Acheter
        </Button>
      )}
    </Section>
  );
};

const Announcement = (props: { announcement: PartialItem<IAnnouncement> }) => {
  return (
    <Container maxW="container.lg">
      <Flex flexDirection={{ base: 'column-reverse', lg: 'row' }}>
        <AnnouncementContent announcement={props.announcement} />
        <UserContact
          announcementId={props.announcement.id as number}
          user={props.announcement.user as PartialItem<IUser>}
        />
      </Flex>
    </Container>
  );
};

export const getStaticProps = async ({
  params,
}: {
  params: { slug: string };
}) => {
  const directusAnnouncements = directus.items('announcement');
  const announcement = await directusAnnouncements
    .readByQuery({
      fields: [
        'id',
        'name',
        'date_updated',
        'date_created',
        'description',
        'price',
        'gallery.directus_files_id.filename_disk',
        'quantity',
        'tags.tags_id.name',
        'user.email',
        'user.id',
        'user.first_name',
        'user.last_name',
      ],
      filter: {
        slug: {
          _eq: params.slug,
        },
      },
    })
    .then(
      (res) =>
        res?.data && {
          ...res.data[0],
          gallery: res.data[0].gallery?.map(
            (item) =>
              `${API_URL}/assets/${
                (
                  (item as PartialItem<IGallery>)
                    ?.directus_files_id as PartialItem<IFile>
                )?.filename_disk as string
              }`
          ),
          tags: res.data[0].tags?.map(
            (tag) =>
              ((tag as ITagAnnounce).tags_id as PartialItem<ITag>)
                .name as string
          ),
        }
    );

  if (!announcement) return { notFound: true };

  return {
    props: {
      announcement,
    },
    revalidate: 30,
  };
};

export async function getStaticPaths() {
  const announcements = await directus
    .items('announcement')
    .readByQuery({
      limit: -1,
      fields: ['slug'],
    })
    .then((res) => res.data);

  return {
    paths:
      announcements?.map((announcement: PartialItem<IAnnouncement>) => ({
        params: {
          slug: `${announcement.slug}`,
        },
      })) || [],
    fallback: 'blocking',
  };
}

export default Announcement;
