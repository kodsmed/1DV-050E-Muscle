import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/cloudflare";
import RegisterForm from "~/components/organisms/register-form";

/**
 * Load the environment variables for Supabase and redirect the user if they are already logged in.
 */
export async function loader({ context }: LoaderFunctionArgs) {
  const user = await context.supabase.auth.getUser();
  if (user.data.user) {
    return redirect("/", { headers: context.headers });
  }
  return json({
    env: {
      SUPABASE_URL: context.cloudflare.env.SUPABASE_URL!,
      SUPABASE_KEY: context.cloudflare.env.SUPABASE_KEY!,
    },
  });
}

/**
 * Preform the action 'Register' component for the register form.
 * @see https://supabase.com/docs/guides/auth/server-side/email-based-auth-with-pkce-flow-for-ssr
 */
export async function action({ request, context }: ActionFunctionArgs) {
  const body = await request.formData();

  const email = body.get("email") as string;
  const password = body.get("password") as string;
  const password2 = body.get("password2") as string;

  if (!email || !password || !password2) {
    return json(
      { message: "Missing required details" },
      {
        status: 400,
        statusText: "Missing required details",
      }
    );
  }

  if (password !== password2) {
    return json(
      { message: "Passwords don't match" },
      { status: 400, statusText: "Passwords don't match" }
    );
  }

  try {
    await context.supabase.auth.signUp({ email, password });
  } catch (error) {
    // TODO: Handle error better
    return json(
      { message: "An error occurred" },
      { status: 400, statusText: "An error occurred" }
    );
  }

  return redirect("/confirmation-email-info", {
    headers: context.headers,
  });
}

export default function Register() {
  return <RegisterForm />;
}
