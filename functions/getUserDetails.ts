import { SupabaseClient } from '@supabase/supabase-js';

export interface UserDetails {
  avatarUrl: string;
  firstName: string;
  lastName: string;
  displayName: string;
  currentWeight: number;
  targetWeight: number;
}

export async function getUserDetails(uuid: string, supabase: SupabaseClient) {
  if (uuid) {
    const { data, error } = await supabase
      .from('user_details')
      .select('avatar_url, first_name, last_name, display_name, current_weight_kg, target_weight_kg')
      .eq('id', uuid)
      .single();

    if (error) {
      console.log('error :>> ', error)
      return null;
    }

    console.log('data :>> ', data)

    if (data) {
      return {
        avatarUrl: data.avatar_url,
        firstName: data.first_name,
        lastName: data.last_name,
        displayName: data.display_name,
        currentWeight: data.current_weight_kg,
        targetWeight: data.target_weight_kg
      } as UserDetails;
    }
  }
  return null;

}