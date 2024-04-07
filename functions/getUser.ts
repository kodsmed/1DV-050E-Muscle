import { LoaderFunctionArgs } from "@remix-run/cloudflare"

export async function getUser({context}: LoaderFunctionArgs) {
  const user = await context.supabase.auth.getUser()

  return user?.data?.user
}