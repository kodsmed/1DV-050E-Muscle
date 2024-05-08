import { useState } from "react";
import { json, LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { SelectView } from "~/components/organisms/select-view";
import { LineChartWrapper } from "~/components/templates/linechart-wrapper";
import { TimeFrame } from "~/types/enums";


interface TrimmedTrainingsSession {
  id: number | null;
  session_name: string;
  sets?: SetDetails[] | null;
  created_at: string | null;
}

export interface SetDetails {
  id: number;
  exercise: Exercise | number;
  repetitions: number | null;
  weight: number | null;
  sets: number;
  rest_seconds: number | null;
  duration_minutes: number | null;
  exerciseDetails: Exercise;
  date?: string;
}

export interface SessionSet {
  id: number;
  training_day_id: number;
  set: number;
  setDetails?: SetDetails;
}

export interface Exercise {
  id: number;
  name: string;
}

/**
 * The loader function for the view progress page.
 * This new version of the loader function overfetches all the data needed for the page in one go.
 * This is done to reduce the number of queries to the database and improve performance.
 *
 * NOTE: This will cause an issue if the number of posts returned will ever exceed 1000 as that is the limit for Supabase queries.
 */
export async function loader({ context, request }: LoaderFunctionArgs) {
  const userResponse = await context.supabase.auth.getUser();
  const user = userResponse.data?.user;
  if (!user) {
    return redirect("/login", { headers: context.headers });
  }

  // Check for a specific user query parameter
  const url = new URL(request.url);
  const userNumber = url.searchParams.get("user");

  let uuid = null
  if (userNumber) {
    // get the user_uuid from the user number
    const response = await context.supabase
      .from('user_details')
      .select('id')
      .eq('user_number', userNumber);

    if (response && response.data && response.data.length > 0) {
      uuid = response.data[0].id;
    } else {
      return json({ allMySessions: null });
    }
  }

  // Fetch all performed sessions for the user, default to the current user if no user is specified
  const sessionsResponse = await context.supabase
    .from('performed_training_day')
    .select('id, session_name, created_at')
    .eq('owner_uuid', uuid || user.id);
  const allMySessions = sessionsResponse?.data as TrimmedTrainingsSession[] || [];

  if (allMySessions.length === 0) {
    return json({ allMySessions: [] });
  }

  // Fetch sets associated with all sessions in one go
  const trainingDayIds = allMySessions.map(session => session.id);
  const setsResponse = await context.supabase
    .from('performed_training_day_set')
    .select('id, training_day_id, set')
    .in('training_day_id', trainingDayIds);

  if (setsResponse.error || !setsResponse || !setsResponse.data) {
    return json({ error: setsResponse.error });
  }

  if (setsResponse.data.length === 0) {
    return json({ allMySessions: [] });
  }

  // Extract set IDs for fetching set details
  let setIDs: number[] = [];
  if (setsResponse.data && setsResponse.data.length > 0) {
    setIDs = setsResponse.data.map(set => set.set);
  }

  // Fetch details of all sets in one query
  const detailedSetsResponse = await context.supabase
    .from('set')
    .select('id, exercise, repetitions, weight, sets, rest_seconds, duration_minutes')
    .in('id', setIDs);

  if (detailedSetsResponse.error || !detailedSetsResponse || !detailedSetsResponse.data) {
    return json({ error: detailedSetsResponse.error });
  }
  const detailedSetsResponseData = detailedSetsResponse.data as SetDetails[];

  // Organize set details by their IDs for quick lookup
  const detailedSetsById: Record<number, SetDetails> = detailedSetsResponseData.reduce((acc, set) => {
    acc[set.id] = set;
    return acc;
  }, {} as Record<number, SetDetails>);

  // Attach detailed set information to session sets
  const sessionSets: SessionSet[] = setsResponse.data;
  sessionSets.forEach(sessionSet => {
    sessionSet.setDetails = detailedSetsById[sessionSet.set];
  });

  // Fetch exercises in one query
  const exerciseIDs = detailedSetsResponse.data.map(set => set.exercise);
  const exercisesResponse = await context.supabase
    .from('exercises')
    .select('id, name')
    .in('id', exerciseIDs);

  if (exercisesResponse.error || !exercisesResponse || !exercisesResponse.data) {
    return json({ error: exercisesResponse.error });
  }

  const exercisesResponseData = exercisesResponse.data as Exercise[];

  // Map exercises by their IDs for quick lookup
  const exercisesById: Record<number, Exercise> = exercisesResponseData.reduce((acc, exercise) => {
    acc[exercise.id] = exercise;
    return acc;
  }, {} as Record<number, Exercise>);

  // Attach exercises to their corresponding sets
  sessionSets.forEach(sessionSet => {
    if (sessionSet.setDetails) {
      const exerciseDetail = exercisesById[sessionSet.setDetails.exercise as number];
      if (exerciseDetail) {
        sessionSet.setDetails.exerciseDetails = exerciseDetail;
      } else {
        // Handle the case where the exercise details are not found, if necessary
      }
    }
  });

  // Now we need to correct the typing for the sets within each session
  // Map each session's sets to the detailedSetsById to get the full details
  allMySessions.forEach(session => {
    const sessionSetDetails = sessionSets
      .filter(sessionSet => sessionSet.training_day_id === session.id)
      .map(sessionSet => sessionSet.setDetails as SetDetails);
    session.sets = sessionSetDetails;
  });
  // Map the sets to the exercises
  allMySessions.forEach(session => {
    session.sets?.forEach(set => {
      set.exercise = exercisesById[set.exercise as number];
    });
  });
  return json({ allMySessions });
}


export default function ViewProgress() {
  const data = useLoaderData<typeof loader>();
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>(TimeFrame.allTime);
  // data is either <{allMySessions: TrimmedTrainingsSession[]}> or <{error: any}> depending on the loader
  // If there was an error, display an error message
  if ('error' in data) {
    throw new Error('Error fetching data');
  }
  const allMySessions = data.allMySessions;
  if (!allMySessions || allMySessions.length === 0) {
    return <div className="h-full">No sessions found</div>;
  }
  const allMySets = [] as SetDetails[];
  for (const session of allMySessions) {
    // add the date from the session to each set
    // then add the set to the allMySets array
    if (!session.sets) continue;
    for (const set of session.sets) {
      set.date = session.created_at as string;
      allMySets.push(set);
    }
  }

  const allMyExercises = allMySets.map(set => set.exercise) as Exercise[];

  // Trim the array to only unique exercises
  const uniqueExercises = allMyExercises.filter((exercise, index, self) => self.findIndex(e => e.id === exercise.id) === index);
  return (
    <div className="w-full h-full">
      <SelectView allMyExercises={uniqueExercises} setSelectedExercise={setSelectedExercise} setSelectedTimeFrame={setSelectedTimeFrame} />
      <LineChartWrapper allMySets={allMySets} selectedExercise={selectedExercise} selectedTimeFrame={selectedTimeFrame} />
    </div>
  );
}