'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '../utils/supabase/client';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function Providers({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    supabase
  };

  return (
    <Provider >
      <PersistGate loading={null} persistor={persistor}>
        <AuthContext.Provider value={value}>
          {!loading && children}
        </AuthContext.Provider>
      </PersistGate>
    </Provider>
  );
}
