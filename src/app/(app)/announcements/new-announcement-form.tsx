"use client";

import { useActionState, useEffect, useRef } from "react";
import { createAnnouncement } from "@/lib/actions/announcements";
import { Button, FieldError, inputClass, labelClass } from "@/components/ui";

export default function NewAnnouncementForm() {
  const [state, action, pending] = useActionState(createAnnouncement, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state !== undefined && !state.error && !pending) {
      formRef.current?.reset();
    }
  }, [state, pending]);

  return (
    <form ref={formRef} action={action} className="space-y-3">
      <div>
        <label htmlFor="announcement-title" className={labelClass}>
          Title
        </label>
        <input
          id="announcement-title"
          name="title"
          required
          placeholder="Office closed Friday"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="announcement-body" className={labelClass}>
          Message
        </label>
        <textarea
          id="announcement-body"
          name="body"
          required
          rows={3}
          placeholder="Details for the team…"
          className={inputClass}
        />
      </div>
      <FieldError>{state?.error}</FieldError>
      <Button type="submit" disabled={pending}>
        {pending ? "Posting…" : "Post announcement"}
      </Button>
    </form>
  );
}
