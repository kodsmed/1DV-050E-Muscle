import { json } from "@remix-run/react";
import { ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { MuscleGroup } from "~/types/exercise";

export async function action({ request, context }: ActionFunctionArgs) {
  console.log ("action")
  const body = await request.formData();

  console.log ("body :>> ", body);
  const name = body.get("name") as string;
  const rawMusclegroup = body.get("muscle_group");
  const musclegroup = JSON.parse(rawMusclegroup as string) as MuscleGroup[];
  console.log(rawMusclegroup)

  console.log(musclegroup)

  if (!name || !musclegroup || musclegroup.length < 1) {
    return json(
      { message: "Missing required details" },
      {
        status: 400,
        statusText: "Missing required details",
      }
    );
  }

  // Save the new exercise.
  const {data, error} = await context.supabase
    .from('exercises')
    .insert({ name: name })
    .select();
  if (error || !data) {
    console.error('Error saving exercise', error);
    return redirect("/sessionplanner", { headers: context.headers });
  }
  console.log ("response :>> ", data);

  // Save the muscle groups for the exercise
  const exerciseId = data[0].id;
  for (let i = 0; i < musclegroup.length; i++) {
    const {data, error} = await context.supabase
      .from('exercise_muscle_group')
      .insert({ exercise: exerciseId, muscle_group: musclegroup[i].id, order: i})
      .select();
    if (error || !data) {
      console.error('Error saving exercise_muscle_group', error);
      return redirect("/sessionplanner", { headers: context.headers });
    }
  }

  return redirect("/sessionplanner", { headers: context.headers });
}
