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

export async function checkProfileExists(userId, fullName) {
  console.log('Checking profile exists for user:', userId);
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', userId)
      .maybeSingle();
    
    if (error) throw error;

    if (!data) {
      // Profile doesn't exist, create it
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([{ 
          email: userId, 
          full_name: fullName, 
          first_time: true 
        }])
        .select()
        .single();
      
      if (insertError) {
        console.error('Error creating profile:', insertError);
        return { exists: false, error: insertError };
      }
      
      return { exists: false, error: null };
    }
    
    return { exists: true, error: null };
  } catch (error) {
    console.error('Error in checkProfileExists:', error);
    return { exists: false, error };
  }
}
