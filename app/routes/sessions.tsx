import { ExerciseInterface } from "../types/exercise";
import { Set, TrainingsSession } from "../types/sessions";
import { SessionsLayout } from "~/components/templates/sessions-layout";
import { Text } from "~/components/catalyst/text";


/**
 * Route for the training sessions planner page
 */
import {
  redirect,
  type LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

export async function loader({ context }: LoaderFunctionArgs) {
  const userResponse = await context.supabase.auth.getUser();
  const user = userResponse.data?.user;
  if (!user) {
    return redirect ("/login", { headers: context.headers });
  }
  let response = await context.supabase
    .from('training_day')
    .select('*');
  const sessions = response.data as TrainingsSession[];

  // get all sets for each session and adjust the data structure
  for (const session of sessions) {
    session.sets = [] as Set[];
    response = await context.supabase
      .from('training_day_set')
      .select('*')
      .eq('training_day_id', session.id);

    const sessionSets = response.data as {id: number, training_day_id: number, set: number}[];
    for (const sessionSet of sessionSets) {
      response = await context.supabase
         .from('set')
         .select('*')
         .eq('id', sessionSet.set);

      if (response.data) {
        const set = response.data[0] as Set;
        session.sets.push(set);
      }

      // get exercise for each set
      for (const set of session.sets) {
        response = await context.supabase
          .from('exercises')
          .select('*')
          .eq('id', set.exercise);

        if (response.data) {
          set.exercise = response.data[0] as ExerciseInterface;
        }
      }
    }
  }



  console.log ('sessions :>> ', sessions);
  return { sessions };
}


export default function Sessions() {
  const { sessions } = useLoaderData<typeof loader>();
  return (
    <div className="w-4/5 m-4 p-4">
      <h1 className="font-bold text-4xl">Your planned training sessions</h1>
      <Text className = 'italic text-lg inline'>Press any training session to modify or delete it... not yet implemented.</Text>
      <SessionsLayout sessions = { sessions } />
    </div>
  )
}