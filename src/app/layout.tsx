import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { MainNav } from '@/components/main-nav';

export const metadata: Metadata = {
  title: 'ModuleTrack',
  description: 'Track and manage your modules with ease.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen bg-background">
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-40 w-full border-b bg-card">
            <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
              <MainNav
                items={[
                  {
                    title: 'Dashboard',
                    href: '/',
                  },
                  {
                    title: 'Reports',
                    href: '#',
                  },
                  {
                    title: 'Settings',
                    href: '#',
                  },
                ]}
              />
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
