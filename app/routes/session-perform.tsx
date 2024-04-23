import {
  redirect,
  type LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { useState } from "react";
import { ExerciseInterface, MuscleGroup } from "../types/exercise";
import { Set, TrainingsSession } from "../types/sessions";
import { SessionSelector } from "~/components/templates/session-selector";
import { PerformSession } from "~/components/templates/step-through-session";
import { createPerformedSession } from "../../functions/training-sessions/create-performed";


/**
 * Route for the training sessions planner page
 */
export async function loader({ context, request }: LoaderFunctionArgs) {
  const userResponse = await context.supabase.auth.getUser();
  const user = userResponse.data?.user;
  if (!user) {
    return redirect("/login", { headers: context.headers });
  }

  let response = await context.supabase
    .from('training_day')
    .select('*');
  const sessions = response.data as TrainingsSession[];

  response = await context.supabase
    .from('muscle_group')
    .select('*');
  const allMuscleGroups = response.data as MuscleGroup[];

  // get all sets for each session and adjust the data structure
  for (const session of sessions) {
    session.sets = [] as Set[];
    response = await context.supabase
      .from('training_day_set')
      .select('*')
      .eq('training_day_id', session.id);

    const sessionSets = response.data as { id: number, training_day_id: number, set: number }[];
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

        // get the primary muscle group for the exercise
        response = await context.supabase
          .from('exercise_muscle_group')
          .select('*')
          .eq('exercise', set.exercise.id)
        const exerciseMuscleGroups = response.data as { id: number, exercise: number, muscle_group: number, order: number }[];

        set.exercise.muscle_group = exerciseMuscleGroups
          .map(exerciseMuscleGroup => allMuscleGroups.find(muscleGroup => muscleGroup.id === exerciseMuscleGroup.muscle_group))
          .filter(muscleGroup => muscleGroup !== undefined) as MuscleGroup[];

        if (response.data) {
          const muscleGroup = response.data[0];
          response = await context.supabase
            .from('muscle_group')
            .select('*')
            .eq('id', muscleGroup.muscle_group);
          if (response.data) {
            set.exercise.muscle_group = [response.data[0] as MuscleGroup];
          }
        }
      }
    }
  }

  // check if there is a query parameter for a session to start
  const url = new URL(request.url);
  const id = url.searchParams.get("session") || null;

  let preSelectedSession = null;
  if (id) {
    const sessionId = parseInt(id);
    preSelectedSession = sessions.find(s => s.id === sessionId);
  }

  const client = context.supabase;
  return { sessions, preSelectedSession, client};
}

export async function action({ request, context }: LoaderFunctionArgs) {
  const formData = await request.formData();
  const rawSession = formData.get('session');
  if (!rawSession) {
    return redirect("/session-perform", { headers: context.headers });
  }
  const session = JSON.parse(rawSession as string) as TrainingsSession;
  createPerformedSession(context.supabase, session);
  return null
}

export default function SessionPerform() {
  const { sessions, preSelectedSession } = useLoaderData<typeof loader>() as { sessions: TrainingsSession[], preSelectedSession: TrainingsSession | null };
  console.log('preSelectedSession', sessions)
  const [selectedSession, setSelectedSession] = useState<TrainingsSession | null>(preSelectedSession);
  const [atSet, setAtSet] = useState<number>(0);
  const [done, setDone] = useState<boolean>(false);
  const submit = useSubmit();

  function setSession(session: TrainingsSession) {
    setSelectedSession(session);
  }

  function updateSetData(set: Set) {
    if (selectedSession && atSet >= 0 && atSet < selectedSession.sets.length) {
      selectedSession.sets[atSet] = set;
    }
  }

  function advanceSet() {
    console.log('advanceSet in session-perform.tsx')
    if (!selectedSession) {
      return;
    }

    // If it is not the last set advance to the next set and return... if it is the last set, save the session to the database
    if (atSet < selectedSession.sets.length - 1) {
      setAtSet(atSet + 1);
      return;
    }
    setDone(true);
    savePerformedSession(selectedSession);
  }

  function savePerformedSession(session: TrainingsSession) {
    const formData = new FormData();
    formData.append('session', JSON.stringify(session));
    submit(formData, {
      method: 'post',
      action: '/session-perform',
    });
  }

  return (
    <div className="flex flex-col w-4/5 h-full items-center justify-center">
      <div className="h-5/6 w-5/6">
        {(!selectedSession && !done) && (
          <SessionSelector sessions={sessions} callback={setSession} />
        )}
        {(selectedSession && !done) && (
          <PerformSession session={selectedSession} atSet={atSet} updateSetCall={updateSetData} advanceSetCallback={advanceSet} />
        )}
        {done && (
          <div className="w-full h-full flex flex-col justify-center items-center">
            <h1 className="text-3xl font-bold">Session Complete!</h1>
            <h3 className="text-xl">Great job!</h3>
          </div>
        )}
      </div>
    </div>
  )
}