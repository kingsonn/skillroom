import { createClient } from './supabase/client';

export async function ensureUserProfile(email) {
  const supabase = createClient();

  try {
    // First check if the profile exists
    const { data, error} = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
    
    // if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is the error code for no rows returned
    //   console.error('Error checking profile:', fetchError);
    //   return { error: fetchError };
    // }

    // If profile doesn't exist, create it
    if (data.length === 0) {
      const { error } = await supabase
        .from('profiles')
        .insert([{ email }])
        .single()
    }

    // return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { error };
  }
}

// export async function checkNew(email) {
//   const supabase = createClient();

//   try {
//     const { data, error} = await supabase
//     .from('profiles')
//     .select('first_time')
//     .eq('email', email)
//     .single()

//   console.log(data)
//   return data
//   }
//   catch(error){
//     console.error('Unexpected error:', error);
//     return { error };
//   }
// }

export async function userProfile(email) {
  const supabase = createClient();

  try {
    const { data, error} = await supabase
    .from('profiles')
    .select('first_time')
    .eq('email', email)
    .single()

  console.log(data)
  return data
  }
  catch(error){
    console.error('Unexpected error:', error);
    return { error };
  }
}