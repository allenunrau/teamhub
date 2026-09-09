"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions/auth";
import { Button, FieldError, inputClass, labelClass } from "@/components/ui";

export default function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="identifier" className={labelClass}>
          Email or name
        </label>
        <input
          id="identifier"
          name="identifier"
          type="text"
          required
          autoComplete="username"
          placeholder="you@example.com or your name"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="password" className={labelClass}>
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className={inputClass}
        />
      </div>
      <FieldError>{state?.error}</FieldError>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        New team members need an email invite from an admin to create an account.
      </p>
    </form>
  );
}
