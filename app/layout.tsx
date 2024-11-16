import './globals.css';

import { Analytics } from '@vercel/analytics/react';
import { UserProvider } from '@auth0/nextjs-auth0/client';

export const metadata = {
  title: "VolleyMate",
  description: "An application built to manage volleyball games.",
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <UserProvider>
        <body className="flex min-h-screen w-full flex-col">{children}</body>
      </UserProvider>
      <Analytics />
    </html>
  );
}
