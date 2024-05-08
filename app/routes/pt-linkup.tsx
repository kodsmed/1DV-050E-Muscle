import {
  json,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/cloudflare";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { getRole } from "functions/userRole";
import { Button } from "~/components/catalyst/button";
import {  User } from "@supabase/supabase-js";
import { getUserDetails, UserDetails } from "functions/getUserDetails";
import { linkUserAndPTBasedOnInviteHash } from "functions/trainer-user";

export async function loader({ context, request }: LoaderFunctionArgs) {
  const user = await context.supabase.auth.getUser();
  if (!user || !user.data.user) {
    return redirect("/login", { headers: context.headers });
  }

  const uuid = user.data.user.id as string;
  const role = await getRole(uuid, context.supabase);
  if (!role || role != "USER") {
    return redirect("/", { headers: context.headers });
  }

  // get the key from the URL
  const url = new URL(request.url);
  const key = url.searchParams.get("key") || null;

  if (!key) {
    return redirect("/", { headers: context.headers });
  }

  // Get the latest invite code from the database
  const response = await context.supabase
    .from('pt_invite')
    .select('*')
    .eq('invite_hash', key);
  if (!response.data || response.data.length === 0) {
    return redirect("/", { headers: context.headers });
  }

  // Get the PT user details
  const trainerDetails = await getUserDetails(response.data[0].owner_uuid, context.supabase) as UserDetails | null;
  if (!trainerDetails) {
    return redirect("/", { headers: context.headers });
  }

  return json({
    user: user.data.user,
    trainerUUID: response.data[0].owner_uuid,
    trainerDetails,
    hash: key,
  })
}

export async function action({ context, request }: LoaderFunctionArgs) {
  const body = await request.formData();
  const hash = body.get('invite_hash') as string;
  const clientUUID = body.get('client_uuid') as string;
  const result = await linkUserAndPTBasedOnInviteHash(context.supabase, clientUUID, hash);
  return redirect("/", { headers: context.headers });
}

export default function PTLinkup() {
  const data = useLoaderData<typeof loader>() as { user: User, trainerUUID: string, trainerDetails: UserDetails, hash: string};
  const submit = useSubmit();

  async function handleSubmit() {
    const formData = new FormData();
    formData.append('trainer_uuid', data.trainerUUID);
    formData.append('client_uuid', data.user.id);
    formData.append('invite_hash', data.hash);

    submit(formData, {
      method: 'POST',
      action: '/pt-linkup',
    });
  }

  return (
    <div className="h-full">
      <h1>Linking with {data.trainerDetails.displayName}</h1>
      <p>Click the button below to confirm that you want to link up with {data.trainerDetails.displayName}</p>
      <p>Doing so allows the trainer to see your performance data and make plans and programs on your behalf.</p>
      <Button onClick={() => { handleSubmit() }}>Link up</Button>
      <Button onClick={() => { window.history.back() }}>Cancel</Button>
    </div>
  )
}