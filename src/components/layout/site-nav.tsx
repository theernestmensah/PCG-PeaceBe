"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { giveNav, mainNav } from "@/lib/site";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNav() {
  const pathname = usePathname();
  // The menu belongs to the page it was opened on, so navigating closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;

  return (
    <>
      <nav aria-label="Main" className="hidden xl:block">
        <ul className="flex items-center gap-1">
          {mainNav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
                className="tap flex items-center rounded-md px-3 text-sm font-medium text-ink transition-colors hover:bg-surface hover:text-brand aria-[current=page]:text-brand"
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li className="ml-2">
            <Link
              href={giveNav.href}
              aria-current={isActive(pathname, giveNav.href) ? "page" : undefined}
              className="tap flex items-center rounded-md bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-navy"
            >
              {giveNav.label}
            </Link>
          </li>
        </ul>
      </nav>

      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpenOn(open ? null : pathname)}
        className="tap flex shrink-0 items-center gap-1.5 rounded-md px-2 font-medium text-navy hover:bg-surface xl:hidden"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
        <span>{open ? "Close" : "Menu"}</span>
      </button>

      <nav
        id="mobile-menu"
        aria-label="Main"
        hidden={!open}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpenOn(null);
        }}
        className="absolute inset-x-0 top-full max-h-[calc(100dvh-5rem)] overflow-y-auto border-b border-navy/10 bg-white shadow-lg xl:hidden"
      >
        <ul className="mx-auto flex max-w-6xl flex-col px-5 py-3 sm:px-8">
          <li>
            <Link
              href="/"
              aria-current={pathname === "/" ? "page" : undefined}
              className="tap flex items-center border-b border-navy/5 py-3 text-lg text-ink aria-[current=page]:font-semibold aria-[current=page]:text-brand"
            >
              Home
            </Link>
          </li>
          {mainNav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
                className="tap flex items-center border-b border-navy/5 py-3 text-lg text-ink aria-[current=page]:font-semibold aria-[current=page]:text-brand"
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li className="pt-4 pb-2">
            <Link
              href={giveNav.href}
              className="tap flex items-center justify-center rounded-md bg-brand py-3 text-lg font-semibold text-white hover:bg-navy"
            >
              {giveNav.label}
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}
