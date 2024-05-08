import { SupabaseClient } from "@supabase/supabase-js";

export async function createPTInvite(client: SupabaseClient): Promise<string> {
    const hash = generateInviteHash(24);
    const isUnique = await checkHashUniqueness(hash, client);
    if (!isUnique) {
        return createPTInvite(client);
    }
    await deleteInvitesMoreThanDaysOld(30, client);
    await createInvite(hash, client);
    return hash;
}

export async function createInvite(hash: string, client: SupabaseClient) {
    const {data} = await client
        .from('pt_invite')
        .insert([{invite_hash: hash, created_at: new Date()}])
        .select();
    return data;
}

export function generateInviteHash(length: number) {
    let hash = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!-_';
    const charactersLength = characters.length;
    for (let counter = 0; counter < length; counter++) {
      hash += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return hash;
}

export async function checkHashUniqueness(hash: string, client: SupabaseClient) {
    const {data, error} = await client
        .from('pt_invite')
        .select('*')
        .eq('invite_hash', hash);
    if (error) {
        console.error('Error checking hash uniqueness', error);
        return false;
    }
    if (data) {
        return data.length === 0;
    }
}

export async function deleteInvite(hash: string, client: SupabaseClient) {
    const {data} = await client
        .from('pt_invite')
        .delete()
        .eq('invite_hash', hash);
    return data;
}

export async function getInvite(hash: string, client: SupabaseClient) {
    const {data} = await client
        .from('pt_invite')
        .select('*')
        .eq('invite_hash', hash);
    if (data) {
        return data[0];
    }
    return null;
}

export async function deleteInvitesMoreThanDaysOld(days: number, client: SupabaseClient) {
    const {data} = await client
        .from('pt_invite')
        .delete()
        .lt('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000));
    return data;
}
