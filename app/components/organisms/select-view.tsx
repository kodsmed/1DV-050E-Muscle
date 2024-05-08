import React from 'react';
import {  Exercise } from 'app/routes/view-progress';
import { TimeFrame } from '~/types/enums';

export function SelectView ({allMyExercises, setSelectedExercise, setSelectedTimeFrame}: {allMyExercises: Exercise[], setSelectedExercise: React.Dispatch<Exercise>, setSelectedTimeFrame: React.Dispatch<React.SetStateAction<TimeFrame>>}) {
  return (
    <div className='flex flex-row w-full justify-center h-42 border-b-2 border-slate-700 mt-8'>
      <div className='flex- flex-row w-3/4 justify-center gap-8 mb-4'>
      <select onChange={(e) => setSelectedExercise(allMyExercises.find(exercise => exercise.id === parseInt(e.target.value)) as Exercise)}>
        <option value={0}>Select an exercise</option>
        {allMyExercises.map((exercise, index) => <option key={index} value={exercise.id}>{exercise.name}</option>)}
      </select>
      <select onChange={(e) => setSelectedTimeFrame(e.target.value as TimeFrame)}>
        {Object.values(TimeFrame).map((timeFrame, index) => <option key={index} value={timeFrame}>{timeFrame}</option>)}
      </select>
      </div>
    </div>
  );
}