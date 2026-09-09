import { type ButtonHTMLAttributes, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Button({
  tone = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "primary" | "ghost" | "line" | "danger" }) {
  const tones = {
    primary: "xf-primary",
    ghost: "bg-transparent text-fg hover:bg-bg-subtle",
    line: "bg-transparent text-fg hairline hover:bg-bg-subtle",
    danger: "bg-transparent text-bad hairline hover:bg-bg-subtle",
  };
  return (
    <button
      className={cx(
        "inline-flex min-h-11 items-center justify-center rounded-[13px] px-4 text-sm font-extrabold transition-opacity duration-150 disabled:cursor-not-allowed disabled:opacity-40",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

export function Field(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="min-h-11 w-full rounded-[12px] border border-line bg-bg px-3 text-sm text-fg outline-none placeholder:text-subtle focus:border-muted"
      {...props}
    />
  );
}

export function Area(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className="min-h-28 w-full rounded-[12px] border border-line bg-bg px-3 py-2 text-sm text-fg outline-none placeholder:text-subtle focus:border-muted"
      {...props}
    />
  );
}

export function Pill({ children, tone = "muted" }: { children: string; tone?: "muted" | "ok" | "warn" | "bad" }) {
  const color =
    tone === "ok" ? "text-ok" : tone === "warn" ? "text-warn" : tone === "bad" ? "text-bad" : "text-muted";
  return (
    <span className={cx("inline-flex items-center rounded-full border border-line px-2.5 py-1 text-xs", color)}>
      {children}
    </span>
  );
}
