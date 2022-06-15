import { Box, Button, Flex, Heading, Text, useToast } from '@chakra-ui/react';
import { Directus } from '@directus/sdk';
import { useRouter } from 'next/router';
import { useEffect, useMemo } from 'react';
import { useMutation } from 'react-query';
import H1 from '../../components/H1';
import Section from '../../components/Section';
import useDirectus, { IMyCollections } from '../../hooks/useDirectus';

const Header = () => (
  <Flex
    p={'80px'}
    mb={200}
    color="white"
    alignItems="center"
    justifyContent="center"
    bgGradient="linear(to-b, primary.500, primary.400)"
  >
    <H1>Confirmation</H1>
  </Flex>
);

const Confirmation = () => {
  const directus = useDirectus();
  const router = useRouter();
  const toast = useToast();
  const statusBooking = useMemo(
    () =>
      router.query.success
        ? 'success'
        : router.query.canceled
        ? 'canceled'
        : null,
    [router.query]
  );
  const bookingId = Number(router.query.bookingId);

  const { mutate: updateBooking } = useMutation(
    'updateBooking',
    (status: string) =>
      (directus as Directus<IMyCollections>)
        ?.items('booking')
        .updateOne(bookingId, {
          status,
        }),
    {
      onSuccess: () => {
        toast({
          status: 'success',
          title: 'Félicitation votre achat est confirmé ',
        });
      },
      onError: () => {
        toast({
          status: 'error',
          title:
            'Une erreur est survenue lors de la mis à jour de votre achat veuillez contacter le service client afin de confirmer votre commande',
        });
      },
    }
  );

  useEffect(() => {
    if (statusBooking) {
      updateBooking({ success: 'validate', canceled: 'cancel' }[statusBooking]);
    }
  }, [statusBooking]);

  return (
    <Box>
      <Header />
      <Section p={10} textAlign="center">
        {statusBooking === 'success' && (
          <>
            <Heading>Votre achat est confirmé !</Heading>
            <Text mt={5}>
              Veuillez prendre contact avec le vendeur pour l'échange du produit
              en cas de problème nous restons disponibles
            </Text>
          </>
        )}
        {statusBooking === 'canceled' && (
          <>
            <Heading>Erreur de lors du payment</Heading>
            <Text mt={5}>
              L'achat ne sais pas correctement déroulé veuillez réessayer le
              processus d'achat
            </Text>
          </>
        )}
        <Button mt={5} as="a" colorScheme="secondary" href="/">
          Retour à l'accueil
        </Button>
      </Section>
    </Box>
  );
};

export default Confirmation;
