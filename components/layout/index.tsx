import React from 'react';
import { HEADER_HEIGHT } from '../../theme';
import { BoxProps } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
const Navbar = dynamic(() => import('./Navbar'));
const Footer = dynamic(() => import('./Footer'));

const Layout = (props: { children: any } & BoxProps) => {
  return (
    <React.Fragment>
      <header>
        <Navbar {...props} />
      </header>
      <main>{props.children}</main>
      <footer>
        <Footer {...props} />
      </footer>
    </React.Fragment>
  );
};

export default Layout;
