import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { AIChatWidget } from '@/components/ai/AIChatWidget';

interface LayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export function Layout({ children, showFooter = true }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Header />
      <main className="flex-1">{children}</main>
      {showFooter && <Footer />}
      <AIChatWidget />
    </div>
  );
}
