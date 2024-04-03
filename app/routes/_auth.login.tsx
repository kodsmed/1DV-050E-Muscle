import LoginForm from "~/components/organisms/login-form";

import { type LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/react";
import { ActionFunctionArgs, redirect } from "@remix-run/cloudflare";

export async function loader({ context }: LoaderFunctionArgs) {
  const user = await context.supabase.auth.getUser();
  if (user.data.user) {
    return redirect("/", { headers: context.headers });
  }
  return json({});
}

export async function action({ request, context }: ActionFunctionArgs) {
  const body = await request.formData();

  const email = body.get("email") as string;
  const password = body.get("password") as string;

  if (!email || !password) {
    return json(
      { message: "Missing required details" },
      {
        status: 400,
        statusText: "Missing required details",
      }
    );
  }

  try {
    await context.supabase.auth.signInWithPassword({ email, password });
  } catch (error) {
    // TODO: Handle error better
    return json(
      { message: "An error occurred" },
      { status: 400, statusText: "An error occurred" }
    );
  }

  return redirect("/", {
    headers: context.headers,
  });
}

export default function Login() {
  return (
    <div>
      <LoginForm />
    </div>
  );
}
