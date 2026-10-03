"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { giveNav, isMenu, visitNav, type NavEntry, type NavItem, type NavMenu } from "@/lib/site";

export type OfficeDetails = {
  nextService: { label: string; name: string } | null;
  phone: string | null;
  phoneHref: string | null;
  address: string;
};

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function menuActive(pathname: string, menu: NavMenu) {
  return [...menu.items, ...(menu.groups ?? [])].some((item) => isActive(pathname, item.href));
}

function menuId(label: string) {
  return `menu-${label.toLowerCase().replace(/[^a-z]+/g, "-")}`;
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`size-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

/* Moves focus between the links of an open dropdown with the arrow, Home and End keys. */
function moveFocus(event: KeyboardEvent<HTMLElement>) {
  const links = Array.from(event.currentTarget.querySelectorAll<HTMLAnchorElement>("a"));
  const index = links.indexOf(document.activeElement as HTMLAnchorElement);
  const target = { ArrowDown: index + 1, ArrowUp: index - 1, Home: 0, End: links.length - 1 }[event.key];
  if (target === undefined || !links.length) return;
  event.preventDefault();
  links[(target + links.length) % links.length].focus();
}

export function SiteNav({ nav, office }: { nav: NavEntry[]; office: OfficeDetails }) {
  const pathname = usePathname();
  // Menus belong to the page they were opened on, so navigating closes them.
  const [dropdown, setDropdown] = useState<{ label: string; on: string } | null>(null);
  const [mobileOn, setMobileOn] = useState<string | null>(null);
  const openLabel = dropdown?.on === pathname ? dropdown.label : null;
  const mobileOpen = mobileOn === pathname;

  const desktopRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // A soft shadow under the header once the page has scrolled.
  useEffect(() => {
    const header = desktopRef.current?.closest("header");
    if (!header) return;
    const update = () => header.toggleAttribute("data-scrolled", window.scrollY > 48);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  // Clicking anywhere outside the desktop menu closes an open dropdown.
  useEffect(() => {
    if (!openLabel) return;
    const close = (event: PointerEvent) => {
      if (!desktopRef.current?.contains(event.target as Node)) setDropdown(null);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [openLabel]);

  // The phone menu covers the page: hold the page still and start focus inside it.
  useEffect(() => {
    if (!mobileOpen) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    return () => {
      root.style.overflow = previous;
    };
  }, [mobileOpen]);

  function toggleDropdown(label: string) {
    setDropdown(openLabel === label ? null : { label, on: pathname });
  }

  function closeDropdown(label: string) {
    setDropdown(null);
    document.getElementById(`${menuId(label)}-button`)?.focus();
  }

  function closeMobile() {
    setMobileOn(null);
    menuButtonRef.current?.focus();
  }

  function trapFocus(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") return closeMobile();
    if (event.key !== "Tab" || !dialogRef.current) return;
    const focusable = dialogRef.current.querySelectorAll<HTMLElement>("a[href], button");
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  const topLink = "tap flex items-center gap-1 rounded-md whitespace-nowrap px-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface hover:text-brand aria-[current=page]:text-brand xl:px-3";

  return (
    <>
      <nav
        ref={desktopRef}
        aria-label="Main"
        className="hidden lg:block"
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDropdown(null);
        }}
      >
        <ul className="flex items-center gap-0.5">
          {nav.map((entry, position) => {
            if (!isMenu(entry)) {
              return (
                <li key={entry.href}>
                  <Link href={entry.href} aria-current={isActive(pathname, entry.href) ? "page" : undefined} className={topLink}>
                    {entry.label}
                  </Link>
                </li>
              );
            }
            const id = menuId(entry.label);
            const open = openLabel === entry.label;
            const active = menuActive(pathname, entry);
            const wide = Boolean(entry.groups?.length);
            return (
              <li key={entry.label} className="relative">
                <button
                  type="button"
                  id={`${id}-button`}
                  aria-expanded={open}
                  aria-controls={id}
                  onClick={() => toggleDropdown(entry.label)}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowDown") {
                      event.preventDefault();
                      setDropdown({ label: entry.label, on: pathname });
                      requestAnimationFrame(() => document.querySelector<HTMLAnchorElement>(`#${id} a`)?.focus());
                    } else if (event.key === "Escape" && open) {
                      setDropdown(null);
                    }
                  }}
                  data-active={active || undefined}
                  className={`${topLink} data-active:text-brand aria-expanded:bg-surface aria-expanded:text-brand`}
                >
                  {entry.label}
                  <Chevron open={open} />
                </button>
                <div
                  id={id}
                  hidden={!open}
                  onClick={(event) => {
                    if ((event.target as Element).closest("a")) setDropdown(null);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") closeDropdown(entry.label);
                    else moveFocus(event);
                  }}
                  className={`nav-panel absolute top-full z-50 mt-2 rounded-lg border border-navy/10 bg-white p-2 shadow-xl ${position < 3 ? "left-0" : "right-0"} ${wide ? "w-[min(40rem,calc(100vw-4rem))]" : "w-80"}`}
                >
                  <div className={wide ? "grid grid-cols-[1fr_1.15fr] gap-2" : ""}>
                    <ul>
                      {entry.items.map((item) => (
                        <li key={item.href}>
                          <PanelLink item={item} pathname={pathname} />
                        </li>
                      ))}
                    </ul>
                    {wide && (
                      <div className="rounded-md bg-surface p-3">
                        <p className="px-2 pb-1 text-sm font-semibold text-muted">Groups</p>
                        <ul className="grid grid-cols-2 gap-x-1">
                          {entry.groups!.map((group) => (
                            <li key={group.href}>
                              <Link
                                href={group.href}
                                aria-current={isActive(pathname, group.href) ? "page" : undefined}
                                className="tap flex items-center rounded-md px-2 text-sm font-medium text-ink hover:bg-white hover:text-brand aria-[current=page]:text-brand"
                              >
                                {group.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
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
        ref={menuButtonRef}
        type="button"
        aria-expanded={mobileOpen}
        aria-controls="mobile-menu"
        onClick={() => setMobileOn(pathname)}
        className="tap flex shrink-0 items-center gap-1.5 rounded-md px-2 font-medium text-navy hover:bg-surface lg:hidden"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
        <span>Menu</span>
      </button>

      <div
        ref={dialogRef}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        hidden={!mobileOpen}
        onKeyDown={trapFocus}
        onClick={(event) => {
          if ((event.target as Element).closest("a")) setMobileOn(null);
        }}
        className="mobile-menu fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-white lg:hidden"
      >
        <div className="sticky top-0 z-10 border-b border-navy/10 bg-white">
          <div className="mx-auto flex min-h-18 max-w-6xl items-center justify-between px-5 sm:px-8">
            <p className="font-serif text-xl font-semibold text-navy">Menu</p>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeMobile}
              className="tap flex items-center gap-1.5 rounded-md px-2 font-medium text-navy hover:bg-surface"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
              <span>Close</span>
            </button>
          </div>
        </div>

        <nav aria-label="Main" className="mx-auto max-w-6xl px-5 pt-5 pb-10 sm:px-8">
          <div className="grid grid-cols-2 gap-3">
            <Link href={visitNav.href} className="tap flex items-center justify-center rounded-md border border-brand/30 py-3 text-lg font-semibold text-brand hover:bg-surface">
              {visitNav.label}
            </Link>
            <Link href={giveNav.href} className="tap flex items-center justify-center rounded-md bg-brand py-3 text-lg font-semibold text-white hover:bg-navy">
              {giveNav.label}
            </Link>
          </div>

          <ul className="mt-4">
            <li>
              <MobileLink item={{ href: "/", label: "Home" }} current={pathname === "/"} />
            </li>
            {nav.map((entry) =>
              isMenu(entry) ? (
                <li key={entry.label} className="mt-6">
                  <p className="pb-1 text-sm font-semibold tracking-wide text-muted uppercase">{entry.label}</p>
                  <ul>
                    {entry.items.map((item) => (
                      <li key={item.href}>
                        <MobileLink item={item} current={isActive(pathname, item.href)} />
                      </li>
                    ))}
                  </ul>
                  {entry.groups && entry.groups.length > 0 && (
                    <ul className="mt-3 grid grid-cols-2 gap-2">
                      {entry.groups.map((group) => (
                        <li key={group.href}>
                          <Link
                            href={group.href}
                            aria-current={isActive(pathname, group.href) ? "page" : undefined}
                            className="tap flex h-full items-center rounded-md bg-surface px-3 py-2 font-medium text-ink hover:text-brand aria-[current=page]:text-brand"
                          >
                            {group.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ) : (
                <li key={entry.href}>
                  <MobileLink item={entry} current={isActive(pathname, entry.href)} />
                </li>
              ),
            )}
          </ul>

          <div className="mt-8 rounded-lg bg-navy p-5 text-white">
            {office.nextService ? (
              <>
                <p className="text-sm text-white/75">Next service</p>
                <p className="mt-1 font-serif text-xl font-semibold">{office.nextService.label}</p>
                <p className="text-white/80">{office.nextService.name}</p>
              </>
            ) : (
              <p className="font-serif text-xl font-semibold">Join us for worship</p>
            )}
            <p className="mt-3 text-white/80">{office.address}</p>
            {office.phoneHref && (
              <a href={office.phoneHref} className="tap mt-4 flex items-center justify-center gap-2 rounded-md bg-white py-3 font-semibold text-navy hover:bg-surface">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
                </svg>
                Call the church office
              </a>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}

function PanelLink({ item, pathname }: { item: NavItem; pathname: string }) {
  return (
    <Link
      href={item.href}
      aria-current={isActive(pathname, item.href) ? "page" : undefined}
      className="group tap block rounded-md px-3 py-2.5 hover:bg-surface"
    >
      <span className="block font-semibold text-ink group-hover:text-brand group-aria-[current=page]:text-brand">{item.label}</span>
      {item.description && <span className="block text-sm text-muted">{item.description}</span>}
    </Link>
  );
}

function MobileLink({ item, current }: { item: NavItem; current: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={current ? "page" : undefined}
      className="tap flex items-center border-b border-navy/5 py-3 text-lg text-ink aria-[current=page]:font-semibold aria-[current=page]:text-brand"
    >
      {item.label}
    </Link>
  );
}
