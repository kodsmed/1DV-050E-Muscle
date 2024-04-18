import { useState } from 'react';
import { ExerciseCard, AddExerciseCard } from "./exercise-card";
import { Text } from '../catalyst/text';
import { FieldGroup, Field, Label } from '../catalyst/fieldset';
import { Button } from '../catalyst/button';
import { Input } from '../catalyst/input';
import { Form, useSubmit } from '@remix-run/react';
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from '../catalyst/dropdown';
import { ExerciseInterface, MuscleGroup } from '../../types/exercise';



export function Exercises({ exercises, clickHandler, muscleGroups }: { exercises: ExerciseInterface[], clickHandler: (exercise: ExerciseInterface) => void, muscleGroups: MuscleGroup[] }) {
  const emptyMuscleGroups = [] as MuscleGroup[];
  const submit = useSubmit();
  const [expanded, setExpanded] = useState(false);
  const [selectedMuscleGroups, setSelectedMuscleGroup] = useState(emptyMuscleGroups);

  function handleSubmission(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log('submitted');
    const interceptedForm = event.currentTarget;
    const formData = new FormData(interceptedForm);
    if (formData.get('name') === '') {
      return;
    }
    if (selectedMuscleGroups.length === 0) {
      return;
    }

    formData.append('muscle_group', JSON.stringify(selectedMuscleGroups));

    submit(formData, {
      method: 'post',
      action: '/exercise/add',
    });
    console.log('submitted');

    exercises.push({ id: exercises.length + 1, name: formData.get('name') as string, muscle_group: selectedMuscleGroups });
  }

  function toggleMuscleGroup(muscleGroup: MuscleGroup) {
    if (selectedMuscleGroups.includes(muscleGroup)) {
      setSelectedMuscleGroup(selectedMuscleGroups.filter((selectedMuscleGroup) => selectedMuscleGroup !== muscleGroup));
    } else {
      setSelectedMuscleGroup([...selectedMuscleGroups, muscleGroup]);
    }
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
                    <Label className={'block'}>Name</Label>
                    <Input type='text' className={'p-0 mt-0 sm:p-0 md:p-0'} name='name' />
                  </Field>
                  <Field className={'flex flex-col space-y-[12px]'}>
                    <Label htmlFor='body_part' className={'... block'}>Targeted muscle(groups)</Label>
                    <Dropdown>
                      <DropdownButton className={'block w-32'}>Select muscle(group)</DropdownButton>
                      <DropdownMenu>
                        {muscleGroups.map((muscleGroup) => (
                          <DropdownItem
                            key={muscleGroup.id}
                            onClick={(event) => {
                              event.preventDefault();
                              toggleMuscleGroup(muscleGroup);
                            }}
                          >
                            {muscleGroup.name}
                          </DropdownItem>
                        ))}
                      </DropdownMenu>
                    </Dropdown>
                  </Field>
                  {selectedMuscleGroups.length > 0 ? (
                    <Field className={'flex flex-col space-y-[12px]'}>
                      <Label className={'block'}>Selected muscle groups</Label>
                      <ul>
                        {selectedMuscleGroups.map((muscleGroup) => (
                          <li key={muscleGroup.id}>
                            <Text className={'...'}>{muscleGroup.name}</Text>
                          </li>
                        ))}
                      </ul>
                    </Field>
                  ) : (
                    <p>Please select at least one muscle </p>
                  )}
                </FieldGroup>
                <Button type='submit' className={'... mt-4 mb-4'}>Add exercise</Button>
              </div>
            </Form>
          </div>
        </div>
      </div >
    </div >
  );
}
