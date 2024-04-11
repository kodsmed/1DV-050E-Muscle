/**
 * Route for the training sessions planner page
 */
import {
  redirect,
  type LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { useState } from "react";
import type { ExerciseInterface } from "~/components/organisms/exercises";
import type { Set, TrainingsSession } from "app/routes/sessions";
import { Exercises } from "~/components/organisms/exercises";
import { SessionPlannerForm } from "~/components/templates/session-planner-form";

export async function loader({ context }: LoaderFunctionArgs) {
  const userResponse = await context.supabase.auth.getUser();
  const user = userResponse.data?.user;
  if (!user) {
    return redirect ("/login", { headers: context.headers });
  }
  const response = await context.supabase
    .from('exercises')
    .select('*');
  const exercises = response.data as ExerciseInterface[];
  const session = {} as TrainingsSession;


  const sets = [] as Set[];
  return { exercises, session, sets, user };
}

export async function action({ request, context }: LoaderFunctionArgs) {
  const formData = await request.formData();
  const rawSession = formData.get('session');
  if (!rawSession) {
    return redirect("/sessionplanner", { headers: context.headers });
  }
  const session = JSON.parse(rawSession as string) as TrainingsSession;

  let sharedData
  let sharedError
  console.log('session :>> ', session);
  if (session.id) {
    // update existing training session
    const {data, error} = await context.supabase
      .from('training_day')
      .update({session_name: session.session_name})
      .eq('id', session.id);
    // remove all sets for this session
    await context.supabase
      .from('training_day_set')
      .delete()
      .eq('training_day_id', session.id);
    sharedData = data;
    sharedError = error;
  } else {
    // create new training session
    const {data, error} = await context.supabase
    .from('training_day')
    .insert({session_name: session.session_name, owner_uuid: session.owner_uuid, created_at: new Date()})
    .select();
    console.log('data :>> ', data);
    console.log('error :>> ', error);
    sharedData = data;
    sharedError = error;
  }
  console.log ('sharedData :>> ', sharedData);
  console.log ('sharedError :>> ', sharedError);
  if (sharedError || !sharedData) {
    console.error('Error saving session', sharedError);
    return redirect("/sessionplanner", { headers: context.headers });
  }

  // for each set, save it to the training_day_set table
  const trainingDaySetArray = [] as {training_day_id: number, set: number}[];
  for (const set of session.sets) {
    // Save the set
    const {data, error} = await context.supabase
      .from('set')
      .insert({exercise: set.exercise.id, weight: set.weight, repetitions: set.repetitions, duration_minutes: set.duration_minutes, owner_uuid: set.owner_uuid})
      .select();
    if (error || !data) {
      console.error('Error saving set', error);
      return redirect("/sessionplanner", { headers: context.headers });
    }

    // Prepare the training_day_set record
    const setId = data[0].id;
    trainingDaySetArray.push({training_day_id: sharedData[0].id, set: setId})
  }

  // Save the training_day_set records
  const {data, error} = await context.supabase
    .from('training_day_set')
    .insert(trainingDaySetArray)
    .select();
  if (error || !data) {
    console.error('Error saving training_day_set', error);
    return redirect("/sessionplanner", { headers: context.headers });
  }

   return redirect("/sessions", { headers: context.headers });
}


export default function SessionPlanner() {
  const { exercises, session, sets, user } = useLoaderData<typeof loader>();
  const [ localSets, setLocalSets ] = useState(sets);
  const submit = useSubmit();

  console.log("SessionPlanner: data :>> ", exercises);

  function addExerciseHandler(event: React.MouseEvent | React.TouchEvent | React.KeyboardEvent, index: number): void {
    console.log('clicked :>>', index);
    const parrentExercise = exercises[index - 1];
    const newSet = { id: localSets.length, exercise: parrentExercise, weight: 0, repetitions: 0, duration_minutes: 0, owner_uuid: user.id  } as Set;

    if (localSets.find(set => set.exercise.id === parrentExercise.id)) {
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
    console.log ('saving session');
    console.log('session :>> ', session);
    console.log('sets :>> ', localSets);
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

  return (
    <div className="w-4/5 m-4 p-4">
      <h1 className="font-bold text-4xl">Session planner</h1>
      <Exercises exercises = {exercises} clickHandler = {addExerciseHandler} />
      <SessionPlannerForm session = { session } sets = { localSets } updateCallback = { updateSet } saveCallback= { savePlannedSession } />
    </div>
  )
}