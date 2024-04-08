import { Arm, Legs, Back, Torso } from 'app/components/atoms/icons';
import { ExerciseInterface } from 'app/components/organisms/exercises';

function ExerciseIcon ({ exercise }: { exercise: ExerciseInterface }) {
  let Icon
  switch (exercise.body_part) {
    case 'ARM':
      Icon = <Arm />;
      break;
    case 'LEG':
      Icon = <Legs />;
      break;
    case 'BACK':
      Icon = <Back />;
      break;
    case 'TORSO':
      Icon = <Torso />;
      break;
    default:
      Icon = null;
  }

  return (
    <div className='rounded-full shadow-md'>
      {Icon}
    </div>
  );
}

export function ExerciseCard({ exercise, clickCallback, index }: { exercise: ExerciseInterface, clickCallback: (event: React.MouseEvent | React.TouchEvent | React.KeyboardEvent, index: number) => void, index: number}) {
  return (
    <div
      id={exercise.name}
      className="bg-white p-4 rounded-lg shadow-md w-56 m-4"
      role='button'
      tabIndex={index}
      onMouseDown={(event) => clickCallback(event, index)}
      onTouchEnd={(event) => clickCallback(event, index)}
      onKeyDown={(event) => clickCallback(event, index)}
    >
      <div className="flex justify-left space-x-4 items-center">
        <ExerciseIcon exercise={exercise} />
        <h2 className="font-bold text-1xl">{exercise.name}</h2>
      </div>
    </div>
  );
}

export function AddExerciseCard({ clickCallback, index }: { clickCallback: () => void, index: number}) {
  return (
    <div
      id='add-exercise-card'
      className="p-4 rounded-lg shadow-md w-56 m-4"
      role='button' tabIndex={index}
      onClick={clickCallback}
      onTouchEnd={clickCallback}
      onKeyDown={clickCallback}
    >
      <div className="flex justify-left space-x-4 items-center">
        <div className="rounded-full shadow-md">
          <div className="flex justify-center items-center w-12 h-12 rounded-full">
            <h1 className='font-bold text-center text-4xl'>+</h1>
          </div>
        </div>
        <h2 className="font-bold text-1xl">New Exercise</h2>
      </div>
    </div>
  );
}