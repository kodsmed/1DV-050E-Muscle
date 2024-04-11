import { TrainingsSession } from "~/routes/sessions";

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