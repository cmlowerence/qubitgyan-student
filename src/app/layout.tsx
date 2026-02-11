import type { Metadata } from 'next';
import './globals.css';
import { UiProvider } from '@/components/providers/ui-provider';
import { AuthProvider } from '@/context/auth-context';

export const metadata: Metadata = {
  title: 'Qubitgyan Student Portal',
  description: 'Advanced Learning Management System',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans">
        <AuthProvider>
          <UiProvider>{children}</UiProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
