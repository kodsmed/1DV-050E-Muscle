/**
 * Route for the training sessions planner page
 */
import {
  json,
  redirect,
  type LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { useState } from "react";
import type { ExerciseInterface, MuscleGroup } from "../types/exercise";
import type { Set, TrainingsSession } from "../types/sessions";
import { Exercises } from "~/components/organisms/exercises";
import { SessionPlannerForm } from "~/components/templates/session-planner-form";
import { User } from "@supabase/supabase-js";
import { updateExistingSession } from "functions/training-sessions/update-existing";
import { createNewSession } from "functions/training-sessions/create-new";

export async function loader({ context, request }: LoaderFunctionArgs) {
  const userResponse = await context.supabase.auth.getUser();
  const user = userResponse.data?.user;
  if (!user) {
    return redirect("/login", { headers: context.headers });
  }
  let response = await context.supabase
    .from('exercises')
    .select('*');
  const exercises = response.data as ExerciseInterface[];

  response = await context.supabase
    .from('muscle_group')
    .select('*');
  const allMuscleGroups = response.data as MuscleGroup[];

  response = await context.supabase
    .from('exercise_muscle_group')
    .select('*');
  const exerciseMuscleGroups = response.data as { id: number, exercise: number, muscle_group: number, order: number }[];

  // Add muscle groups to exercises
  exercises.forEach(exercise => {
    const muscleGroups = exerciseMuscleGroups
      .filter(exerciseMuscleGroup => exerciseMuscleGroup.exercise === exercise.id)
      .map(exerciseMuscleGroup => allMuscleGroups.find(muscleGroup => muscleGroup.id === exerciseMuscleGroup.muscle_group))
      .filter(muscleGroup => muscleGroup !== undefined); // This line filters out undefined values

    exercise.muscle_group = muscleGroups as MuscleGroup[];
  });

  // Se if there is a query parameter for a session to edit
  const url = new URL(request.url);
  const sessionToEdit = url.searchParams.get("session");

  if (sessionToEdit) {
    const sessionId = parseInt(sessionToEdit);
    response = await context.supabase
      .from('training_day')
      .select('*')
      .eq('id', sessionId);
    if (!response.data) {
      return json({ exercises, session: {} as TrainingsSession, sets: [], user, allMuscleGroups });
    }

    const session = {} as TrainingsSession;
    session.id = response.data[0].id;
    session.session_name = response.data[0].session_name;
    session.owner_uuid = response.data[0].owner_uuid;
    session.created_at = response.data[0].created_at;
    session.sets = [];
    console.log('session in edit:>> ', session);

    // get all sets for this session
    response = await context.supabase
      .from('training_day_set')
      .select('*')
      .eq('training_day_id', sessionId);
    const sessionSets = response.data as { id: number, training_day_id: number, set: number }[];

    // get all set details
    for (const sessionSet of sessionSets) {
      response = await context.supabase
        .from('set')
        .select('*')
        .eq('id', sessionSet.set);
      if (response.data) {
        const set = response.data[0] as Set;
        session.sets.push(set);
      }
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

    // Get muscle groups for each exercise
    for (const set of session.sets) {
      response = await context.supabase
        .from('exercise_muscle_group')
        .select('*')
        .eq('exercise', set.exercise.id);
      const exerciseMuscleGroups = response.data as { id: number, exercise: number, muscle_group: number, order: number }[];

      set.exercise.muscle_group = exerciseMuscleGroups
        .map(exerciseMuscleGroup => allMuscleGroups.find(muscleGroup => muscleGroup.id === exerciseMuscleGroup.muscle_group))
        .filter(muscleGroup => muscleGroup !== undefined) as MuscleGroup[];
    }
    const sets = session.sets as Set[];
    return json({ exercises, session, sets, user, allMuscleGroups });
  }
  const session = {} as TrainingsSession;


  const sets = [] as Set[];
  return json({ exercises, session, sets, user, allMuscleGroups });
}

export async function action({ request, context }: LoaderFunctionArgs) {
  const formData = await request.formData();
  const rawSession = formData.get('session');
  if (!rawSession) {
    return redirect("/sessionplanner", { headers: context.headers });
  }
  const session = JSON.parse(rawSession as string) as TrainingsSession;
  const sessionsId = session.id || null;
  if (sessionsId) {
    updateExistingSession(context.supabase, session, sessionsId);
  } else {
    createNewSession(context.supabase, session);
  }


  return redirect("/sessions", { headers: context.headers });
}


export default function SessionPlanner() {
  let emptySets = [] as Set[];
  const data = useLoaderData<typeof loader>();
  const { exercises, session, user, allMuscleGroups }: { exercises: ExerciseInterface[], session: TrainingsSession, sets: Set[], user: User, allMuscleGroups: MuscleGroup[] } = data

  if (session?.sets?.length > 0) {
    emptySets = session.sets;
  }
  const [localSets, setLocalSets] = useState(emptySets)
  const submit = useSubmit();

  console.log("SessionPlanner: data :>> ", exercises);

  function addExerciseHandler(exercise: ExerciseInterface): void {
    console.log('clicked :>>', exercise.name);

    const newSet = { id: localSets.length, exercise: exercise, weight: 10, repetitions: 1, duration_minutes: 1, owner_uuid: user.id, rest_seconds: 60 } as Set;

    if (localSets.find(set => set.exercise.id === exercise.id)) {
      const confirm = window.confirm('You already have this exercise in this plan. Do you want to add it again?');
      if (!confirm) return;
    }

    setLocalSets([...localSets, newSet]);
  }

  function updateSet(set: Set): void {
    const updatedSets = localSets.map(localSet => {
      if (localSet.id === set.id) {
        return set;
      }
      return localSet;
    });
    setLocalSets(updatedSets);
  }

  function savePlannedSession(session: TrainingsSession): void {
    if (!session.session_name || session.session_name === '') {
      alert('Please provide a name for the session');
      return;
    }
    if (localSets.length === 0) {
      alert('Please add some exercises to the session');
      return;
    }
    session.owner_uuid = user.id;
    session.sets = localSets;
    const formData = new FormData();
    formData.append('session', JSON.stringify(session));
    submit(formData, {
      method: 'post',
      action: '/sessionplanner',
    });
  }

  function handleRemoveSet(index: number): void {
    const updatedSets = localSets.filter(set => set.id !== index);
    setLocalSets(updatedSets);
  }

  return (
    <div className="w-5/6 m-4 p-4">
      <h1 className="font-bold text-4xl">Session planner</h1>
      <Exercises exercises={exercises} clickHandler={addExerciseHandler} muscleGroups={allMuscleGroups} />
      <SessionPlannerForm session={session} sets={localSets} updateCallback={updateSet} saveCallback={savePlannedSession} removeSetCallback={handleRemoveSet}/>
    </div>
  )
}