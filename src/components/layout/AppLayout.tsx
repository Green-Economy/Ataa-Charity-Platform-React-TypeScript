import React from 'react';
import { useLocation } from 'wouter';
import Navbar from './Navbar';
import Footer from './Footer';

interface AppLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

const NO_FOOTER_PATHS = [
  '/dashboard',
  '/user-dashboard',
  '/admin',
  '/settings',
  '/notifications',
];
export default function AppLayout({ children, showFooter }: AppLayoutProps) {
  const [location] = useLocation();

  const shouldShowFooter =
    showFooter !== undefined
      ? showFooter
      : !NO_FOOTER_PATHS.some(p => location === p || location.startsWith(p + '/'));

  return (
    <>
      <Navbar />
      <main className="main-content">
        {children}
      </main>
      {shouldShowFooter && <Footer />}
    </>
  );
}