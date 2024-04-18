import { useState } from 'react';
import { ExerciseInterface } from 'app/types/exercise';
import { ExerciseIcon } from 'app/components/organisms/exercise-card';
import { ButtonField } from 'app/components/organisms/button-field';
import { Set } from '~/types/sessions';


export function SetCard({ exercise, index, updateCallback, preSet }: { exercise: ExerciseInterface, index: number, updateCallback: (setData: { id: number, weight: number, repetitions: number, duration: number, sets:number, repRest: number }) => void , preSet: Set }) {
  const [weight, setWeight] = useState(preSet.weight || 0);
  const [repetitions, setRepetitions] = useState(preSet.repetitions || 0);
  const [minutes, setMinutes] = useState(preSet.duration_minutes || 0);
  const [stateSets, setSets] = useState(preSet.sets || 0);
  const [stateRepRest, setRepRest] = useState(preSet.rest_seconds || 0);

  function sendCallback({ id, changedWeight, reps, duration, sets, repRest }: { id: number | null, changedWeight: number | null, reps: number | null, duration: number | null, sets: number | null, repRest: number | null }) {
    updateCallback({ id: id || index, weight: changedWeight || weight, repetitions: reps || repetitions, duration: duration || minutes, sets: sets || stateSets, repRest: repRest || stateRepRest})
  }

  function updateWeight(value: number) {
    if (value < 0) {
      value = 0;
    }
    if (value > 150) {
      value = 150;
    }
    setWeight(value);
    sendCallback({ id: null, changedWeight: value, reps: null, duration: null, sets: null, repRest: null})
  }

  function updateRepetitions(value: number) {
    if (value < 0) {
      value = 0;
    }
    if (value > 150) {
      value = 150;
    }
    setRepetitions(value);
    sendCallback({ id: null, changedWeight: null, reps: value, duration: null, sets: null, repRest: null})
  }

  function updateMinutes(value: number) {
    if (value < 0) {
      value = 0;
    }
    if (value > 360) {
      value = 360;
    }
    setMinutes(value);
    sendCallback({ id: null, changedWeight: null, reps: null, duration: value, sets: null, repRest: null})
  }

  function updateSets(value: number) {
    if (value < 0) {
      value = 0;
    }
    if (value > 10) {
      value = 10;
    }
    setSets(value);
    sendCallback({ id: null, changedWeight: null, reps: null, duration: null, sets: value, repRest: null})
  }

  function updateRepRest(value: number) {
    if (value < 0) {
      value = 0;
    }
    if (value > 360) {
      value = 360;
    }
    setRepRest(value);
    sendCallback({ id: null, changedWeight: null, reps: null, duration: null, sets: null, repRest: value})
  }

  return (
    <div
      id={exercise.name}
      className="bg-white p-4 rounded-lg shadow-md w-full m-4"
      role='button'
      tabIndex={index}
    >
      <div className="flex md:flex-row flex-col justify-left space-x-4 w-full items-center">
        <ExerciseIcon exercise={exercise} />
        <h2 className="font-bold text-1xl">{exercise.name}</h2>
        <div className='flex flex-row  flex-wrap gap-4 w-full'>
          <ButtonField prompt='Weight' unit='kg' value={weight} buttonValues={[1,5,10]} optional={false} callback={updateWeight} />
          <ButtonField prompt='Repetitions' unit='' value={repetitions} buttonValues={[1,5,10]} optional={false} callback={updateRepetitions} />
          <ButtonField prompt='Duration' unit='min' value={minutes} buttonValues={[1,5,10]} optional={true} callback={updateMinutes} />
          <ButtonField prompt='Sets' unit='' value={stateSets} buttonValues={[1]} optional={false} callback={updateSets} />
          <ButtonField prompt='Rest between sets' unit={['s','m']} unitsFactor={60} buttonValues={[10,30, 60]} value={stateRepRest} optional={true} callback={updateRepRest} />
        </div>
      </div>
    </div >
  );
}