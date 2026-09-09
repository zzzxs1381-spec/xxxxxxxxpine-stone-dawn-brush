import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { Button, Field } from "@/components/ui";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"in" | "up">("in");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "up") {
        const { error: err } = await authClient.signUp.email({ email, password, name: email.split("@")[0] ?? "user" });
        if (err) setError(err.message ?? "Не удалось создать аккаунт");
        else window.location.assign("/app");
      } else {
        const { error: err } = await authClient.signIn.email({ email, password });
        if (err) setError(err.message ?? "Неверный вход");
        else window.location.assign("/app");
      }
    } catch {
      setError("Ошибка входа");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg text-fg">
      <SiteNav />
      <main className="mx-auto grid max-w-md gap-6 px-4 py-16">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Аккаунт</p>
          <h1 className="font-display mt-2 text-4xl">Войти в XFreedom</h1>
          <p className="mt-2 text-sm text-muted">Кабинет — блокнот: проверки, устройства, совет. Коридор здесь не строится.</p>
        </div>
        {authEnabled ? (
          <>
            <div className="grid gap-2">
              {GROK_PROVIDERS.map((p) => (
                <Button key={p.providerId} tone="line" type="button" onClick={() => signIn(p.providerId, { callbackURL: "/app" })}>
                  Продолжить через {p.label}
                </Button>
              ))}
            </div>
            <p className="text-center text-xs text-subtle">или почта</p>
            <form className="grid gap-3" onSubmit={submit}>
              <Field id="xf-email" type="email" required placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              <Field id="xf-password" type="password" required minLength={8} placeholder="пароль, от 8 символов" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "up" ? "new-password" : "current-password"} />
              {error ? <p className="text-sm text-bad">{error}</p> : null}
              <Button disabled={busy} type="submit">
                {mode === "up" ? "Создать аккаунт" : "Войти"}
              </Button>
              <button type="button" className="text-sm text-muted" onClick={() => setMode(mode === "up" ? "in" : "up")}>
                {mode === "up" ? "Уже есть аккаунт" : "Нужна регистрация"}
              </button>
            </form>
          </>
        ) : (
          <p className="text-sm text-muted">Вход отключён.</p>
        )}
        <Link to="/" className="text-sm text-muted">
          На главную
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
