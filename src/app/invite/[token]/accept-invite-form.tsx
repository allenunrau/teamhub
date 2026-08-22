"use client";

import { useActionState } from "react";
import { acceptInvite } from "@/lib/actions/auth";
import { Button, FieldError, inputClass, labelClass } from "@/components/ui";

export default function AcceptInviteForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(
    acceptInvite.bind(null, token),
    undefined
  );

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="name" className={labelClass}>
          Full name
        </label>
        <input
          id="name"
          name="name"
          required
          autoComplete="name"
          placeholder="Jamie Rivera"
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
          autoComplete="new-password"
          minLength={8}
          placeholder="At least 8 characters"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className={labelClass}>
          Confirm password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          className={inputClass}
        />
      </div>
      <FieldError>{state?.error}</FieldError>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
