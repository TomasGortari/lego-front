import { NextSeoProps } from 'next-seo';

const DefaultSEOConfig: NextSeoProps = {
  defaultTitle:
    'Bienvenue sur le site où vous pouvez trouver et vendre tout types de legos collector ou autre',
  titleTemplate: '%s - LeGold',
  description:
    'Consultez ou postez des annonces afin de trouver ou vendre des legos à un prix qui vous correspond',
  openGraph: {
    type: 'website',
    title: 'LeGold',
    description:
      'Consultez ou postez des annonces afin de trouver ou vendre des legos à un prix qui vous correspond',
    images: [
      {
        url: 'https://www.legold.com/logo.png',
        alt: 'sblort',
      },
    ],
  },
  twitter: {
    handle: '@handle',
    site: '@site',
    cardType: 'summary_large_image',
  },
};

export default DefaultSEOConfig;
