import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import { Button } from "~/components/catalyst/button";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    {
      name: "description",
      content: "Welcome to Remix! Using Vite and Cloudflare!",
    },
  ];
};

export async function loader({ context }: LoaderFunctionArgs) {
  const user = await context.supabase.auth.getUser();

  // Retrieve the user's UUID and role from the database
  const uuid = user?.data?.user?.id;
  let role = null;

  if (uuid) {
    const { data, error } = await context.supabase
      .rpc('getRole', { arguuid: uuid });
    if (error) {
      console.error(error);
    }
    if (data) {
      role = data;
    }
  }
  return json({
    user,
    role,
  });
}

export default function Index() {
  const data = useLoaderData<typeof loader>();
  console.log("data.user :>> ", data.user);
  console.log("data.role :>> ", data.role);
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Welcome to Remix (with Vite and Cloudflare)</h1>
      <ul>
        <li>
          <a
            target="_blank"
            href="https://developers.cloudflare.com/pages/framework-guides/deploy-a-remix-site/"
            rel="noreferrer"
          >
            Cloudflare Pages Docs - Remix guide
          </a>
        </li>
        <li>
          <a target="_blank" href="https://remix.run/docs" rel="noreferrer">
            Remix Docs
          </a>
        </li>
      </ul>
      {data.role ? (<Form action="/logout" method="post">
        <Button type="submit">Logout</Button>
      </Form>)
        : (
          <Form action="/login" method="get">
            <Button type="submit">Login</Button>
          </Form>
        )
      }

    </div>
  );
}
