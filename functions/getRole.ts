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