import { ReactNode } from "react";
import { Header } from "../organisms/header";
import { UserDetails } from "functions/getUserDetails";

export interface Props {
  children: ReactNode;
  role: string;
  userDetails: UserDetails | null;
}

export function MainLayout({children, role, userDetails}: Props) {
  return (
    <div className="min-w-[480px] w-screen h-screen flex flex-col justify-center items-center overflow-hidden">
      <Header role={role} userDetails={userDetails}/>
      {children}
    </div>
  );
}
