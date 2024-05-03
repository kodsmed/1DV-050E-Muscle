import { SupabaseClient } from "@supabase/supabase-js";
import { TrainingsSession } from "app/types/sessions";
import { TRAINING_DAY_STATUS } from "app/types/enums";
import { toShortDateString } from "functions/toShortDateString";

export async function createPerformedSession(client: SupabaseClient, session: TrainingsSession): Promise<void> {
  // create new training session
  try {
    const nativeId = session.id;
    const { data } = await client
      .from('performed_training_day')
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
      // Set any key that is 0 to null
      set.weight = set.weight === 0 ? null : set.weight;
      set.repetitions = set.repetitions === 0 ? null : set.repetitions;
      set.duration_minutes = set.duration_minutes === 0 ? null : set.duration_minutes;
      set.rest_seconds = set.rest_seconds === 0 ? null : set.rest_seconds;

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
            rest_seconds: set.rest_seconds
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

    // Save the performed_training_day_set records
    const { error } = await client
      .from('performed_training_day_set')
      .insert(trainingDaySetArray)
      .select();
    if (error) {
      throw new Error('Error saving training_day_set');
    }

    // Check if the session and date was part of the users program and if so update the status to done
    // we don't care if this fails, it just means the session was not part of the program...
    // also we don't need the result, so no need to check for data
    await client
      .from('program')
      .update({ status: TRAINING_DAY_STATUS.DONE })
      .eq('training_day_id', nativeId)
      .eq('date', toShortDateString(new Date(data[0].created_at)));

  } catch (error) {
    console.log('error', error)
    throw new Error('Error creating session');
  }
}