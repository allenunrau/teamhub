"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions/auth";
import { icons } from "@/components/icons";
import { Avatar } from "@/components/ui";

type NavItem = {
  href: string;
  label: string;
  icon: keyof typeof icons;
  adminOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/calendar", label: "Calendar", icon: "calendar" },
  { href: "/board", label: "Discussion", icon: "board" },
  { href: "/announcements", label: "Announcements", icon: "megaphone" },
  { href: "/users", label: "People", icon: "users", adminOnly: true },
];

export default function AppShell({
  user,
  children,
}: {
  user: { id: string; name: string; email: string; role: "USER" | "ADMIN" };
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const items = NAV_ITEMS.filter((i) => !i.adminOnly || user.role === "ADMIN");

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:border-r md:border-border md:bg-surface">
        <div className="flex h-16 items-center gap-2 px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            TH
          </div>
          <span className="font-semibold">Team Hub</span>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-2">
          {items.map((item) => (
            <SidebarLink key={item.href} item={item} active={isActive(item.href)} />
          ))}
        </nav>
        <UserFooter user={user} />
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-surface px-4 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
            TH
          </div>
          <span className="font-semibold">Team Hub</span>
        </div>
        <button
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 hover:bg-surface-muted"
        >
          <icons.menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-full w-72 max-w-[85%] flex-col bg-surface shadow-xl">
            <div className="flex h-14 items-center justify-between px-4">
              <span className="font-semibold">Menu</span>
              <button
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 hover:bg-surface-muted"
              >
                <icons.close className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 px-3">
              {items.map((item) => (
                <SidebarLink
                  key={item.href}
                  item={item}
                  active={isActive(item.href)}
                  onClick={() => setMobileOpen(false)}
                />
              ))}
            </nav>
            <UserFooter user={user} />
          </div>
        </div>
      )}

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
        {items.map((item) => {
          const Icon = icons[item.icon];
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-2 text-[11px] ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label === "Announcements" ? "News" : item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex min-h-screen w-full flex-1 flex-col pt-14 pb-16 md:pt-0 md:pb-0">
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarLink({
  item,
  active,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  onClick?: () => void;
}) {
  const Icon = icons[item.icon];
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium transition ${
        active
          ? "bg-primary/10 text-primary"
          : "text-foreground hover:bg-surface-muted"
      }`}
    >
      <Icon className="h-4.5 w-4.5" />
      {item.label}
    </Link>
  );
}

function UserFooter({
  user,
}: {
  user: { name: string; email: string; role: "USER" | "ADMIN" };
}) {
  return (
    <div className="border-t border-border p-3">
      <div className="flex items-center gap-2.5 rounded-[var(--radius-control)] p-2">
        <Avatar name={user.name} size={34} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <form action={logout}>
        <button
          type="submit"
          className="mt-1 flex w-full items-center gap-3 rounded-[var(--radius-control)] px-3 py-2 text-sm text-muted-foreground hover:bg-surface-muted hover:text-foreground"
        >
          <icons.logout className="h-4.5 w-4.5" />
          Sign out
        </button>
      </form>
    </div>
  );
}
