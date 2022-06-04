import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import Head from 'next/head';
import { appTheme } from '../theme';
import './assets/css/index.css';
import Layout from '../components/layout';
import DefaultSEOConfig from '../config/seo';
import { DefaultSeo } from 'next-seo';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={appTheme}>
      <QueryClientProvider client={queryClient}>
        <Head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0,user-scalable=no"
          />
        </Head>
        <Layout>
          <DefaultSeo {...DefaultSEOConfig} />
          <Component {...pageProps} />
        </Layout>
      </QueryClientProvider>
    </ChakraProvider>
  );
}

export default MyApp;
