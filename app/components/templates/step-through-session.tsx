import { TrainingsSession, Set } from 'app/types/sessions';
import { PerformableSetCard } from 'app/components/organisms/performable-set-card';

export function PerformSession(
  { session, atSet, updateSetCall, advanceSetCallback }:
  {
    session: TrainingsSession,
    atSet: number,
    updateSetCall: (set: Set) => void,
    advanceSetCallback: () => void,
  }
) {

  function updateSetData(set: Set) {
    updateSetCall(set);
  }

  function advanceSet() {
    console.log('advanceSet in perform-session.tsx');
    // save any changes to the current set
    updateSetCall(session.sets[atSet]);
    advanceSetCallback();
  }

  const currentSet = session.sets[atSet];

  return (
    <div className='w-full flex flex-col py-24 justify-center items-center'>
      <PerformableSetCard currentSet={currentSet} updateCallback={updateSetData} reportDoneCallback={advanceSet} />
    </div>
  );
}