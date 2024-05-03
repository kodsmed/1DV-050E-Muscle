import {
  json,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/cloudflare";
import { useState } from "react";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { getRole } from "functions/userRole";
import { Button } from "~/components/catalyst/button";
import {  User } from "@supabase/supabase-js";
import { createPTInvite } from "functions/inviteHash";

export async function loader({ context, request }: LoaderFunctionArgs) {
  const user = await context.supabase.auth.getUser();
  if (!user || !user.data.user) {
    return redirect("/login", { headers: context.headers });
  }

  const uuid = user.data.user.id as string;
  const role = await getRole(uuid, context.supabase);
  if (!role || role != "TRAINER") {
    return redirect("/", { headers: context.headers });
  }

  // Get the latest invite code from the query string
  const url = new URL(request.url);
  const linkingCode = url.searchParams.get("linkingcode") || null;

  return json({
    user: user.data.user,
    role,
    urlBase: request.url.split("?")[0],
    linkingCode
  });
}

export async function action({ context }: LoaderFunctionArgs) {
  const code = await createPTInvite(context.supabase);
  console.log('code', code);
  //return redirect("/clients?linkingcode=" + code, { headers: context.headers });
  return json ({ linkingCode: code });
}

export default function Clients() {
  const data = useLoaderData<typeof loader>() as { user: User, role: string, urlBase: string, linkingCode: string };
  const actionData = useActionData<typeof action>();
  const [statusString, setStatusString] = useState<string>("");


  return (
    <div className="h-full">
      <h1>Clients</h1>
      <p>Click the button to generate a new linking code. Share the generated link with your client to allow them to link their accounts to your service.</p>
      <Form method="post" action="/clients">
        <Button type={"submit"} >Generate new Linking Code</Button>
      </Form>
      <div className="mt-4">
        {actionData?.linkingCode && <p>{data.urlBase + "/pt-linkup?key=" + actionData?.linkingCode}</p>}
        <p>{statusString}</p>
        <Button onClick={() => { navigator.clipboard.writeText(data.urlBase + "/pt-linkup?key=" + actionData?.linkingCode); setStatusString("Copied to clipboard") }}>Copy Link</Button>
      </div>
    </div>
  )
}