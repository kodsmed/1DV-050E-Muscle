import { LinkData } from "app/components/templates/navbar-layout";

export function getLinksForRole(role: string): LinkData[] {
  let links: LinkData[] = [];
  if (!role || role === "ANONYMOUS") {
    links = [
      { href: "/login", text: "Login" },
      { href: "/register", text: "Signup" },
    ];
  } else if (role === "USER") {
    links = [
      { href: "/session-perform", text: "Perform training" },
      { href: "/sessionplanner", text: "Plan training" },
      { href: "/sessions", text: "My training plans" },
      { href: "/view-progress", text: "View progress"},
      { href: "/program-planner", text: "Training program"},
      { href: "/logout", text: "Logout" },
    ];
  } else if (role === "TRAINER") {
    links = [
      { href: "/session-perform", text: "Perform training" },
      { href: "/sessionplanner", text: "Plan training" },
      { href: "/sessions", text: "My training plans" },
      { href: "/view-progress", text: "View progress"},
      { href: "/program-planner", text: "Training program"},
      { href: "/clients", text: "My clients"},
      { href: "/logout", text: "Logout" },
    ];
  } else if (role === "ADMIN") {
    links = [
      { href: "/admin", text: "Admin" },
      { href: "/logout", text: "Logout" },
    ];
  }
  return links;
}