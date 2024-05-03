import { TrainingsSession, Set } from "~/types/sessions";
import { useState } from "react";
import { json, LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { ExerciseInterface, MuscleGroup } from "~/types/exercise";
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

export async function loader({ context }: LoaderFunctionArgs) {
  const userResponse = await context.supabase.auth.getUser();
  const user = userResponse.data?.user;
  if (!user) {
    return redirect("/login", { headers: context.headers });
  }

  // Fetch all performed sessions for the user
  const sessionsResponse = await context.supabase
    .from('performed_training_day')
    .select('id, session_name, created_at')
  const allMySessions = sessionsResponse.data as TrimmedTrainingsSession[];

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

export async function oldloader({ context }: LoaderFunctionArgs) {
  const userResponse = await context.supabase.auth.getUser();
  const user = userResponse.data?.user;
  if (!user) {
    return redirect("/login", { headers: context.headers });
  }

  // get all performed sessions for the user
  let response = await context.supabase
    .from('performed_training_day')
    .select('*');
  const allMySessions = response.data as TrainingsSession[];

  response = await context.supabase
    .from('muscle_group')
    .select('*');
  const allMuscleGroups = response.data as MuscleGroup[];

  // get all sets for each session and adjust the data structure
  for (const session of allMySessions) {
    session.sets = [] as Set[];
    response = await context.supabase
      .from('performed_training_day_set')
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
    return <div>No sessions found</div>;
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