import { Link, useRouterState } from "@tanstack/react-router";
import { House, MessageCircle, Tag } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

const tabs = [
  { to: "/", label: "Главная", icon: House, exact: true },
  { to: "/plans", label: "Тариф", icon: Tag, exact: false },
  { to: "/support", label: "Канал", icon: MessageCircle, exact: false },
] as const;

export function XsHeader({ who }: { who?: string }) {
  const { user, isPending } = useCurrentUserState();
  const name = who ?? (user?.displayName || user?.primaryEmail?.split("@")[0] || "гость");
  return (
    <header className="safe-top flex items-center justify-between gap-3 px-4 pt-4">
      <Link to="/" className="flex items-center gap-3">
        <span className="xf-logo" aria-hidden>
          X
        </span>
        <div>
          <p className="text-sm font-extrabold tracking-[0.18em]">XSERVIS</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">XFreedom</p>
        </div>
      </Link>
      <div className="flex items-center gap-2">
        {isPending ? <div className="h-8 w-16 animate-pulse rounded-full bg-bg-subtle" /> : null}
        {!isPending && user ? (
          <SignedIn>
            <Link to="/app" className="text-xs text-muted">
              {name}
            </Link>
            <UserButton />
          </SignedIn>
        ) : null}
        {!isPending && !user ? (
          <SignedOut>
            <Link to="/login" className="text-xs text-muted">
              гость
            </Link>
          </SignedOut>
        ) : null}
      </div>
    </header>
  );
}

export function XsTabs() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <div className="mx-auto w-full max-w-[640px] border-t border-line bg-bg/95 px-1 pb-1 pt-2 backdrop-blur-xl">
        <div className="grid grid-cols-3">
          {tabs.map((t) => {
            const on = t.exact ? pathname === "/" : pathname.startsWith(t.to);
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`relative flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] ${on ? "text-fg" : "text-subtle"}`}
              >
                <Icon className="size-4" strokeWidth={on ? 2.3 : 1.8} color={on ? "var(--primary)" : "currentColor"} />
                {t.label}
                {on ? <span className="absolute top-1 h-0.5 w-8 rounded-full bg-accent" /> : null}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export function XsGlobe({ spinning }: { spinning?: boolean }) {
  return (
    <div className="relative mx-auto grid h-[320px] place-items-center sm:h-[380px]" aria-hidden>
      <div className="xs-orb-ring absolute" />
      <div className="xs-orb">
        <div className={`xs-orb-tex ${spinning ? "opacity-100" : ""}`} style={spinning ? { animationDuration: "8s" } : undefined} />
        <div className="xs-orb-shade" />
      </div>
    </div>
  );
}
