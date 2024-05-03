import { SupabaseClient } from "@supabase/supabase-js";

export async function getRole(uuid: string, supabase: SupabaseClient) {
  if (uuid) {
    const { data } = await supabase
      .rpc('getRole', { arguuid: uuid });
    if (data) {
      return data;
    }
  }
  return null;
}

export async function setRole(uuid: string, role: string, client: SupabaseClient) {
  if (uuid) {
    const roleTypes = ['ADMIN', 'USER', 'TRAINER', 'GYM_ADMIN', 'GYM_OWNER']
    if (!roleTypes.includes(role)) {
      return null;
    }
    const { data } = await client
      .from('user_role')
      .insert([{ user_uuid: uuid, role: role }])
      .select();
    if (data) {
      return data;
    }
  }
  return null;
}