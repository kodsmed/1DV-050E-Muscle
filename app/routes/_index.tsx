import {
  json,
  type LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { User } from "@supabase/supabase-js";
import { getRole } from "functions/userRole";
import { getUserDetails, UserDetails } from "functions/getUserDetails";
import { toShortDateString } from "functions/toShortDateString";
import { Program } from "~/types/program";
import { Button } from "~/components/catalyst/button";
import { TrainingsSession } from "~/types/sessions";




export async function loader({ context }: LoaderFunctionArgs) {
  const response = await context.supabase.auth.getUser();
  const user = response?.data.user;

  const uuid = user?.id as string;
  const role = await getRole(uuid, context.supabase);

  // check if the user have a session planned in the program for today
  const today = new Date();
  const todayString = toShortDateString(today);
  const { data: program } = await context.supabase
    .from('program')
    .select('*')
    .eq('date', todayString);
  if (program && program.length > 0 && (program[0].status === 'PENDING' || program[0].status === null)) {
    const { data: session } = await context.supabase
      .from('training_day')
      .select('*')
      .eq('id', program[0].training_day_id);
    if (!session || session.length === 0) {
      program[0].session_name = "Unknown";
    } else {
      program[0].session_name = (session[0] as TrainingsSession).session_name;
    }

    return json({
      user,
      role,
      program: program[0] as Program,
      userDetails: await getUserDetails(uuid, context.supabase) as UserDetails | null
    });
  } else {
    return json({
      user,
      role,
      program: null,
      userDetails: await getUserDetails(uuid, context.supabase) as UserDetails | null
    });
  }
}

export default function Index() {
  const data = useLoaderData<typeof loader>() as { user: User, role: string, program: Program, userDetails: UserDetails | null };
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }} className="w-full h-full md:bg-[url('/background.png')] md:bg-cover bg-no-repeat">
      <div className="flex justify-between items-center w-full h-full">
        <div className="flex flex-col justify-center items-center w-full h-full">
          <div className="bg-white bg-opacity-90 rounded-lg p-8 border-slate-400 border-2">
            {!data.userDetails && (
              <h1 className="text-4xl font-bold text-center">Welcome to Muskle!</h1>
            )}
            {data.userDetails && (
              <h1 className="text-4xl font-bold text-center">Welcome back, {data.userDetails.firstName}!</h1>
            )}
            {!data.user && (
              <div className="w-full">
                <p className="text-lg text-center mt-4">Please log in to access the site.</p>
                <div className="flex justify-center items-center gap-8">
                  <a href="/login" className="w-1/4" aria-label="login">
                    <Button href="/login" className="w-full">Log in</Button>
                  </a>
                  <a href="/register" className="w-1/4" aria-label="signup">
                    <Button href="/register" className="w-full">Sign up</Button>
                  </a>
                </div>

              </div>
            )}
            {data.user && (
              <div>
                {data.program ? (
                  <div>
                    <p className="text-lg text-center mt-4">You have a session planned for today.</p>
                    <a href={"/session-perform?session=" + data.program.training_day_id} className="w-full">
                      <Button className="w-full">Perform your planned {data.program.session_name}</Button>
                    </a>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg text-center mt-4">You have no session planned for today.</p>
                    <a href="/session-perform" className="w-full">
                      <Button className="w-full">Start a session</Button>
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
