import { Arm, Legs, Back, Torso } from 'app/components/atoms/icons';
import { ExerciseInterface } from 'app/types/exercise';

export function ExerciseIcon({ exercise }: { exercise: ExerciseInterface }) {
  let Icon
  // Set the primary muscle group icon, use the first one in the list.
  // Use the componentname if its set, otherwise use the uri.
  if (exercise.muscle_group.length > 0) {
    const muscleGroup = exercise.muscle_group[0];
    if (muscleGroup.icon_component) {
      // create a component mapping
      const components = {
        Arm: <Arm />,
        Legs: <Legs />,
        Back: <Back />,
        Torso: <Torso />,
      };
      // try to find the component by name
      Icon = components[muscleGroup.icon_component as keyof typeof components];
    } else if (muscleGroup.uri) {
      Icon = <img src={muscleGroup.uri} alt={muscleGroup.name} />;
    }

    // If no icon was found, use a default icon
    if (!Icon) {
      // if the component is not found, use the uri
      const source = muscleGroup.uri || "/icons/default.svg";
      Icon = <img src={source} alt={muscleGroup.name} />;
    }

    // If no muscle group was found, use a default icon
    if (!Icon) {
      Icon = <img src="/icons/default.svg" alt="default icon" />;
    }

    return (
      <div className='rounded-full shadow-md'>
        {Icon}
      </div>
    );
  }
}

export function ExerciseCard({ exercise, clickCallback, index }: { exercise: ExerciseInterface, clickCallback: (exercise: ExerciseInterface) => void, index: number}) {
  return (
    <div
      id={exercise.name}
      className="bg-white p-4 rounded-lg shadow-md w-56 m-4"
      role='button'
      tabIndex={index}
      onMouseDown={() => clickCallback(exercise)}
      onTouchEnd={() => clickCallback(exercise)}
      onKeyDown={() => clickCallback(exercise)}
    >
      <div className="flex justify-left space-x-4 items-center">
        <ExerciseIcon exercise={exercise} />
        <h2 className="font-bold text-1xl">{exercise.name}</h2>
      </div>
    </div>
  );
}

export function AddExerciseCard({ clickCallback, index }: { clickCallback: () => void, index: number }) {
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