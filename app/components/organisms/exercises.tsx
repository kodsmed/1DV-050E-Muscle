import { useState } from 'react';
import { ExerciseCard, AddExerciseCard } from "./exercise-card";
import { Text } from '../catalyst/text';
import { FieldGroup, Field, Label } from '../catalyst/fieldset';
import { Button } from '../catalyst/button';
import { Input } from '../catalyst/input';
import { Form, useSubmit } from '@remix-run/react';
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from '../catalyst/dropdown';

export interface ExerciseInterface {
  id: number;
  name: string;
  body_part: string;
  body_part_secondary: string;
}

function textToBodyPart(text: string): string {
  switch (text) {
    case 'Arms':
      return 'ARM';
    case 'Legs':
      return 'LEG';
    case 'Back':
      return 'BACK';
    case 'Torso':
      return 'TORSO';
    default:
      return 'null';
  }

}

export function Exercises({ exercises, clickHandler }: { exercises: ExerciseInterface[], clickHandler: (event: React.MouseEvent | React.TouchEvent | React.KeyboardEvent, index: number) => void}) {
  const submit = useSubmit();
  const [expanded, setExpanded] = useState(false);
  const [primaryBodyPart, setPrimaryBodyPart] = useState('Choose');
  const [secondaryBodyPart, setSecondaryBodyPart] = useState('Choose');

  function handleSubmission(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log('submitted');
    const interceptedForm = event.currentTarget;
    const formData = new FormData(interceptedForm);
    if (formData.get('name') === '') {
      return;
    }
    if (primaryBodyPart === 'Choose') {
      return;
    }
    if (secondaryBodyPart === 'Choose' || secondaryBodyPart === 'None') {
      setSecondaryBodyPart('None')
    }


    formData.append('body_part', textToBodyPart(primaryBodyPart));
    formData.append('body_part_secondary', textToBodyPart(secondaryBodyPart));

    submit(formData, {
      method: 'post',
      action: '/exercise/add',
    });
    console.log('submitted');

    exercises.push({id: exercises.length + 1, name: formData.get('name') as string, body_part: textToBodyPart(primaryBodyPart), body_part_secondary: textToBodyPart(secondaryBodyPart)});
  }

  return (
    <div className='p-4 m-4'>
    <h1 className='font-bold text-2xl m-4 inline'>Exercises</h1>
    <Text className='inline'>Click an exercise to add it to your planned session</Text>
      <div className='rounded-lg shadow-md w-full'>
        <ul className="flex flex-wrap">
          {exercises.map((exercise) => (
            <li key={exercise.id}>
              <ExerciseCard exercise={exercise} clickCallback={clickHandler} index={exercise.id} />
            </li>
          ))}
          <li>
            <div>
              <AddExerciseCard clickCallback={() => { setExpanded(!expanded) }} index={exercises.length} />
            </div>
          </li>
        </ul>
        <div className={expanded ? 'block' : 'hidden'}>
          <div className='... p-4'>
            <Text className='...'>Enter the details of the new exercise</Text>
            <Form onSubmit={handleSubmission}>
              <div className='rounded-lg w-full'>
                <FieldGroup className={'flex sm:flex-col md:flex-row space-x-4 md:space-y-0 sm:space-y-4 flex-wrap w-full'}>
                  <Field className={'flex flex-col justify-center space-y-[12px]'}>
                    <Label className = {'block'}>Name</Label>
                    <Input type='text' className= {'p-0 mt-0 sm:p-0 md:p-0'} name='name' />
                  </Field>
                  <Field className={'flex flex-col space-y-[12px]'}>
                    <Label htmlFor='body_part' className = {'... block'}>Primary body part</Label>
                    <Dropdown>
                      <DropdownButton className={'block w-32'}>{primaryBodyPart}</DropdownButton>
                      <DropdownMenu>
                        <DropdownItem onClick={() => {setPrimaryBodyPart('Arms')}}>Arms</DropdownItem>
                        <DropdownItem onClick={() => {setPrimaryBodyPart('Legs')}}>Legs</DropdownItem>
                        <DropdownItem onClick={() => {setPrimaryBodyPart('Back')}}>Back</DropdownItem>
                        <DropdownItem onClick={() => {setPrimaryBodyPart('Torso')}}>Torso</DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </Field>
                  <Field className={'m-0 flex flex-col space-y-[12px]'}>
                    <Label htmlFor='body_part_secondary' className = {'... block'}>Secondary body part</Label>
                    <Dropdown>
                      <DropdownButton className = {'block w-32'}>{secondaryBodyPart}</DropdownButton>
                      <DropdownMenu>
                        <DropdownItem onSelect={() => {setSecondaryBodyPart('Arms')}}>Arms</DropdownItem>
                        <DropdownItem onSelect={() => {setSecondaryBodyPart('Legs')}}>Legs</DropdownItem>
                        <DropdownItem onSelect={() => {setSecondaryBodyPart('Back')}}>Back</DropdownItem>
                        <DropdownItem onSelect={() => {setSecondaryBodyPart('Torso')}}>Torso</DropdownItem>
                        <DropdownItem onSelect={() => {setSecondaryBodyPart('None')}}>None</DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </Field>
                </FieldGroup>
                <Button type='submit' className={'... mt-4 mb-4'}>Add exercise</Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}