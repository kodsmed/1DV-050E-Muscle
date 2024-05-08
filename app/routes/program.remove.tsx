import { ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { TRAINING_DAY_STATUS } from "~/types/enums";

// this route is used to remove a PENIDNG program from the database.
// it is intended to be posted to by the program planner page.

export function loader() {
  // Handle any GET requests to the page
  return redirect('/program-planner')
}

export async function action({ request, context }: ActionFunctionArgs) {
  // Handle any POST requests to the page
  const body = await request.formData();

  // get the requesting user
  const user = await context.supabase.auth.getUser();
  if (!user || !user.data) {
    return redirect("/login", { headers: context.headers });
  }
  const owner_uuid = user.data.user?.id

  const id = body.get('training_day_id');
  const user_id = body.get('user_uuid') || owner_uuid;
  const user_number = body.get('user_number') || null;

  const redirectUrl = user_number ? `/program-planner?user=${user_number}` : '/program-planner';

  // remove one program from the database with the provided id and status PENDING
  if (id) {
    const response = await context.supabase
      .from('program')
      .delete()
      .eq('training_day_id', id)
      .eq('status', TRAINING_DAY_STATUS.PENDING)
      .eq('owner_uuid', user_id)
      .order('created_at', { ascending: true })
      .limit(1);
    if (response.error) {
      console.error('Error removing program:', response.error.message);
    }
  }

  return redirect(redirectUrl, { headers: context.headers });
}