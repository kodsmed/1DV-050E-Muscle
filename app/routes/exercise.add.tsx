import { json } from "@remix-run/react";
import { ActionFunctionArgs, redirect } from "@remix-run/cloudflare";

export async function action({ request, context }: ActionFunctionArgs) {
  console.log ("action")
  const body = await request.formData();

  console.log ("body :>> ", body);
  const name = body.get("name") as string;
  const body_part = body.get("body_part") as string;
  let body_part_secondary = body.get("body_part_secondary") as string | null;

  if (!name || !body_part || !body_part_secondary) {
    return json(
      { message: "Missing required details" },
      {
        status: 400,
        statusText: "Missing required details",
      }
    );
  }

  if (body_part === body_part_secondary) {
    return json(
      { message: "Body part and secondary body part must be different" },
      {
        status: 400,
        statusText: "Body part and secondary body part must be different",
      }
    );
  }

  if (body_part_secondary === "null") {
    body_part_secondary = null;
  }

  const response = await context.supabase
    .from('exercises')
    .insert([
      { name, body_part, body_part_secondary }
    ]);
  console.log ("response :>> ", response);

  return redirect("/sessionplanner", { headers: context.headers });
}
