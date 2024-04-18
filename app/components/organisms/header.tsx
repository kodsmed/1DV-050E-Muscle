import { NavbarLayout } from "../templates/navbar-layout";
import { UserDetails } from "functions/getUserDetails";
import { getLinksForRole } from "app/config/links";

export function Header({ role, userDetails }: { role: string, userDetails: UserDetails | null}) {
  const links = getLinksForRole(role);


  return (
    <div className="bg-slate-200 w-full flex justify-between">
      <NavbarLayout links={links} userDetails={userDetails}/>
    </div>
  );
}
