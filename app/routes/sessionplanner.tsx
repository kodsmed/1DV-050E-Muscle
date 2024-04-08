/**
 * Route for the training sessions planner page
 */
import {
  type LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import type { ExerciseInterface } from "~/components/organisms/exercises";
import { Exercises } from "~/components/organisms/exercises";


export async function loader({ context }: LoaderFunctionArgs) {
  const response = await context.supabase
    .from('exercises')
    .select('*');
  const exercises = response.data as ExerciseInterface[];
  return { exercises };
}

export default function SessionPlanner() {
  const { exercises } = useLoaderData<typeof loader>();
  console.log("SessionPlanner: data :>> ", exercises);
      {/*<SessionPlannerForm />*/}
  return (
    <div>
      <h1>Session Planner</h1>
      <Exercises exercises = { exercises } />
    </div>
  )
}