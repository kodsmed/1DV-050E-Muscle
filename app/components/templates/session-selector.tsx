import { TrainingsSession } from 'app/types/sessions';
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from 'app/components/catalyst/dropdown';

export function SessionSelector({ sessions, callback }: { sessions: TrainingsSession[], callback: (session: TrainingsSession) => void}) {
  // return a cc div with a dropdown of all sessions
  return (
    <div className='w-full flex flex-col justify-center items-center'>
      <Dropdown>
          <DropdownButton className='w-48'>Select a session</DropdownButton>
          <DropdownMenu>
            {sessions.map((session) => (
              <DropdownItem key={session.id}
              onClick={ ()=>{callback(session)} }
              onTouchEnd={() => {callback(session)} }
              onKeyUp={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  callback(session)
                }
              }}>{session.session_name}</DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>

  );
}