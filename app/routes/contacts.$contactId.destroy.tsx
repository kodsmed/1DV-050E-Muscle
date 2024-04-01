import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { deleteContact  } from "../data";
import invariant from "tiny-invariant";

export async function action({ params }: ActionFunctionArgs) {
  invariant(params.contactId, "Missing contactId param");
  await deleteContact(params.contactId);
  return redirect("/");
}