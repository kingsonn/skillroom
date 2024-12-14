'use client';

import Providers from '@/components/Providers';
import Layout from '@/components/Layout';
import AuthStateHandler from '@/components/AuthStateHandler';

export default function ClientLayout({ children }) {
  return (
    <Providers>
      <AuthStateHandler />
      <Layout>{children}</Layout>
    </Providers>
  );
}
