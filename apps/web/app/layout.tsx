import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ground0 | AI-Powered Proof of Physical Work Platform',
  description:
    'Verify the Work. Reveal the Reality. Autonomous physical infrastructure auditing connecting citizens, authorities, field workers, and AI verification.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#08080A] text-[#E2E8F0]">
        {children}
      </body>
    </html>
  );
}
