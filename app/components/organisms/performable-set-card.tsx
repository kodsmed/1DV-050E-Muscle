import { useState } from 'react';
import { ExerciseIcon } from 'app/components/organisms/exercise-card';
import { ButtonField } from 'app/components/organisms/button-field';
import { Button } from 'app/components/catalyst/button';
import { Set } from '~/types/sessions';


export function PerformableSetCard(
  { updateCallback, reportDoneCallback, currentSet }:
    {
      updateCallback: (currentSet: Set) => void,
      reportDoneCallback: () => void,
      currentSet: Set,
    }) {
  const [weight, setWeight] = useState(currentSet.weight || 0);
  const [repetitions, setRepetitions] = useState(currentSet.repetitions || 0);
  const [minutes, setMinutes] = useState(currentSet.duration_minutes || 0);
  const [stateRepRest, setRepRest] = useState(currentSet.rest_seconds || 0);
  const [atSet, setAtSet] = useState(1);
  const [resting, setResting] = useState(false);

  function setStates({ changedWeight, reps, duration, repRest }: { changedWeight: number | null, reps: number | null, duration: number | null, repRest: number | null }) {

    currentSet.weight = changedWeight || weight;
    currentSet.repetitions = reps || repetitions;
    currentSet.duration_minutes = duration || minutes;
    currentSet.rest_seconds = repRest || stateRepRest;

  }

  function updateWeight(value: number) {
    if (value < 0) {
      value = 0;
    }
    if (value > 150) {
      value = 150;
    }
    setWeight(value);
    setStates({ changedWeight: value, reps: null, duration: null, repRest: null })
  }

  function updateRepetitions(value: number) {
    if (value < 0) {
      value = 0;
    }
    if (value > 150) {
      value = 150;
    }
    setRepetitions(value);
    setStates({ changedWeight: null, reps: value, duration: null, repRest: null })
  }

  function updateMinutes(value: number) {
    if (value < 0) {
      value = 0;
    }
    if (value > 360) {
      value = 360;
    }
    setMinutes(value);
    setStates({ changedWeight: null, reps: null, duration: value, repRest: null })
  }

  function updateSets() {
    waitRestTime(stateRepRest);
    updateCallback(currentSet)
    if (atSet < currentSet.sets) {
      setAtSet(atSet + 1);
    } else {
      setAtSet(1);
      reportDoneCallback();
    }
  }

  function waitRestTime(seconds: number = 0) {
    console.log('waitRestTime', seconds)
    if (seconds > 0) {
      setResting(true);
      setTimeout(() => {
        console.log('tick')
        setRepRest(seconds - 1);
        waitRestTime(seconds - 1);
      }, 1000);
    } else {
    setResting(false);
    setRepRest(currentSet.rest_seconds || 0)
    }
  }

  function getRestTimeString() {
    let restTimeString = '';
    const minutes = Math.floor(stateRepRest / 60);
    const seconds = stateRepRest % 60;

    if (minutes > 0) {
      restTimeString += `${minutes} minutes `;
    }
    if (seconds > 0) {
      restTimeString += `${seconds} seconds`;
    }

    return restTimeString;
  }


  console.log('currentSet', currentSet)

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full m-4">
      {resting === false ? (
        <div className="flex md:flex-row flex-col justify-left space-x-4 w-full items-center">
          <div className="flex flex-col items-center w-48">
            <ExerciseIcon exercise={currentSet.exercise} />
            <h2 className="font-bold text-1xl">{currentSet.exercise.name}</h2>
            <h3 className='text-md text-slate-700'>{currentSet.sets} sets</h3>
          </div>
          <div className='flex flex-row  flex-wrap gap-4 w-full'>
            {currentSet.weight ? (
              <ButtonField prompt='Weight' unit='kg' value={currentSet.weight} buttonValues={[1, 5, 10]} callback={updateWeight} />
            ) : (
              ''
            )}
            {currentSet.repetitions ? (
              <ButtonField prompt='Repetitions' unit='' value={currentSet.repetitions} buttonValues={[1, 5, 10]} callback={updateRepetitions} />
            ) : (
              ''
            )}
            {currentSet.duration_minutes ? (
              <ButtonField prompt='Duration' unit='min' value={currentSet.duration_minutes} buttonValues={[1, 5, 10]} callback={updateMinutes} />
            ) : (
              ''
            )}
            <Button onClick={updateSets} className={'mt-12'}><div><p className='px-8'>Done</p><p>Set {atSet} of {currentSet.sets}</p></div></Button>
          </div>
        </div>
      ) : (
        <div className="flex md:flex-row flex-col justify-left space-x-4 w-full items-center">
          <div className="flex flex-col items-center w-48">
            <ExerciseIcon exercise={currentSet.exercise} />
            <h2 className="font-bold text-1xl">{currentSet.exercise.name}</h2>
            <h3 className='text-md text-slate-700'>{currentSet.sets} sets</h3>
          </div>
          <div className='flex flex-row  flex-wrap gap-4 w-full'>
            <div className='text-2xl font-bold'>Rest</div>
            <div className='text-2xl font-bold'>{getRestTimeString()}</div>
          </div>
        </div>
      )}
    </div >
  );
}