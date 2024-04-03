import { type AppLoadContext } from "@remix-run/cloudflare";
import { createServerClient, parse, serialize } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";
import { type PlatformProxy } from "wrangler";

type Cloudflare = Omit<PlatformProxy<Env>, "dispose">;

/**
 * Set up the load context for SSR (ServerSideRendering) for Remix to use Supabase and operate within the constraints of Cloudflare.
 * @see https://remix.run/docs/en/main/future/vite#augmenting-load-context
 * @see https://supabase.com/docs/reference/javascript/initializing
 */
declare module "@remix-run/cloudflare" {
  interface AppLoadContext {
    cloudflare: Cloudflare;
    supabase: SupabaseClient;
    headers: HeadersInit;
  }
}

type GetLoadContext = (args: {
  request: Request;
  context: {
    cloudflare: Cloudflare;
  }; // load context _before_ augmentation
}) => AppLoadContext;

// Shared implementation compatible with Vite, Wrangler, and Cloudflare Pages
export const getLoadContext: GetLoadContext = ({ context, request }) => {
  const cookies = parse(request.headers.get("Cookie") ?? "");
  const headers = new Headers();
  const supabase = createServerClient(
    context.cloudflare.env.SUPABASE_URL!,
    context.cloudflare.env.SUPABASE_KEY!,
    {
      // Add cookie methods to the Supabase client, that way we can use it for authentication.
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
  return {
    ...context,
    supabase,
    headers,
  };
};
