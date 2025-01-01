'use client';
import { createClient } from '../utils/supabase/client';

export async function signInWithEmail(email, password) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (data?.user) {
    localStorage.setItem('userEmail', data.user.email);
  }
  
  return { data, error };
}

export async function signInWithGoogle() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  });
  console.log(data)
  return { data, error };
}

export async function signout() {
  const supabase = createClient();
  localStorage.removeItem('userEmail');
  return await supabase.auth.signOut();
}

export async function signup(email, password) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (data?.user) {
    localStorage.setItem('userEmail', data.user.email);
  }
  
  return { data, error };
}
