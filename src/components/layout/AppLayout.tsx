import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface AppLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

/**
 * AppLayout — الـ Layout الموحد لجميع صفحات المنصة
 * يشمل: Navbar ثابت + محتوى الصفحة + Footer
 */
export default function AppLayout({ children, showFooter = true }: AppLayoutProps) {
  return (
    <>
      <Navbar />
      <main className="main-content">
        {children}
      </main>
      {showFooter && <Footer />}
    </>
  );
}
