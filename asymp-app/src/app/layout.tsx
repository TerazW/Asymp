import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'Asymp - Operational Coordination for the Agent Era',
  description: 'Help humans coordinate at agent speed',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-[#0a0a0f]">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
