import {
  json,
  redirect,
  type LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { useState } from "react";
import { TrainingsSession } from "../types/sessions";
import { SessionAndDateSelector } from "~/components/templates/session-date-selector";
import { Button } from 'app/components/catalyst/button'
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from 'app/components/catalyst/dropdown'
import { Program } from "~/types/program";
import { TRAINING_DAY_STATUS, TRAINING_DAY_STATUStoReadableString } from "~/types/enums";
import { toShortDateString } from "functions/toShortDateString";

export async function loader({ context }: LoaderFunctionArgs) {
  // Load the user
  const user = await context.supabase.auth.getUser();
  if (!user) {
    return redirect("/login", { headers: context.headers });
  }

  // Load the user's planned sessions "training_day" from the database
  const response = await context.supabase
    .from('training_day')
    .select('*')
  if (!response || !response.data) {
    return json({ sessions: [] });
  }

  // Load the user's program "program" from the database if any
  const programResponse = await context.supabase
    .from('program')
    .select('*')
    .order('date', { ascending: false });
  if (!programResponse || !programResponse.data) {
    return json({ sessions: response.data, program: null });
  }

  return json({ sessions: response.data, program: programResponse.data });
}

export default function ProgramPlanner() {
  // Load the data from the loader
  const data = useLoaderData<typeof loader>() as { sessions: TrainingsSession[], program: Program[] | null };
  const submit = useSubmit();
  const usedDates = [] as Date[];
  data.program?.forEach(program => {
    usedDates.push(new Date(program.date));
  });
  const sessions = data.sessions;

  // State to keep track of the selected session and date

  const [selectedSession, setSelectedSession] = useState<TrainingsSession | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [stateProgram, setProgram] = useState<Program[]>(data.program || []);
  const [comment, setComment] = useState<string>('');

  // Function to add a session to the program
  function addProgram() {
    if (!selectedSession || !selectedDate) {
      return;
    }

    // Check if the date is already in the program
    if (stateProgram.find(program => program.date === selectedDate.toISOString())) {
      console.error('Date already in program');
      return;
    }

    // Add the session to the program
    setProgram([...stateProgram, { training_day_id: selectedSession.id as number, date: selectedDate.toISOString() }]);

    // Save the program to the database
    const formData = new FormData();
    formData.append('training_day_id', `${selectedSession.id}`);
    formData.append('date', toShortDateString(selectedDate));
    submit(formData, {
      method: 'post',
      action: '/program/add',
    });
  }

  function updateStatus(program: Program, status: TRAINING_DAY_STATUS) {
    program.status = status;
    updateProgram(program);
  }

  function updateComment(program: Program, comment: string) {
    console.log('comment:', comment)
    program.comment = comment;
    updateProgram(program);
  }

  // Function to update the program
  function updateProgram(program: Program) {
    // Save the program to the database
    const formData = new FormData();
    formData.append('id', `${program.id}`);
    formData.append('training_day_id', `${program.training_day_id}`);
    formData.append('date', program.date);
    formData.append('status', program.status || '');
    formData.append('comment', program.comment || '');
    submit(formData, {
      method: 'post',
      action: '/program/update',
    });
  }

  // Display an add button to add a new session to the program
  // Display the user's program
  return (
    <div className="w-5/6 h-full">
      <h2 className="font-bold font-xl mb-2">Add a new session</h2>
      <div className="w-full flex flex-row justify-center items-top gap-8">
        <SessionAndDateSelector sessions={sessions} selectedSession={selectedSession} setSelectedSession={setSelectedSession} setSelectedDate={setSelectedDate} usedDates={usedDates}/>
        <Button className="max-h-10" type='submit' onClick={addProgram}>Add to program</ Button>
      </div>
      <div className="border-t-2 border-dashed border-slate-300 mt-4 p-4">
        <h2 className="font-bold font-xl mb-2">Your program</h2>
        <ul>
          {stateProgram?.map(program => (
            <li key={program.id} className="flex flex-row gap-8 mb-8">
              {toShortDateString(new Date(program.date))} - {
                // Get the session from the id
                sessions.find(session => session.id === program.training_day_id)?.session_name
              }
              {program.status ? (
                <div className="flex flex-row gap-2 w-64">
                  <p>Status:</p>
                  <p>{TRAINING_DAY_STATUStoReadableString(program.status)}</p>
                </div>
              ) : (
                <Dropdown>
                  <DropdownButton
                  >Pending</DropdownButton>
                  <DropdownMenu>
                    <DropdownItem
                      onClick={() => {
                        updateStatus(program, TRAINING_DAY_STATUS.DONE)
                      }}

                      onKeyUp={(event) => {
                        if (event.key === 'Enter') {
                          updateStatus(program, TRAINING_DAY_STATUS.DONE)
                        }
                      }}
                      onTouchEnd={() => {
                        updateStatus(program, TRAINING_DAY_STATUS.DONE)
                      }}
                    >
                      {TRAINING_DAY_STATUStoReadableString(TRAINING_DAY_STATUS.DONE)}
                    </DropdownItem>
                    <DropdownItem
                      onClick={() => {
                        updateStatus(program, TRAINING_DAY_STATUS.SKIPPED_INJURY)
                      }}
                      onKeyUp={(event) => {
                        if (event.key === 'Enter') {
                          updateStatus(program, TRAINING_DAY_STATUS.SKIPPED_INJURY)
                        }
                      }}
                      onTouchEnd={() => {
                        updateStatus(program, TRAINING_DAY_STATUS.SKIPPED_INJURY)
                      }}
                    >
                      {TRAINING_DAY_STATUStoReadableString(TRAINING_DAY_STATUS.SKIPPED_INJURY)}
                    </DropdownItem>
                    <DropdownItem
                      onClick={() => {
                        updateStatus(program, TRAINING_DAY_STATUS.SKIPPED_SORENESS)
                      }}
                      onKeyUp={(event) => {
                          if (event.key === 'Enter') {
                            updateStatus(program, TRAINING_DAY_STATUS.SKIPPED_SORENESS)
                          }
                      }}
                      onTouchEnd={() => {
                        updateStatus(program, TRAINING_DAY_STATUS.SKIPPED_SORENESS)
                      }}
                    >
                      {TRAINING_DAY_STATUStoReadableString(TRAINING_DAY_STATUS.SKIPPED_SORENESS)}
                    </DropdownItem>
                    <DropdownItem
                      onClick={() => {
                        updateStatus(program, TRAINING_DAY_STATUS.SKIPPED_PAIN)
                      }}
                      onKeyUp={(event) => {
                        if (event.key === 'Enter') {
                          updateStatus(program, TRAINING_DAY_STATUS.SKIPPED_PAIN)
                        }
                      }}
                      onTouchEnd={() => {
                        updateStatus(program, TRAINING_DAY_STATUS.SKIPPED_PAIN)
                      }}
                    >
                      {TRAINING_DAY_STATUStoReadableString(TRAINING_DAY_STATUS.SKIPPED_PAIN)}
                    </DropdownItem>
                    <DropdownItem
                      onClick={() => {
                        updateStatus(program, TRAINING_DAY_STATUS.SKIPPED_WEAK)
                      }}
                      onKeyUp={(event) => {
                        if (event.key === 'Enter') {
                          updateStatus(program, TRAINING_DAY_STATUS.SKIPPED_WEAK)
                        }
                      }}
                      onTouchEnd={() => {
                        updateStatus(program, TRAINING_DAY_STATUS.SKIPPED_WEAK)
                      }}
                    >
                      {TRAINING_DAY_STATUStoReadableString(TRAINING_DAY_STATUS.SKIPPED_WEAK)}
                    </DropdownItem>
                    <DropdownItem
                      onClick={() => {
                        updateStatus(program, TRAINING_DAY_STATUS.SKIPPED_OTHER)
                      }}
                      onKeyUp={(event) => {
                        if (event.key === 'Enter') {
                          updateStatus(program, TRAINING_DAY_STATUS.SKIPPED_OTHER)
                        }
                      }}
                      onTouchEnd={() => {
                        updateStatus(program, TRAINING_DAY_STATUS.SKIPPED_OTHER)
                      }}
                    >
                      {TRAINING_DAY_STATUStoReadableString(TRAINING_DAY_STATUS.SKIPPED_OTHER)}
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              )
              }
              {program.comment ? (
                <div className="flex flex-row gap-2">
                  <p>Comment:</p>
                  <p>{program.comment}</p>
                </div>
              ) : (
                <div className="flex flex-row gap-4">
                  <input type="text" name='comment' placeholder="Add a comment" onChange={(event) => {setComment(event.target.value)}} />
                  <Button onClick={()=> {
                    updateComment(program, comment)
                  }}>Add comment</Button>
                </div>

              )}
            </li>
          ))}
        </ul>

      </div>

    </div >
  );
}