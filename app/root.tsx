import {
  Form,
  Link,
  Links,
  Meta,
  NavLink,
  Scripts,
  ScrollRestoration,
  Outlet,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";

import { useEffect } from "react";

import type {
  LoaderFunctionArgs,
} from "@remix-run/node";

import { json, redirect } from "@remix-run/node";

import appStylesHref from "./app.css?url";

import { getContacts, createEmptyContact } from "./data";


export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);
  return json({ contacts, q });
}

export async function action() {
  const contact = await createEmptyContact();
  return redirect(`/contacts/${contact.id}/edit`);
}



export function links() {
  return [{ rel: "stylesheet", href: appStylesHref }];
}

export default function App() {
  const { contacts, q } = useLoaderData<typeof loader>();

  useEffect(() => {
    const searchField = document.getElementById("q") as HTMLInputElement;
    if (searchField) {
      searchField.value = q || "";
    }
  }, [q]);

  const navigation = useNavigation();
  const submit = useSubmit();
  const searching = navigation.location && new URLSearchParams(navigation.location.search).has("q");

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="sidebar">
          <h1>Remix Contacts</h1>
          <div>
            <Form id="search-form" role="search" onChange={(event) => {
                const isFirstSearch = q === null;
                submit(event.currentTarget, {
                  replace: !isFirstSearch,
                })
              }}>
              <input
                className={searching ? "loading" : ""}
                id="q"
                aria-label="Search contacts"
                defaultValue={q || ""}
                placeholder="Search"
                type="search"
                name="q"
              />
              <div id="search-spinner" aria-hidden hidden={!searching} />
            </Form>
            <Form method="post">
              <button type="submit">New</button>
            </Form>
          </div>
          <nav>
            {contacts.length ? (
              <ul>
                {contacts.map((contact) => (
                  <li key={contact.id}>
                    <NavLink className={({ isActive, isPending }) =>
                      isActive ? 'active' : isPending ? 'pending' : ''
                    } to={`contacts/${contact.id}`}
                    >
                      <Link to={`contacts/${contact.id}`}>
                        {contact.first || contact.last ? (
                          <>
                            {contact.first} {contact.last}
                          </>
                        ) : (
                          <i>No Name</i>
                        )}{" "}
                        {contact.favorite ? (
                          <span>★</span>
                        ) : null}
                      </Link>
                    </NavLink>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                <i>No contacts</i>
              </p>
            )}
          </nav>
        </div>
        <div  className={
            navigation.state === "loading" && !searching ? "loading" : ""
          }  id="detail"
        >
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
