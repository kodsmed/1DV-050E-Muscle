import { CalendarComponent } from '../organisms/calendar';
import { TrainingsSession } from '~/types/sessions';
import { DropdownButton, Dropdown, DropdownItem, DropdownMenu } from '../catalyst/dropdown';

export function SessionAndDateSelector({sessions, selectedSession, setSelectedSession, setSelectedDate, usedDates} : {sessions: TrainingsSession[], selectedSession: TrainingsSession | null, setSelectedSession: React.Dispatch<TrainingsSession>, setSelectedDate: React.Dispatch<Date>, usedDates: Date[]}) {

  return (
    <div className='flex flex-row gap-8'>
      <Dropdown>
        <DropdownButton className='max-h-10'>
          {selectedSession?.session_name || 'Select a session'}
        </DropdownButton>
        <DropdownMenu>
          {sessions.map(session => (
            <DropdownItem key={session.id} onClick={() => {setSelectedSession(session)}}>{session.session_name}</DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
      <CalendarComponent changeCallback={ setSelectedDate } usedDates={ usedDates }/>
    </div>
  );
}