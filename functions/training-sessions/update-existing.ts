import { SupabaseClient } from "@supabase/supabase-js";
import { TrainingsSession } from "app/types/sessions";

// update existing training session
export async function updateExistingSession(client: SupabaseClient, session: TrainingsSession, sessionsId: number): Promise<void> {
  try {
    await client
      .from('training_day')
      .update({ session_name: session.session_name })
      .eq('id', sessionsId);

    // Get all sets currently in the training_day_set table
    const { data } = await client
      .from('training_day_set')
      .select('set')
      .eq('training_day_id', sessionsId);

    if (!data) {
      throw new Error('Error updating session');
    }
    const existingSets = data as { set: number }[];

    // Filter out the sets that are not in the session
    const setsToDelete = existingSets.filter(set => !session.sets.some(s => s.id === set.set));

    // Delete the sets that are not in the session
    const deleteSetPromises = setsToDelete.map(set => {
      return client
        .from('training_day_set')
        .delete()
        .eq('set', set.set);
    });
    await Promise.all(deleteSetPromises);

    // Filter out the sets that are new to the session
    const setsToAdd = session.sets.filter(set => !existingSets.some(s => s.set === set.id));

    // Add the new sets
    for (const set of setsToAdd) {
    const addedSet = await client
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
    if (!addedSet.data) {
      throw new Error('Error saving set');
    }
    set.id = addedSet.data[0].id;
    }

    // Add the new sets to the training_day_set table
    const addSetPromises = setsToAdd.map(set => {
      return client
        .from('training_day_set')
        .insert({
          training_day_id: sessionsId,
          set: set.id
        });
    });
    await Promise.all(addSetPromises);



    // Now that we have the correct training_day_set records, update the set records
    // update sets
    const updateSetPromises = session.sets.map(set => {
      return client
        .from('set')
        .update({
          weight: set.weight,
          repetitions: set.repetitions,
          duration_minutes: set.duration_minutes,
          sets: set.sets,
          rest_seconds: set.rest_seconds
        })
        .eq('id', set.id);
    });
    await Promise.all(updateSetPromises);


  } catch (error) {
    console.log('error', error)
    throw new Error('Error updating session');
  }
}
