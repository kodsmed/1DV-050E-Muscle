import { useState } from 'react';
import { Calendar } from 'react-calendar';
import { Button } from '../catalyst/button';
import { CalendarIcon } from '../atoms/icons';
import { toShortDateString } from 'app/../functions/toShortDateString';

import 'react-calendar/dist/Calendar.css';

//Suggest replacing this with Tailwind-UI Calendar component
export function CalendarComponent({ changeCallback, usedDates }: { changeCallback: React.Dispatch<Date>, usedDates: Date[]}) {

  type ValuePiece = Date | null;
  type Value = ValuePiece | [ValuePiece, ValuePiece];
  const [value, setValue] = useState<Value>(new Date());
  const [expanded, setExpanded] = useState(false);
  const [shortDateString, setShortDateString] = useState(toShortDateString(value as Date));

  function onChange(nextValue: Value) {
    setValue(nextValue);
    changeCallback(nextValue as Date);
    updateShortDateString();
    setExpanded(false);
  }

  function updateShortDateString() {
    setShortDateString(toShortDateString(value as Date));
  }

  function toggleExpanded() {
    setExpanded(!expanded);
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return (
    <div>
      {!expanded &&
        <Button onClick={toggleExpanded}><CalendarIcon />{shortDateString}</Button>
      }
      {expanded &&
        <Calendar
          value={value}
          onChange={onChange}
          minDetail='year'
          maxDate={yesterday}
          tileDisabled={({date}) => {
            let conflict = false
            usedDates.forEach(usedDate => {
              if (toShortDateString(usedDate) === toShortDateString(date)) {
                conflict = true;
              }
            });
            return conflict;
          }}
        />
      }
    </div>
  );
}