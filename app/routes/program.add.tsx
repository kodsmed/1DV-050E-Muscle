import { ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { Program } from "~/types/program";
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
  const owner_uuid = user.data.user?.id



  // A new program post will only have training_day_id and date
  const training_day_id = body.get('training_day_id');
  const date = body.get('date');
  const program_id = body.get('id');
  if (training_day_id && date && !program_id) {

    // Check if the user have a training_day already on that date
    const existsResponse = await context.supabase
      .from('program')
      .select('*')
      .eq('owner_uuid', owner_uuid)
      .eq('date', date as string) // date is a string
    if (existsResponse.error) {
      console.error('Error adding program:', existsResponse.error.message);
    }

    if (existsResponse.data && existsResponse.data.length > 0) {
      console.error('Error adding program: A program already exists for this date');
      return redirect("/program-planner", { headers: context.headers });
    }

    const newProgram: Program = {
      training_day_id: Number(training_day_id),
      date: date as string,
      created_at: new Date().toISOString(),
      owner_uuid: owner_uuid
    };
    const response = await context.supabase
      .from('program')
      .insert([newProgram]);
    if (response.error) {
      console.error('Error adding program:', response.error.message);
    }
  }

  // Update the status of a program
  const status = body.get('status') as TRAINING_DAY_STATUS | TRAINING_DAY_STATUS.PENDING;
  const comment = body.get('comment') as string | null;
  if (program_id && status) {
    const response = await context.supabase
      .from('program')
      .update({
        status: status,
        comment: comment,
      })
      .eq('id', program_id);
    if (response.error) {
      console.error('Error updating program:', response.error.message);
    }
  }

  return redirect("/program-planner", { headers: context.headers });
}