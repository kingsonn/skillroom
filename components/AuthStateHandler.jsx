'use client';

import { useEffect } from 'react';
import { createClient } from '../utils/supabase/client';

export function AuthStateHandler() {
  const supabase = createClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user?.email) {
          localStorage.setItem('userEmail', session.user.email);
        }
        // Removed the else if condition to keep email in localStorage
      }
    );

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        localStorage.setItem('userEmail', session.user.email);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return null;
}
