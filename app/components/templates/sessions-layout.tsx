import { useState } from "react";
import { TrainingsSession } from "app/types/sessions";
import { Edit, Trashcan } from "app/components/atoms/icons";
import { Button } from "app/components/catalyst/button";
export function SessionsLayout({ sessions }: { sessions: TrainingsSession[] }) {
  const [loading, setLoading] = useState(false);
  return (
    <div className={loading ? 'cursor-wait' : ''}>
      <ul>
        {sessions.map((session) => (
          <li key={session.id}>
            <div className = 'shadow-md rounded m-4 p-4'>
              <div className="flex justify-between">
              <h2 className = 'font-bold text-lg inline'>{session.session_name}</h2>
              <div className="flex flex-row gap-4">
                <h2 className = 'italic text-lg inline'>Created: {session.created_at?.split('T')[0]}</h2>
                <a href={ "/sessionplanner?session=" + session.id || '-1' }><Button className={loading ? 'cursor-wait' : ''} disabled={loading}  onClick={()=>{setLoading(true)}}><Edit /></Button></a>
                <Button disabled={true} className='cursor-not-allowed'><Trashcan /></Button>
             </div>
              </div>


              <ul className="flex flex-col space-y-4 border-t-2 mt-2">
                {session.sets.map((set) => (
                  <li key={set.id} className="mt-2 border-b-2 border-slate-200">
                  <h3>{set.exercise.name}</h3>
                    <div className="flex justify-between">
                      {set.weight ? (<p className="w-48">Weight: {set.weight}</p>) : <p className="w-48"></p>}
                      {set.repetitions ? (<p className="w-48">Repetitions: {set.repetitions}</p>) : <p className="w-48"></p>}
                      {set.duration_minutes ? (<p className="w-48">Duration: {set.duration_minutes} minutes</p>) : <p className="w-48"></p>}
                      <p className="w-48">Sets: {set.sets}</p>
                      {set.rest_seconds ? (<p className="w-48">Rest between sets: {Math.floor(set.rest_seconds / 60) > 0 ? `${Math.floor(set.rest_seconds / 60)}min`: ''} {set.rest_seconds % 60}s</p>) : <p className="w-48"></p>}
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