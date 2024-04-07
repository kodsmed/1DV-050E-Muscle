import { useState } from 'react';
import { CatalystWhite } from "../atoms/icons";
import { UserDetails } from "functions/getUserDetails";

export interface LinkData {
  href: string;
  text: string;
}

export function NavbarLayout({ links, userDetails }: { links: LinkData[], userDetails: UserDetails  | null}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="w-full h-full">
      <nav className="bg-black">
        <div className="mx-auto w-full px-2 sm:px-6 lg:px-8">
          <div className="relative flex h-16 items-center justify-between">
            {
              /**
               * Logo
               */
            }
            <div className="relative flex items-center justify-left h-16">
              <div className="flex items-center px-2 lg:px-0">
                <div className="flex-shrink-0">
                  <CatalystWhite />
                </div>
              </div>
            </div>
            < div className="hidden sm:ml-6 sm:block grow">
              <div className="flex space-x-4 justify-left">
                {links.map((link) => (
                  <a key={link.text} href={link.href} className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium">{link.text}</a>
                ))}
              </div>
            </div>
            <div>
              <div className={userDetails ? "flex items-center" : "hidden"}>
                <div className="flex-shrink-0">
                  <img className="h-10 w-10 rounded-full" src={userDetails?.avatarUrl} alt={userDetails?.firstName + ' ' + userDetails?.lastName} />
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-white">{userDetails?.displayName}</div>
                </div>
              </div>
            </div>


            <div className="absolute inset-y-0 right-0 flex items-center sm:hidden">
              {/* Mobile menu button */}
              <button type="button" className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" aria-controls="mobile-menu" aria-expanded="false" onClick={() => { setExpanded(!expanded) }}>
                <span className="absolute -inset-0.5"></span>
                <span className="sr-only">Open main menu</span>

                {/* Icon when menu is closed. */}
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>

                {/*
                  Icon when menu is open.
                  Menu open: "block", Menu closed: "hidden"
                */}
                <svg className="hidden h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        {/*<!-- Mobile menu, show/hide based on menu state. --> */}
        <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start" id='mobile-menu'>
          <div className={!expanded ? "hidden" : "sm:ml-6 sm:block"}>
            <div className="flex flex-col space-y-2">
              {/**
                    Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" -->
                  */}
              {links.map((link) => (
                <a key={link.text} href={link.href} className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium">{link.text}</a>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </div>
  )
}
