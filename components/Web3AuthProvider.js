'use client';

import { Web3AuthContextProvider } from '../context/Web3AuthContext';

export function Web3AuthProvider({ children }) {
  return <Web3AuthContextProvider>{children}</Web3AuthContextProvider>;
}