import { ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { TRAINING_DAY_STATUS } from "~/types/enums";

// this route is used to add a new program to the database and update the status of a program in the database.
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

  // Update the status of a program
  const status = body.get('status') as TRAINING_DAY_STATUS | TRAINING_DAY_STATUS.PENDING;
  const comment = body.get('comment') as string | null;
  const program_id = body.get('training_day_id') as string | null;
  const date = body.get('date') as string | null;
  const user_id = body.get('user_uuid') || user.data.user?.id;

  if (program_id && status && date && status !== TRAINING_DAY_STATUS.PENDING) {
    const response = await context.supabase
      .from('program')
      .insert({
        created_at: new Date().toISOString(),
        owner_uuid: user_id,
        training_day_id: Number(program_id),
        date,
        status,
        comment,
      })
    if (response.error) {
      console.error('Error updating program:', response.error.message);
    }
  }

  return redirect("/program-planner", { headers: context.headers });
}