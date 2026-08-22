import { type ReactNode, type ButtonHTMLAttributes } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[var(--radius-card)] border border-border bg-surface shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

const buttonVariants = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-50",
  secondary:
    "bg-surface-muted text-foreground hover:brightness-95 dark:hover:brightness-110 border border-border",
  danger: "bg-danger text-danger-foreground hover:brightness-95",
  ghost: "hover:bg-surface-muted text-foreground",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof buttonVariants;
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-control)] px-3.5 py-2 text-sm font-medium transition cursor-pointer disabled:cursor-not-allowed ${buttonVariants[variant]} ${className}`}
      {...props}
    />
  );
}

export function Badge({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "primary" | "danger" | "success" | "warning";
}) {
  const tones: Record<string, string> = {
    default: "bg-surface-muted text-muted-foreground",
    primary: "bg-primary/10 text-primary",
    danger: "bg-danger/10 text-danger",
    success: "bg-accent/10 text-accent",
    warning: "bg-warning/10 text-warning",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  const hue = hashHue(name);
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: `hsl(${hue} 65% 45%)`,
      }}
    >
      {initials || "?"}
    </span>
  );
}

function hashHue(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-[var(--radius-card)] border border-dashed border-border py-14 text-center px-6">
      <p className="font-medium">{title}</p>
      {description && (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action}
    </div>
  );
}

export function FieldError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="mt-1 text-sm text-danger">{children}</p>;
}

export const inputClass =
  "w-full rounded-[var(--radius-control)] border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary placeholder:text-muted-foreground";

export const labelClass = "mb-1.5 block text-sm font-medium";
