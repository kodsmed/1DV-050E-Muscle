import { SupabaseClient } from "@supabase/supabase-js";
import { PTInvite, InviteResult } from "~/types/pt_invite";
import { getInvite, deleteInvitesMoreThanDaysOld, deleteInvite } from "./inviteHash";

// Link a user and a personal trainer.

export async function linkUserAndPTBasedOnInviteHash(client: SupabaseClient, user_uuid: string, invite_hash: string) {
    const invite: PTInvite = await getInvite(invite_hash, client);

    // check validity of invite
    if (!invite) {
        return {success: false, expired: false, message: 'Invite not found.'};
    }
    if (invite && invite.created_at < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
        await deleteInvite(invite_hash, client);
        return {success: false, expired: true, message: 'Invite expired.'};
    }
    // delete all invites older than 30 days
    await deleteInvitesMoreThanDaysOld(30, client);

    // link user and personal trainer
    await linkUserAndPT({client: client, user_uuid: user_uuid, pt_uuid: invite.owner_uuid});
    await deleteInvite(invite_hash, client);
    const result: InviteResult = {success: true, expired: false, message: 'Personal trainer linked'}
    return result;
}

export async function linkUserAndPT({client, user_uuid, pt_uuid}:{client: SupabaseClient, user_uuid: string, pt_uuid: string}) {
    const {data} = await client
        .from('trainer_user')
        .insert([{user_uuid: user_uuid, trainer_uuid: pt_uuid}])
        .select();
    return data;
}

// Unlink a user and a personal trainer.
export async function unlinkUserAndPT(client: SupabaseClient, user_uuid: string, pt_uuid: string) {
    const {data} = await client
        .from('trainer_user')
        .delete()
        .eq('user_uuid', user_uuid)
        .eq('trainer_uuid', pt_uuid);
    return data;
}