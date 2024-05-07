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
import { Program } from "~/types/program";
import { TRAINING_DAY_STATUS, TRAINING_DAY_STATUStoReadableString } from "~/types/enums";
import { toShortDateString } from "functions/toShortDateString";
import { SessionSelector } from "~/components/templates/session-selector";
import { StatusSelector } from "~/components/organisms/statusSelector";

type WeekProgram = {
  program: Program,
  performed: boolean
}

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
    .order('id', { ascending: false })
  if (!programResponse || !programResponse.data) {
    return json({ sessions: response.data, program: null, history: null });
  }

  const historyResponse: Program[] = programResponse.data.filter((program: Program) => program.status !== null && program.status !== TRAINING_DAY_STATUS.PENDING);
  const programResponseData: Program[] = programResponse.data.filter((program: Program) => program.status === null || program.status === TRAINING_DAY_STATUS.PENDING);

  const programData: WeekProgram[] = [];

  // Check if the program is performed within the last 7 days and set the performed flag to true if it is
  const historyProgramsClone = [...historyResponse];
  programResponseData.forEach(program => {
    // locate the same program in the history if it exists
    const historyProgram = historyProgramsClone.find(historyProgram => historyProgram.training_day_id === program.training_day_id);
    if (historyProgram) {
      const programDate = new Date(program.created_at || '');
      const historyDate = new Date(historyProgram.date || '');
      const diffTime = Math.abs(programDate.getTime() - historyDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 7) {
        programData.push({ program: program, performed: true });
        historyProgramsClone.splice(historyProgramsClone.indexOf(historyProgram), 1);
      } else {
        programData.push({ program: program, performed: false });
      }
    } else {
      programData.push({ program: program, performed: false });
    }
  });

  return json({ sessions: response.data, program: programData, history: historyResponse });
}

export default function ProgramPlanner() {
  // Load the data from the loader
  const data = useLoaderData<typeof loader>() as { sessions: TrainingsSession[], program: WeekProgram[] | null, history: Program[] | null };
  const submit = useSubmit();
  const usedDates = [] as Date[];
  data.history?.forEach(program => {
    usedDates.push(new Date(program.date || ''));
  });

  const sessions = data.sessions;

  // State to keep track of the selected session and date
  const [selectedSession, setSelectedSession] = useState<TrainingsSession | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [stateProgram, setProgram] = useState<WeekProgram[]>(data.program || []);
  const [stateHistory, setHistory] = useState<Program[]>(data.history || []);
  const [comment, setComment] = useState<string>('');
  const [status, setStatus] = useState<TRAINING_DAY_STATUS | null>(null);

  // Function to add a session to the program
  function addProgram() {
    if (!selectedSession) {
      return;
    }

    // check if there is already 7 sessions in the program
    if (stateProgram.length >= 7) {
      return;
    }

    // Add the session to the program
    setProgram([...stateProgram, { program: { training_day_id: selectedSession.id as number }, performed: false }]);

    // Save the program to the database
    const formData = new FormData();
    formData.append('training_day_id', `${selectedSession.id}`);
    submit(formData, {
      method: 'post',
      action: '/program/add',
    });
  }

  // Function to remove a session from the program
  function removeProgram() {
    if (!selectedSession) {
      return;
    }

    // Remove the session from the program... but just one instance
    const programClone = [...stateProgram];
    // first try to find the program in the program list with performed set to false
    const programIndex = programClone.findIndex(program => program.program.training_day_id === selectedSession.id && !program.performed);
    if (programIndex >= 0) {
      programClone.splice(programIndex, 1);
    } else {
      // if not found, remove the first instance of the program
      const programIndex = programClone.findIndex(program => program.program.training_day_id === selectedSession.id);
      if (programIndex >= 0) {
        programClone.splice(programIndex, 1);
      }
    }
    setProgram(programClone);

    // Remove the program from the database
    const formData = new FormData();
    formData.append('training_day_id', `${selectedSession.id}`);
    submit(formData, {
      method: 'post',
      action: '/program/remove',
    });
  }

  function updateStatus(status: TRAINING_DAY_STATUS) {
    setStatus(status)
  }

  function historyAddHandler() {
    if (!selectedSession || !selectedDate || !status) {
      return;
    }
    const program: Program = {
      training_day_id: selectedSession.id as number,
      date: selectedDate.toISOString(),
      status: status,
      comment: comment || ''
     }
    setHistory([program, ...stateHistory]);
    saveHistoryProgram(program);
  }

  // Function to update the program
  function saveHistoryProgram(program: Program) {
    // Save the program to the database
    const formData = new FormData();
    formData.append('training_day_id', `${program.training_day_id}`);
    formData.append('date', program.date || '');
    formData.append('status', program.status || '');
    formData.append('comment', program.comment || '');
    submit(formData, {
      method: 'post',
      action: '/program/add-history',
    });
  }

  // Display the user's program
  return (
    <div className="w-5/6 h-full">
      <h2 className="font-bold font-xl mb-2">Your program</h2>
      <div className="w-full flex flex-row flex-wrap justify-center items-top gap-8">
        {stateProgram?.map(week => (
          <div key={week.program.id} className="w-64 mb-4">
            {
              week.performed ? (
                <Button disabled={true} className="flex flex-col gap-8 mb-8 w-64">
                  <p>
                    {// Get the session from the id
                      sessions.find(session => session.id === week.program.training_day_id)?.session_name
                    }
                  </p>
                  <p>Performed this week</p>
                </Button>
              ) : (
                <a key={week.program.id} href={'/session-perform?session=' + week.program.training_day_id}>
                  <Button disabled={false} className="flex flex-col gap-8 mb-8 w-64 hover:cursor-pointer">
                    <p>
                      {// Get the session from the id
                        sessions.find(session => session.id === week.program.training_day_id)?.session_name
                      }
                    </p>
                    <p>Perform now</p>
                  </Button>
                </a>
              )
            }
          </div>
        ))}
        <div className="w-64 flex flex-col gap-4 h-fit">
          <SessionSelector sessions={sessions} callback={setSelectedSession} />
          {selectedSession && stateProgram.length < 7 && (
            <Button onClick={addProgram}>Add {selectedSession.session_name}</Button>
          )}
          {selectedSession && stateProgram.length > 0 && (
            <Button onClick={removeProgram}>Remove {selectedSession.session_name}</Button>
          )}
        </div>
      </div>
      <div className="border-t-2 border-dashed border-slate-300 mt-4 p-4">
        <h2 className="font-bold font-xl mb-2">Program history</h2>
        <div className="flex flex-row gap-8 w-full">
          <SessionAndDateSelector sessions={sessions} selectedSession={selectedSession} setSelectedSession={setSelectedSession} setSelectedDate={setSelectedDate} usedDates={usedDates} />
          <input type="text" name='comment' className="max-h-10" placeholder="Add a comment" onChange={(event) => { setComment(event.target.value) }} />
          <StatusSelector status={status} updateStatus={updateStatus} />
          <Button className="max-h-10" onClick={historyAddHandler}>Add to program history</ Button>
        </div>
        <ul className="mt-4">
          {stateHistory?.map(program => (
            <li key={program.id} className="flex flex-row gap-8 mb-8">
              {toShortDateString(new Date(program.date || ''))} - {
                // Get the session from the id
                sessions.find(session => session.id === program.training_day_id)?.session_name
              }
              <div className="flex flex-row gap-2 w-64">
                <p>Status:</p>
                <p>{TRAINING_DAY_STATUStoReadableString(program.status ? program.status : TRAINING_DAY_STATUS.DONE)}</p>
              </div>
              <div className="flex flex-row gap-2">
                <p>Comment:</p>
                <p>{program.comment}</p>
              </div>

            </li>
          ))}
        </ul>

      </div>

    </div >
  );
}
