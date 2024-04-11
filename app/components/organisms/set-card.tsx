import { useState } from 'react';
import { ExerciseInterface } from 'app/components/organisms/exercises';
import { ExerciseIcon } from 'app/components/organisms/exercise-card';
import { ButtonField } from 'app/components/organisms/button-field';


export function SetCard({ exercise, index, updateCallback }: { exercise: ExerciseInterface, index: number, updateCallback: (setData: {id: number, weight: number, repetitions: number, duration: number}) => void } ){
  const [weight, setWeight] = useState(0);
  const [repetitions, setRepetitions] = useState(0);
  const [minutes, setMinutes] = useState(0);

  function sendCallback({id, changedWeight, reps, duration}:{id: number|null, changedWeight: number|null, reps: number|null, duration: number|null}) {
    updateCallback({id: id||index, weight: changedWeight||weight, repetitions: reps||repetitions, duration: duration||minutes})
  }

  function updateWeight(value: number) {
    if (value < 0) {
      value = 0;
    }
    if (value > 150) {
      value = 150;
    }
    setWeight(value);
    sendCallback({id:null, changedWeight: value, reps: null, duration: null})
  }

  function updateRepetitions(value: number) {
    if (value < 0) {
      value = 0;
    }
    if (value > 150) {
      value = 150;
    }
    setRepetitions(value);
    sendCallback({id:null, changedWeight: null, reps: value, duration: null})
  }

  function updateMinutes(value: number) {
    if (value < 0) {
      value = 0;
    }
    if (value > 360) {
      value = 360;
    }
    setMinutes(value);
    sendCallback({id:null, changedWeight: null, reps: null, duration: value})
  }

  return (
    <div
      id={exercise.name}
      className="bg-white p-4 rounded-lg shadow-md w-[42rem] m-4"
      role='button'
      tabIndex={index}
    >
      <div className="flex flex-row justify-left space-x-4 w-full items-center">
        <ExerciseIcon exercise={exercise} />
        <h2 className="font-bold text-1xl">{exercise.name}</h2>
        <div className='flex flex-row space-x-4 w-full justify-between'>
          <div className='flex flex-row space-x-4 w-full'>
            <ButtonField prompt='Weight' unit='kg' value={weight} optional={false} callback={updateWeight} />
            <ButtonField prompt='Repetitions' unit='' value={repetitions} optional={false} callback={updateRepetitions} />
            <ButtonField prompt='Duration' unit='min' value={minutes} optional={true} callback={updateMinutes} />
          </div>
        </div>
      </div>
    </div>
  );
}