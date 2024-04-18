import { TrainingsSession } from "app/types/sessions";
import { Edit, Trashcan } from "app/components/atoms/icons";
import { Button } from "app/components/catalyst/button";
export function SessionsLayout({ sessions }: { sessions: TrainingsSession[] }) {
  return (
    <div>
      <ul>
        {sessions.map((session) => (
          <li key={session.id}>
            <div className = 'shadow-md rounded m-4 p-4'>
              <div className="flex justify-between">
              <h2 className = 'font-bold text-lg inline'>{session.session_name}</h2>
              <h2 className = 'italic text-lg inline'>Created: {session.created_at?.split('T')[0]}</h2>
              </div>


              <ul className="flex flex-col space-y-4">
                {session.sets.map((set) => (
                  <li key={set.id}>
                  <h3>{set.exercise.name}</h3>
                    <div className="flex justify-between">
                      <p>Weight: {set.weight}</p>
                      <p>Repetitions: {set.repetitions}</p>
                      <p>Duration: {set.duration_minutes} minutes</p>
                      <p>Sets: {set.sets}</p>
                      <p>Rest between sets: {Math.floor(set.rest_seconds / 60) > 0 ? `${Math.floor(set.rest_seconds)}min`:''} {set.rest_seconds % 60}s</p>
                      <div className="flex flex-row gap-4">
                        <a href={ "/sessionplanner?session=" + session.id || '-1' }><Edit /></a><Button><Trashcan /></Button></div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}