import { ReactNode } from "react";
import { Header } from "../organisms/header";

interface Props {
  children: ReactNode;
}

export function MainLayout({ children }: Props) {
  return (
    <div>
      <Header />
      {children}
    </div>
  );
}
