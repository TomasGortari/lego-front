import {
  Box,
  Button,
  ButtonProps,
  Container,
  Flex,
  HStack,
  Input,
  useNumberInput,
  InputProps,
  Image,
  Text,
  chakra,
  useToast,
} from '@chakra-ui/react';
import { Directus, PartialItem } from '@directus/sdk';
import { loadStripe } from '@stripe/stripe-js';
import { useRouter } from 'next/router';
import {
  Dispatch,
  ReactEventHandler,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import { IAnnouncement } from '../../@types/announcement';
import { IFile } from '../../@types/file';
import { IGallery } from '../../@types/gallery';
import { ITag } from '../../@types/tag';
import { ITagAnnounce } from '../../@types/tag_announce';
import { API_URL } from '../../config/config';
import useDirectus, { IMyCollections } from '../../hooks/useDirectus';
import directus from '../../lib/directus';
import { useMutation } from 'react-query';
import { IBooking } from '../../@types/booking';
import axios from 'axios';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

const Product = (props: {
  quantity: number;
  setQuantity: Dispatch<SetStateAction<number>>;
  maxQuantity: number;
  image: string;
  name: string;
}) => {
  const { getInputProps, getIncrementButtonProps, getDecrementButtonProps } =
    useNumberInput({
      step: 1,
      value: props.quantity,
      min: 1,
      max: props.maxQuantity,
    });

  const inc: ButtonProps = getIncrementButtonProps();
  const dec: ButtonProps = getDecrementButtonProps();
  const input: InputProps = getInputProps();

  return (
    <Box mr={5} boxShadow="xl" p={3} mt={5}>
      <Flex flexDirection={{ base: 'column', md: 'row' }} alignItems="center">
        <Box minH="150px" minW="250px" overflow="hidden" borderRadius="2xl">
          <Image
            h="100%"
            w="100%"
            objectFit="cover"
            src={props.image}
            alt={`Image du produit ${props.name}`}
          />
        </Box>

        <Box maxW="200px">
          <Text>
            Disponibles:{' '}
            <chakra.strong fontSize="xl">{props.maxQuantity}</chakra.strong>{' '}
          </Text>

          <HStack mt={5}>
            <Button
              onClick={() => {
                if (props.quantity > 1) {
                  props.setQuantity(props.quantity - 1);
                }
              }}
              {...dec}
            >
              -
            </Button>
            <Button
              onClick={() => {
                if (props.quantity < 3) {
                  props.setQuantity(props.quantity + 1);
                }
              }}
              {...inc}
            >
              +
            </Button>
            <Input minW="50px" {...input} />
          </HStack>
        </Box>
      </Flex>
      <Flex mt={5} alignItems="center" fontWeight="semibold">
        <Text minW="35px">{props.quantity} x</Text>
        <Text ml={3}>{props.name}</Text>
      </Flex>
    </Box>
  );
};

const RecapCard = (props: {
  quantity: number;
  name: string;
  price: number;
}) => {
  return (
    <Flex
      flexDirection="column"
      minH="250px"
      justifyContent="space-between"
      p={3}
      boxShadow="xl"
    >
      <Flex alignItems="center">
        <Text my={5}>
          {props.quantity} x {props.name}
        </Text>
        <Text fontWeight="bold">{props.price} EUR </Text>
      </Flex>
      <Button type="submit" colorScheme="secondary">
        Acheter
      </Button>
    </Flex>
  );
  Flex;
};

const Booking = (props: { announcement: IAnnouncement }) => {
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();
  const directus = useDirectus();
  const toast = useToast();

  const { mutate: checkoutSessions, data: bookingData } = useMutation(
    'checkoutSessions',
    (booking: PartialItem<IBooking>) => {
      console.log('bookingdata', booking);
      return axios.post(`/api/checkout_sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/html',
        },
        booking,
      });
    }
  );

  useEffect(() => {
    if (bookingData) {
      console.log(bookingData);
      window.location.href = (bookingData as any).data.url;
    }
  }, [bookingData]);
  const { mutate: createBooking } = useMutation(
    'createBooking',
    () =>
      (directus as Directus<IMyCollections>)?.items('booking').createOne({
        name: props.announcement.name,
        quantity,
        buyer: router.query.buyerId as string,
        seller: router.query.sellerId as string,
        price_unity: props.announcement.price as number,
      }),
    {
      onSuccess: (data) => {
        console.log(data?.price_unity);
        if (data?.id) {
          checkoutSessions(data);
        }
      },
      onError: () => {
        toast({
          status: 'error',
          title: "Une erreur est survenue impossible de proceder à l'achat",
        });
      },
    }
  );

  useEffect(() => {
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search);
    if (query.get('success')) {
      console.log('Order placed! You will receive an email confirmation.');
    }

    if (query.get('canceled')) {
      console.log(
        'Order canceled -- continue to shop around and checkout when you’re ready.'
      );
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('preprice', props.announcement.price);
    createBooking();
  };

  return (
    <chakra.form onSubmit={handleSubmit}>
      <Flex
        flexDirection={{ base: 'column', md: 'row' }}
        as={Container}
        maxW="container.md"
      >
        <Product
          quantity={quantity}
          maxQuantity={props.announcement.quantity}
          setQuantity={setQuantity}
          image={props.announcement.gallery[0] as string}
          name={props.announcement.name}
        />
        <RecapCard
          price={props.announcement.price}
          quantity={quantity}
          name={props.announcement.name}
        />
      </Flex>
    </chakra.form>
  );
};

export const getStaticProps = async ({
  params,
}: {
  params: { id: number };
}) => {
  const directusAnnouncements = directus.items('announcement');
  const announcement = await directusAnnouncements
    .readByQuery({
      fields: [
        'id',
        'name',
        'description',
        'price',
        'gallery.directus_files_id.filename_disk',
        'quantity',
        'tags.tags_id.name',
        'user.email',
        'user.first_name',
        'user.last_name',
      ],
      filter: {
        id: {
          _eq: params.id,
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
      fields: ['id'],
    })
    .then((res) => res.data);

  return {
    paths:
      announcements?.map((announcement: PartialItem<IAnnouncement>) => ({
        params: {
          id: `${announcement.id}`,
        },
      })) || [],
    fallback: 'blocking',
  };
}

export default Booking;
