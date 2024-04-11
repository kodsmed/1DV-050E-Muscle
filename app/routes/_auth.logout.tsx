import { ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { createServerClient, parse, serialize } from "@supabase/ssr";


export async function loader({ context, request }: ActionFunctionArgs) {
  const cookies = parse(request.headers.get("Cookie") ?? "");
  const headers = new Headers();
  const supabase = createServerClient(
    context.cloudflare.env.SUPABASE_URL!,
    context.cloudflare.env.SUPABASE_KEY!,
    {
      cookies: {
        get(key) {
          return cookies[key];
        },
        set(key, value, options) {
          headers.append("Set-Cookie", serialize(key, value, options));
        },
        remove(key, options) {
          headers.append("Set-Cookie", serialize(key, "", options));
        },
      },
    }
  );

  await supabase.auth.signOut();
  const redirectTo = request.headers.get("referer") || "/";
  return redirect(redirectTo, {
    headers,
  });
}


export async function action({ context, request }: ActionFunctionArgs) {
  const cookies = parse(request.headers.get("Cookie") ?? "");
  const headers = new Headers();
  const supabase = createServerClient(
    context.cloudflare.env.SUPABASE_URL!,
    context.cloudflare.env.SUPABASE_KEY!,
    {
      cookies: {
        get(key) {
          return cookies[key];
        },
        set(key, value, options) {
          headers.append("Set-Cookie", serialize(key, value, options));
        },
        remove(key, options) {
          headers.append("Set-Cookie", serialize(key, "", options));
        },
      },
    }
  );

  await supabase.auth.signOut();
  const redirectTo = request.headers.get("referer") || "/";
  return redirect(redirectTo, {
    headers,
  });
}
