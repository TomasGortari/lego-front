import {
  Container,
  Flex,
  FormControl,
  FormLabel,
  Input,
  SimpleGrid,
  Spinner,
  chakra,
  Button,
} from '@chakra-ui/react';
import { Dispatch, SetStateAction, useState } from 'react';
import { PartialItem } from '@directus/sdk';
import { IAnnouncement } from '../@types/announcement';
import axios from 'axios';
import { API_URL } from '../config/config';
import { useQuery } from 'react-query';
import Announcement from './announcement/[slug]';
import AnnouncementCard from '../components/AnnouncementCard';
import SelectTags from '../components/SelectTags';
import qs from 'query-string';

interface ISearch {
  name: string;
  minPrice: number | null;
  maxPrice: number | null;
  tags: number[];
}

const SearchBar = (props: {
  search: ISearch;
  setSearch: Dispatch<SetStateAction<ISearch>>;
  fetchSearch: () => void;
}) => {
  const [infos, setInfos] = useState<ISearch>({
    tags: [],
    minPrice: null,
    maxPrice: null,
    name: '',
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    props.setSearch(infos);
    props.fetchSearch();
  };

  return (
    <chakra.form onSubmit={handleSubmit}>
      <SimpleGrid
        bgColor="primary.500"
        padding={5}
        columns={{ base: 1, md: 2, lg: 5 }}
        autoColumns="auto"
        spacing={10}
        justifyContent="space-between"
        color="white"
        borderRadius="2xl"
        alignItems="flex-end"
      >
        <FormControl>
          <FormLabel fontWeight="bold">Nom du produit</FormLabel>
          <Input
            color="black"
            bgColor="white"
            value={infos.name}
            onChange={(e) => setInfos({ ...infos, name: e.target.value })}
          />
        </FormControl>
        <SelectTags
          tags={infos.tags}
          addTags={(tagId: number) =>
            setInfos({ ...infos, tags: [...infos.tags, tagId] })
          }
          removeTags={(tagId) =>
            setInfos({ ...infos, tags: infos.tags.filter((x) => x !== tagId) })
          }
        />
        <FormControl>
          <FormLabel fontWeight="bold">Prix minimum</FormLabel>
          <Input
            color="black"
            bgColor="white"
            placeholder="0"
            value={infos.minPrice || ''}
            type="number"
            onChange={(e) => {
              setInfos({
                ...infos,
                minPrice: Number(e.target.value),
              });
            }}
          />
        </FormControl>
        <FormControl>
          <FormLabel fontWeight="bold">Prix maximum</FormLabel>
          <Input
            color="black"
            bgColor="white"
            value={infos.maxPrice || ''}
            type="number"
            onChange={(e) =>
              setInfos({ ...infos, maxPrice: Number(e.target.value) })
            }
          />
        </FormControl>
        <Button type="submit" colorScheme="secondary">
          Rechercher
        </Button>
      </SimpleGrid>
    </chakra.form>
  );
};

const Announcements = (props: {
  announcements: PartialItem<IAnnouncement>[];
}) => {
  return (
    <SimpleGrid as={Container} maxW="container.md" spacing={10} columns={1}>
      {props.announcements.map((announcement, key) => (
        <AnnouncementCard announcement={announcement} />
      ))}
    </SimpleGrid>
  );
};

const Home = () => {
  const [search, setSearch] = useState<ISearch>({
    tags: [],
    minPrice: 0,
    maxPrice: null,
    name: '',
  });

  const {
    data: announcements,
    isLoading,
    refetch: fetchSearch,
  } = useQuery<PartialItem<IAnnouncement>[]>(
    ['getAnnouncements', search],
    (query) =>
      axios
        .get(
          `${API_URL}/search${
            '?' + qs.stringify(search, { arrayFormat: 'bracket' })
          }`
        )
        .then((res) => res.data.data)
  );

  return (
    <Container maxW="container.lg">
      <SearchBar
        fetchSearch={fetchSearch}
        search={search}
        setSearch={setSearch}
      />
      ;
      {announcements && !isLoading && (
        <Announcements announcements={announcements} />
      )}
      {isLoading && (
        <Flex alignItems="center" justifyContent="center">
          {' '}
          <Spinner />{' '}
        </Flex>
      )}
    </Container>
  );
};

export default Home;
