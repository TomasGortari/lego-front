import { Badge, Box, Flex, Image, Stack, Text } from '@chakra-ui/react';
import { PartialItem } from '@directus/sdk';
import { IAnnouncement } from '../../@types/announcement';
import { ITagAnnounce } from '../../@types/tag_announce';

import NextLink from 'next/link';
import { IFile } from '../../@types/file';
import { API_URL } from '../../config/config';
import { IGallery } from '../../@types/gallery';
import { ITag } from '../../@types/tag';
import useDirectus from '../../hooks/useDirectus';
import { DeleteIcon } from '@chakra-ui/icons';
import { IUser } from '../../@types/user';
import Tags from '../Tags';

const AnnouncementCard = (props: {
  announcement: PartialItem<IAnnouncement>;
}) => {
  const { announcement } = props;
  const directus = useDirectus();

  return (
    <NextLink href={`/announcement/${announcement.slug}`} passHref>
      <Flex
        p={3}
        boxShadow="xl"
        borderRadius="2xl"
        flexDirection={{ base: 'column', md: 'row' }}
        as="a"
      >
        <Flex
          alignItems="center"
          justifyContent="center"
          bgColor={
            Boolean((announcement.gallery as IGallery[])[0])
              ? 'unset'
              : 'blackAlpha.500'
          }
          borderRadius="2xl"
          w={{ base: '100%', md: '40%' }}
          minH="200px"
        >
          {Boolean((announcement.gallery as IGallery[])[0]) ? (
            <Image
              src={`${API_URL}/assets/${
                (
                  (announcement.gallery as IGallery[])[0]
                    ?.directus_files_id as PartialItem<IFile>
                ).filename_disk
              }`}
              alt={`Image annonce de ${announcement.name}`}
            />
          ) : (
            <Text fontWeight="bold" fontSize="xl" color="white">
              Aucune Image
            </Text>
          )}
        </Flex>
        <Box ml={5} w={{ base: '100%', md: '60%' }}>
          <Text mr={10} fontWeight="semibold">
            {announcement.name}
          </Text>
          <Text>
            {`${
              (announcement.user as PartialItem<IUser>).first_name &&
              (announcement.user as PartialItem<IUser>).last_name
                ? `${(announcement.user as PartialItem<IUser>).first_name} ${
                    (announcement.user as PartialItem<IUser>).last_name
                  }`
                : (announcement.user as PartialItem<IUser>).email
            } 
            `}{' '}
          </Text>
          {announcement.tags && (
            <Tags
              tags={(announcement.tags as ITagAnnounce[]).map(
                (tag: PartialItem<ITag>) =>
                  (
                    (tag as PartialItem<ITagAnnounce>)
                      .tags_id as PartialItem<ITag>
                  ).name as string
              )}
            />
          )}

          <Text>
            {announcement.quantity}{' '}
            {announcement.quantity === 1 ? 'exemplaire' : 'exemplaires'}
          </Text>
          <Text textAlign="right" fontSize="2xl" fontWeight="bold">
            {announcement.price} €
          </Text>
        </Box>
      </Flex>
    </NextLink>
  );
};

export default AnnouncementCard;
