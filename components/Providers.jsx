'use client';

import { ThemeProvider } from '../context/ThemeContext';
import { Web3AuthProvider } from './Web3AuthProvider';

export function Providers({ children }) {
  return (
    <ThemeProvider attribute="class">
      <Web3AuthProvider>
        {children}
      </Web3AuthProvider>
    </ThemeProvider>
  );
}