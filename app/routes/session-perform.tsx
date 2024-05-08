import {
  redirect,
  type LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { useLoaderData, useSubmit, useNavigate } from "@remix-run/react";
import { useState } from "react";
import { ExerciseInterface, MuscleGroup } from "../types/exercise";
import { Set, TrainingsSession } from "../types/sessions";
import { SessionSelector } from "~/components/templates/session-selector";
import { PerformSession } from "~/components/templates/step-through-session";
import { createPerformedSession } from "../../functions/training-sessions/create-performed";


/**
 * Route for the training sessions perform page
 */
export async function loader({ context, request }: LoaderFunctionArgs) {
  const userResponse = await context.supabase.auth.getUser();
  const user = userResponse.data?.user;
  if (!user) {
    return redirect("/login", { headers: context.headers });
  }

  // refresh the session to make sure it is up to date and not expires mid-session
  await context.supabase.auth.refreshSession();

  // Check for a specific session query parameter
  const url = new URL(request.url);
  const sessionID = url.searchParams.get("session");


  // First page load, get all the session and have the user select one.
  if (!sessionID) {
    const sessionsResponse = await context.supabase
      .from('training_day')
      .select('*')
      .eq('owner_uuid', user.id); // You can only perform your own sessions
    const sessions = sessionsResponse.data;
    return { sessions, preSelectedSession: null };
  } else {


    const [sessionsResponse, muscleGroupsResponse, exercisesResponse, exercise_muscle_groupResponse] = await Promise.all([
      context.supabase.from('training_day')
        .select('*')
        .eq('id', sessionID)
        .eq('owner_uuid', user.id),
      context.supabase.from('muscle_group').select('*'),
      context.supabase.from('exercises').select('*'),
      context.supabase.from('exercise_muscle_group').select('*')
    ]);

    if (!sessionsResponse.data || !muscleGroupsResponse.data || !exercisesResponse.data || !exercise_muscle_groupResponse.data) {
      return redirect("/session-perform", { headers: context.headers });
    }

    const sessions = sessionsResponse.data as TrainingsSession[];
    const allMuscleGroups = muscleGroupsResponse.data as MuscleGroup[]
    const allExercises = exercisesResponse.data as ExerciseInterface[]
    const exerciseMuscleGroups = exercise_muscle_groupResponse.data as { id: number, exercise: number, muscle_group: number, order: number }[]

    // get all sets for the session
    const session = sessions[0];
    session.sets = [] as Set[];
    const response = await context.supabase
      .from('training_day_set')
      .select('set')
      .eq('training_day_id', sessionID);
    if (!response.data) {
      return redirect("/session-perform", { headers: context.headers });
    }
    const sets = response.data as { set: number }[];

    // make a bulk request to get all the set details
    const setDetailsResponse = await context.supabase
      .from('set')
      .select('*')
      .in('id', sets.map(set => set.set));
    const setDetails = setDetailsResponse.data as { id: number, exercise: number | ExerciseInterface, repetitions: number, weight: number, sets: number, rest_seconds: number, duration_minutes: number }[];

    setDetails.forEach(set => {
      const exercise = allExercises.find(exercise => exercise.id ===set.exercise);
      set.exercise = exercise as ExerciseInterface;
      const firstMuscleGroupId = exerciseMuscleGroups.find(emg => emg.exercise === exercise?.id && emg.order === 0)?.muscle_group;
      const firstMuscleGroup = allMuscleGroups.find(mg => mg.id === firstMuscleGroupId)
      set.exercise.muscle_group = [firstMuscleGroup as MuscleGroup];
      session.sets.push(set as Set);
    });

    return { preSelectedSession: session };
  }
}

export async function action({ request, context }: LoaderFunctionArgs) {
  const formData = await request.formData();
  const rawSession = formData.get('session');
  if (!rawSession) {
    return redirect("/session-perform", { headers: context.headers });
  }
  const session = JSON.parse(rawSession as string) as TrainingsSession;
  createPerformedSession(context.supabase, session);
  return {isDone: true}
}

export default function SessionPerform() {
  const { sessions, preSelectedSession, isDone } = useLoaderData<typeof loader>() as { sessions: TrainingsSession[], preSelectedSession: TrainingsSession | null, isDone: boolean};
  const selectedSession = preSelectedSession || null;
  const [atSet, setAtSet] = useState<number>(0);
  const [done, setDone] = useState<boolean>(isDone);
  const [loading, setLoading] = useState<boolean>(false);
  const submit = useSubmit();
  const navigate = useNavigate();

  function updateSetData(set: Set) {
    if (selectedSession && atSet >= 0 && atSet < selectedSession.sets.length) {
      selectedSession.sets[atSet] = set;
    }
  }

  function advanceSet() {
    if (selectedSession === null) {
      console.error('No session selected');
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

  function selectSession(session: TrainingsSession) {
    setLoading(true);
    navigate(`/session-perform?session=${session.id}`);
  }

  if (done) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center p-4">
        <h1 className="text-3xl font-bold">Session Complete!</h1>
        <h3 className="text-xl">Great job!</h3>
      </div>
    );
  }

  if (!selectedSession && !preSelectedSession) {
    return (
      <div className="w-full h-full p-4">
        {loading &&
          <div className="w-full h-full flex flex-row justify-center items-center"><h2>Loading...</h2></div>
        }
        {!loading &&
          <div>
            <SessionSelector sessions={sessions} callback={selectSession} />
          </div>
        }
      </div>)
  }

  if (selectedSession && !done) {
    return (
      <div className="w-full h-full p-4">
        <PerformSession session={selectedSession} atSet={atSet} updateSetCall={updateSetData} advanceSetCallback={advanceSet} />
      </div>
    )
  }

  return (
    <div className="w-full h-full p-4">
      No session selected
    </div>
  )
}