import React from 'react';

interface ChatLayoutProps {
  children: React.ReactNode;
}

/**
 * ChatLayout — Layout خاص بصفحة الشات
 * Full Screen Experience بدون Navbar أو Footer
 */
export default function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <div className="chat-layout-root">
      {children}
    </div>
  );
}
