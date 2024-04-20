import { Text } from '../catalyst/text';
import { FieldGroup, Field, Label } from '../catalyst/fieldset';
import { Button } from '../catalyst/button';
import { Input } from '../catalyst/input';
import { Form } from '@remix-run/react';
import { Set, TrainingsSession } from 'app/types/sessions';
import { SetCard } from '../organisms/set-card';


export function SessionPlannerForm(
  {
    session,
    sets,
    updateCallback,
    saveCallback,
    removeSetCallback: removeCallback
  }: {
    session: TrainingsSession,
    sets: Set[],
    updateCallback: (set: Set) => void,
    saveCallback: (session: TrainingsSession) => void
    removeSetCallback: (index: number) => void
  }) {

  console.log('session :>> ', session);
  console.log('sets :>> ', sets);

  function handleSubmission(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log('submitted');
    const interceptedForm = event.currentTarget;
    const formData = new FormData(interceptedForm);
    console.log('formData :>> ', formData);
    const sessionName = formData.get('name') as string;
    session.session_name = sessionName;
    session.sets = sets;
    console.log('session :>> ', session);
    saveCallback(session);
  }

  function handleCallback(setData: { id: number, weight: number, repetitions: number, duration: number, sets: number, repRest: number}) {
    console.log('setData :>> ', setData);
    const set = sets.find(set => set.id === setData.id) || session.sets.find(set => set.id === setData.id);
    if (!set) {
      return;
    }
    set.weight = setData.weight;
    set.repetitions = setData.repetitions;
    set.duration_minutes = setData.duration;
    set.sets = setData.sets;
    set.rest_seconds = setData.repRest;
    updateCallback(set);
  }

  function removeSet(index: number) {
    removeCallback(index);
  }

  return (
    <Form onSubmit={handleSubmission}>
      <div className='p-4 m-4'>

        <h1 className='font-bold text-2xl'>Session details</h1>

        <FieldGroup>
          <Field>
            <Label htmlFor='name'>Session name</Label>
            <Input type='text' name='name' id='name' placeholder={session.session_name || 'Session name'} />
          </Field>
        </FieldGroup>
        <h1 className='font-bold text-2xl m-4 inline'>Selected exercises</h1>
        <Text className='inline'>Modify weight / repetitions / duration.</Text>
        <Text className='ml-4'>Set any value but sets to zero to mark it as not applicable, meaning it will not be tracked for the exercise.</Text>
        <div className='rounded-lg shadow-md w-full p-4'>
          <ul className="flex flex-wrap w-fit mr-8">
            {sets.map((set) => (
              <li key={set.id}>
                <SetCard exercise={set.exercise} preSet={set} index={set.id} updateCallback={handleCallback} removeExerciseCallback={removeSet} />
              </li>
            ))}
          </ul>
          <div className='w-full flex justify-center items-center'>
            {(sets && sets?.length) > 0 && <Button type='submit' className="w-4/5">Save</Button>}
          </div>
        </div>
      </div>
    </Form>
  );
}