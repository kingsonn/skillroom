import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{
    auth: {
        persistSession: true, // Ensure this is set to true
        autoRefreshToken: true,
      },

 } )
}