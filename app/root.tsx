import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  type MetaFunction,
} from "@remix-run/react";
import {
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/cloudflare";
import { LinksFunction } from "@remix-run/cloudflare";
import stylesheet from "~/tailwind.css?url";
import { MainLayout } from "./components/templates/main-layout";

// See if ?code is in the URL, if so, redirect to /login as that comes from either an OAuth2 provider or magic link.
export async function loader({ context, request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (code) {
    return redirect("/login", { headers: context.headers });
  }
  return null;
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

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <MainLayout>{children}</MainLayout>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
