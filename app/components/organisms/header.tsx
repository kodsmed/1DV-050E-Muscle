import { NavbarLayout, LinkData } from "../templates/navbar-layout";
import { UserDetails } from "functions/getUserDetails";

export function Header({ role, userDetails }: { role: string, userDetails: UserDetails | null}) {
  let links: LinkData[] = [];
  if (!role || role === "ANONYMOUS") {
    links = [
      { href: "/login", text: "Login" },
      { href: "/register", text: "Signup" }
    ];
  } else if (role === "USER") {
    links = [
      { href: "/dashboard", text: "Dashboard" },
      { href: "/logout", text: "Logout" }
    ];
  } else if (role === "ADMIN") {
    links = [
      { href: "/admin", text: "Admin" },
      { href: "/logout", text: "Logout" }
    ];
  }

  return (
    <div className="h-24 bg-slate-200 w-full flex justify-between">
      <NavbarLayout links={links} userDetails={userDetails}/>
    </div>
  );
}
