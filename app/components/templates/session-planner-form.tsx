import { Text } from '../catalyst/text';
import { FieldGroup, Field, Label } from '../catalyst/fieldset';
import { Button } from '../catalyst/button';
import { Input } from '../catalyst/input';
import { Form } from '@remix-run/react';
import { Set, TrainingsSession } from '~/routes/sessions';
import { SetCard } from '../organisms/set-card';


export function SessionPlannerForm(
  {
    session,
    sets,
    updateCallback,
    saveCallback
  }: {
    session: TrainingsSession,
    sets: Set[],
    updateCallback: (set: Set) => void,
    saveCallback: (session: TrainingsSession) => void
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
    saveCallback(session);

    //exercises.push({id: exercises.length + 1, name: formData.get('name') as string, body_part: textToBodyPart(primaryBodyPart), body_part_secondary: textToBodyPart(secondaryBodyPart)});
  }

  function handleCallback(setData: { id: number, weight: number, repetitions: number, duration: number }) {
    const set = sets[setData.id];
    set.weight = setData.weight;
    set.repetitions = setData.repetitions;
    set.duration_minutes = setData.duration;
    updateCallback(set);
  }

  return (
    <Form onSubmit={handleSubmission}>
      <div className='p-4 m-4'>

        <h1 className='font-bold text-2xl'>Session details</h1>

        <FieldGroup>
          <Field>
            <Label htmlFor='name'>Session name</Label>
            <Input type='text' name='name' id='name' placeholder='Session name' />
          </Field>
        </FieldGroup>
        <h1 className='font-bold text-2xl m-4 inline'>Selected sets</h1>
        <Text className='inline'>Modify weight / repetitions / duration</Text>
        <div className='rounded-lg shadow-md w-full'>
          <ul className="flex flex-wrap">
            {sets.map((set) => (
              <li key={set.id}>
                <SetCard exercise={set.exercise} index={set.id} updateCallback={handleCallback} />
              </li>
            ))}
          </ul>
        </div>
        <Button type='submit'>Save</Button>
      </div>
    </Form>
  );
}