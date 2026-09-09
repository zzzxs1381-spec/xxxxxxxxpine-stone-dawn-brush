import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Activity, House, Sparkles, User } from "lucide-react";
import { RedirectToSignIn, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/app")({ component: AppShell });

const top = [
  { to: "/app/probe", label: "Проба" },
  { to: "/app/live", label: "Эфир" },
  { to: "/monitor", label: "Монитор" },
  { to: "/app/devices", label: "Устройства" },
  { to: "/app/subscription", label: "Подписка" },
] as const;

const tabs = [
  { to: "/app", label: "Главная", icon: House, exact: true },
  { to: "/app/stat", label: "Стат", icon: Activity },
  { to: "/app/aima", label: "Айма", icon: Sparkles },
  { to: "/app/account", label: "Я", icon: User },
] as const;

function AppShell() {
  const { user, isPending } = useCurrentUserState();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (isPending) {
    return (
      <div className="min-h-screen bg-bg p-6">
        <div className="mx-auto h-16 max-w-6xl animate-pulse rounded-lg bg-bg-elevated" />
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;

  const who = user.displayName || user.primaryEmail?.split("@")[0] || "я";

  return (
    <div className="min-h-screen bg-bg pb-24 text-fg">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-3">
            <span className="xf-logo" aria-hidden>
              X
            </span>
            <span>
              <span className="block text-xs font-extrabold tracking-[0.18em]">XSERVIS</span>
              <span className="block text-[10px] text-muted">{who}</span>
            </span>
          </Link>
          <UserButton />
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-2 pb-2">
          {top.map((item) => {
            const on = pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`shrink-0 rounded-md px-3 py-2 text-sm ${on ? "bg-bg-subtle text-accent" : "text-muted hover:bg-bg-subtle hover:text-fg"}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm">
        <div className="mx-auto grid max-w-6xl grid-cols-4">
          {tabs.map((t) => {
            const on = t.to === "/app" ? pathname === "/app" || pathname === "/app/" : pathname.startsWith(t.to);
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`relative flex min-h-14 flex-col items-center justify-center gap-0.5 text-[10px] ${on ? "text-fg" : "text-subtle"}`}
              >
                <Icon className="size-4" color={on ? "var(--primary)" : "currentColor"} aria-hidden />
                {t.label}
                {on ? <span className="absolute top-1 h-0.5 w-8 rounded-full bg-accent" /> : null}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
