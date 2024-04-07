import {
  json,
  type LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { getRole } from "functions/getRole";
import { Form, useLoaderData } from "@remix-run/react";
import { Button } from "~/components/catalyst/button";



export async function loader({ context }: LoaderFunctionArgs) {
  const response = await context.supabase.auth.getUser();
  const user = response?.data.user;

  const uuid = user?.id as string;
  const role = await getRole(uuid, context.supabase);

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
