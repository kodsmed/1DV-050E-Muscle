import {
  json,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/cloudflare";
import { useState } from "react";
import { Form, useActionData, useLoaderData, useNavigate } from "@remix-run/react";
import { getRole } from "functions/userRole";
import { Button } from "~/components/catalyst/button";
import {  User } from "@supabase/supabase-js";
import { createPTInvite } from "functions/inviteHash";

type clientInfo = {
  id: number,
  uuid: string,
  name: string,
  username: string,
}

export async function loader({ context }: LoaderFunctionArgs) {
  const user = await context.supabase.auth.getUser();
  if (!user || !user.data.user) {
    return redirect("/login", { headers: context.headers });
  }

  const uuid = user.data.user.id as string;
  const role = await getRole(uuid, context.supabase);
  if (!role || role != "TRAINER") {
    return redirect("/", { headers: context.headers });
  }

  // Get any linked clients for this Trainer from the trainer_user table
  const response = await context.supabase
    .from('trainer_user')
    .select('user_uuid')
    .eq('trainer_uuid', uuid);
  let linkedClientsUUIDs = null;
  if (response && response.data) {
    linkedClientsUUIDs = response.data;
  }
  if (!linkedClientsUUIDs) {
    return { user: user.data.user, role: role, urlBase: context.urlBase, linkedClients: null };
  }

  // Get the user details for the linked clients
  let linkedClients: clientInfo[] = [];
  // Do a bulk select on the user_details table
  const linkedClientsResponse = await context.supabase
    .from('user_details')
    .select('id, user_number, first_name, last_name, display_name')
    .in('id', linkedClientsUUIDs.map((item: { user_uuid: string }) => item.user_uuid));
  if (linkedClientsResponse && linkedClientsResponse.data) {
    linkedClients = linkedClientsResponse.data.map((item: {id: string, user_number: string, first_name: string, last_name: string, display_name:string}) => {
      return {
        id: parseInt(item.user_number),
        uuid: item.id,
        name: item.first_name + " " + item.last_name,
        username: item.display_name,
      }
    });
  }
  return { user: user.data.user, role: role, urlBase: context.urlBase, linkedClients: linkedClients };
}

export async function action({ context }: LoaderFunctionArgs) {
  const code = await createPTInvite(context.supabase);
  return json ({ linkingCode: code });
}

export default function Clients() {
  const data = useLoaderData<typeof loader>() as { user: User, role: string, urlBase: string, linkedClients: clientInfo[] | null };
  const actionData = useActionData<typeof action>();
  const [statusString, setStatusString] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  function viewProgress(user: clientInfo) {
    setLoading(true);
    navigate('/view-progress?user=' + user.id)
  }

  function viewSessions(user: clientInfo) {
    setLoading(true);
    navigate('/sessions?user=' + user.id)
  }

  function viewProgram(user: clientInfo) {
    setLoading(true);
    navigate('/program-planner?user=' + user.id)
  }

  if (loading) {
    return (
      <div className="h-full">
        <h1 className="font-bold text-2xl text-slate-700 mb-2 w-full border-b-2 border-dotted border-slate-300">Loading...</h1>
      </div>
    )
  }

  return (
    <div className="h-full">
      <h1 className="font-bold text-2xl text-slate-700 mb-2 w-full border-b-2 border-dotted border-slate-300">Invite clients</h1>
      <p>Click the button to generate a new <span className="font-bold italic"> one time use </span> linking code. Share the generated link with your client to allow them to link their accounts to your service.</p>
      <Form method="post" action="/clients">
        <Button type={"submit"} >Generate new Linking Code</Button>
      </Form>
      <div className="mt-4 flex flex-row flex-wrap gap-8 justify-left items-center">
        {actionData?.linkingCode && <p>{data.urlBase + "/pt-linkup?key=" + actionData?.linkingCode}</p>}
        <p>{statusString}</p>
        {actionData?.linkingCode && <Button onClick={() => { navigator.clipboard.writeText(data.urlBase + "/pt-linkup?key=" + actionData?.linkingCode); setStatusString("Copied to clipboard") }}>Copy Link</Button> }
      </div>

      <div>
        <h2 className="font-bold text-2xl text-slate-700 mb-2 w-full border-b-2 border-dotted border-slate-300">Clients</h2>
        <p className="mb-4 text-sm">Here you can see all your linked client</p>
        {data.linkedClients && data.linkedClients.map((client: clientInfo) => {
          return (
            <div key={client.id} className="flex flex-row justify-left items-center border-b-2 border-dotted border-slate-300 p-2 gap-4">
              <p>{client.name}</p>
              <p>&quot;{client.username}&quot;</p>
              <Button
                disabled = {loading}
                onClick = {() => viewProgress(client)}
                onTouchEnd = {() => viewProgress(client)}
                onKeyUp = {(event: React.KeyboardEvent) => {
                  if(event.key === "Enter") {
                    viewProgress(client)
                  }
                }}
              >
                View performance data
              </Button>
              <Button
                disabled = {loading}
                onClick = {() => viewSessions(client)}
                onTouchEnd = {() => viewSessions(client)}
                onKeyUp = {(event: React.KeyboardEvent) => {
                  if(event.key === "Enter") {
                    viewSessions(client)
                  }
                }}
              >
                View or edit training sessions
              </Button>
              <Button
                disabled = {loading}
                onClick = {() => viewProgram(client)}
                onTouchEnd = {() => viewProgram(client)}
                onKeyUp = {(event: React.KeyboardEvent) => {
                  if(event.key === "Enter") {
                    viewProgram(client)
                  }
                }}
              >
                View or edit training program
              </Button>
            </div>
          )
        })
      }
      </div>
    </div>
  )
}