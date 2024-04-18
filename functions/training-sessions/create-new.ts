import { SupabaseClient } from "@supabase/supabase-js";
import { TrainingsSession } from "app/types/sessions";

export async function createNewSession(client: SupabaseClient, session: TrainingsSession): Promise<void> {
  // create new training session
  try {
    const { data } = await client
      .from('training_day')
      .insert({ session_name: session.session_name, owner_uuid: session.owner_uuid, created_at: new Date() })
      .select();
    if (!data) {
      throw new Error('Error creating session');
    }
    const sessionsId = data[0].id || null;
    // for each set, save it to the training_day_set table
    if (!sessionsId) {
      throw new Error('Error creating session');
    }
    const trainingDaySetArray = [] as { training_day_id: number, set: number }[];
    for (const set of session.sets) {
      // Save the set
      const { data, error } = await client
        .from('set')
        .insert(
          {
            exercise: set.exercise.id,
            weight: set.weight,
            repetitions: set.repetitions,
            duration_minutes: set.duration_minutes,
            owner_uuid: set.owner_uuid,
            sets: set.sets,
            rest_minutes: set.rest_minutes
          }
        )
        .select();
      if (error || !data) {
        throw new Error('Error saving set');
      }

      // Prepare the training_day_set record
      const setId = data[0].id;
      trainingDaySetArray.push({ training_day_id: sessionsId, set: setId })
    }

    // Save the training_day_set records
    const { error } = await client
      .from('training_day_set')
      .insert(trainingDaySetArray)
      .select();
    if (error) {
      throw new Error('Error saving training_day_set');
    }

  } catch (error) {
    throw new Error('Error creating session');
  }
}