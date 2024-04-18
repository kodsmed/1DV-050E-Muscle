import { SupabaseClient } from "@supabase/supabase-js";
import { TrainingsSession } from "app/types/sessions";

// update existing training session
export async function updateExistingSession(client: SupabaseClient, session: TrainingsSession, sessionsId: number): Promise<void> {
  try {
    console.log('updating session')
    await client
      .from('training_day')
      .update({ session_name: session.session_name })
      .eq('id', sessionsId);

    // update sets
    const updateSetPromises = session.sets.map(set => {
      return client
        .from('set')
        .update({
          weight: set.weight,
          repetitions: set.repetitions,
          duration_minutes: set.duration_minutes,
          sets: set.sets,
          rest_minutes: set.rest_minutes
        })
        .eq('id', set.id);
    });
    await Promise.all(updateSetPromises);

    // Get all sets currently in the training_day_set table
    const { data } = await client
      .from('training_day_set')
      .select('set')
      .eq('training_day_id', sessionsId);

    if (!data) {
      throw new Error('Error updating session');
    }
    const existingSetIds = data.map((set: { set: number }) => set.set);

    // Get all set ids in the session
    const newSetIds = session.sets.map(set => set.id);

    // Remove sets that are no longer in the session
    const setsToRemove = existingSetIds.filter(setId => !newSetIds.includes(setId));
    if (setsToRemove.length > 0) {
      await client
        .from('training_day_set')
        .delete()
        .in('set', setsToRemove);
    }

    // Add new sets to the training_day_set table
    const newSets = session.sets.filter(set => !existingSetIds.includes(set.id));
    const trainingDaySetArray = newSets.map(set => {
      return { training_day_id: sessionsId, set: set.id };
    });
    await client
      .from('training_day_set')
      .insert(trainingDaySetArray);

    console.log('session updated')

  } catch (error) {
    throw new Error('Error updating session');
  }
}
