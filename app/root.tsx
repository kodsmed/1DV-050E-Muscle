import { ReactNode } from "react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  type MetaFunction,
} from "@remix-run/react";
import {
  json,
  LoaderFunctionArgs,
  redirect,
  LinksFunction,
} from "@remix-run/cloudflare";
import { getRole } from "functions/userRole";
import stylesheet from "~/tailwind.css?url";
import { MainLayout } from "./components/templates/main-layout";
import { getUserDetails, UserDetails } from "functions/getUserDetails";


// See if ?code is in the URL, if so, redirect to /login as that comes from either an OAuth2 provider or magic link.
export async function loader({ context, request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  let user = null;
  if (code) {
    return redirect("/login", { headers: context.headers });
  } else {
    const response = await context.supabase.auth.getUser();
    user = response?.data.user;

    const requestSegments = request.url.split("/");
    // Join 3rd to last segment to last segment to get the request path
    const requestPath = "/" + requestSegments.slice(3, requestSegments.length).join("/");
    if (!user) {

      if (requestPath === "/" || requestPath === "/login" || requestPath === "/register") {
        return json({
          user: 'Anonymous',
          role: 'ANONYMOUS',
          userDetails: null
        });
      } else {
        return redirect("/login", { headers: context.headers });
      }
    }

    const uuid = user?.id as string;
    const role = await getRole(uuid, context.supabase);
    const userDetails = await getUserDetails(uuid, context.supabase) as UserDetails | false;
    let userProfileToPass: UserDetails | null;
    if (userDetails === false) {
      if (requestPath !== "/profile") {
        return redirect("/profile", { headers: context.headers });
      }
      userProfileToPass = null;
    } else {
      userProfileToPass = userDetails;
    }


    return json({
      user,
      role,
      userDetails: userProfileToPass
    });
  }
}

export const meta: MetaFunction = () => {
  return [
    { title: "Muskle - Plan, Perform, Pursue" },
    {
      name: "description",
      content: "Muskle lets you pre-plan your workouts, log as you perform them, and helps you pursue your goals by providing easy logging of your progress and achievements.",
    },
  ];
};

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export function Layout({ children }: { children: ReactNode }) {
  const loaderData = useLoaderData<typeof loader>();

  // Safely access role and userDetails, providing defaults if necessary
  const { role = 'ANONYMOUS', userDetails = null } = loaderData || {};
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <MainLayout role={role} userDetails={userDetails}>{children}</MainLayout>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
