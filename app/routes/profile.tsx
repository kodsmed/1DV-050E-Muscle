import {
  json,
  type LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { ProfileForm } from "~/components/templates/profile";
import { useLoaderData } from "@remix-run/react";
import { getUserDetails, UserDetails } from "functions/getUserDetails";

export async function loader({ context }: LoaderFunctionArgs) {
  const response = await context.supabase.auth.getUser();
  const user = response?.data.user;

  if (!user) {
    return json({
      userDetails: null
    });
  }

  const uuid = user?.id as string;
  const userDetails = await getUserDetails(uuid, context.supabase) as UserDetails | null;
  return json({
    userDetails
  });
}

// handle the incoming form post request
export async function action({ request, context }: LoaderFunctionArgs) {
  const body = new URLSearchParams(await request.text());
  const isDefault = body.get('default') === 'true' ? true : false;
  const avatarUrl = body.get('avatarUrl');
  const firstName = body.get('firstName');
  const lastName = body.get('lastName');
  const displayName = body.get('displayName');
  const currentWeight = body.get('currentWeight');
  const targetWeight = body.get('targetWeight');

  console.log('avatarUrl :>> ', avatarUrl)
  console.log('firstName :>> ', firstName)
  console.log('lastName :>> ', lastName)
  console.log('displayName :>> ', displayName)
  console.log('currentWeight :>> ', currentWeight)
  console.log('targetWeight :>> ', targetWeight)
  console.log('isDefault :>> ', isDefault)

  if (!avatarUrl || !firstName || !lastName || !displayName || !currentWeight || !targetWeight) {
    return json(
      { message: "Missing required details" },
      {
        status: 400,
        statusText: "Missing required details",
      }
    );
  }

  let user = null;
  try {
    const response = await context.supabase.auth.getUser();
    user = response?.data.user;

    if (user && isDefault) {
      // inser a new record
      await context.supabase
        .from('user_details')
        .insert({
          avatar_url: avatarUrl,
          first_name: firstName,
          last_name: lastName,
          display_name: displayName,
          current_weight_kg: currentWeight,
          target_weight_kg: targetWeight,
          id: user.id
        });
    } else if (user && !isDefault) {
      // update the existing record
      await context.supabase
        .from('user_details')
        .upsert({
          avatar_url: avatarUrl,
          first_name: firstName,
          last_name: lastName,
          display_name: displayName,
          current_weight_kg: currentWeight,
          target_weight_kg: targetWeight
        })
        .eq('id', user.id);
    }
  } catch (error) {
    console.error('error :>> ', error);
  }
  const userDetails = await getUserDetails(user?.id || '', context.supabase) as UserDetails;
  return json(
    userDetails
  );
}

export default function Profile() {
  const data = useLoaderData<typeof loader>();
  const userDetails = data.userDetails;
  return (
    <ProfileForm userDetails={userDetails} />
  );
}