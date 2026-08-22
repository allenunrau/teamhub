"use client";

import { useRef, useState, useTransition } from "react";
import { inviteUser } from "@/lib/actions/users";
import { Button, FieldError, inputClass, labelClass } from "@/components/ui";

export default function InviteForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    setSent(false);
    startTransition(async () => {
      const result = await inviteUser(undefined, formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      formRef.current?.reset();
      setSent(true);
    });
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <label htmlFor="invite-email" className={labelClass}>
          Email address
        </label>
        <input
          id="invite-email"
          name="email"
          type="email"
          required
          placeholder="teammate@example.com"
          className={inputClass}
        />
      </div>
      <div className="sm:w-40">
        <label htmlFor="invite-role" className={labelClass}>
          Role
        </label>
        <select id="invite-role" name="role" defaultValue="USER" className={inputClass}>
          <option value="USER">Member</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send invite"}
      </Button>
      {error && <FieldError>{error}</FieldError>}
      {sent && !pending && <p className="text-sm text-accent sm:ml-2">Invite sent.</p>}
    </form>
  );
}
