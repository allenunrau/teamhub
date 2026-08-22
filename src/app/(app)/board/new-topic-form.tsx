"use client";

import { useActionState } from "react";
import { createTopic } from "@/lib/actions/board";
import { Button, FieldError, inputClass, labelClass } from "@/components/ui";

export default function NewTopicForm() {
  const [state, action, pending] = useActionState(createTopic, undefined);

  return (
    <form action={action} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div>
          <label htmlFor="topic-title" className={labelClass}>
            Topic title
          </label>
          <input
            id="topic-title"
            name="title"
            required
            placeholder="Launch retro"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="topic-description" className={labelClass}>
            Description (optional)
          </label>
          <input
            id="topic-description"
            name="description"
            placeholder="What's this about?"
            className={inputClass}
          />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create topic"}
        </Button>
      </div>
      <FieldError>{state?.error}</FieldError>
    </form>
  );
}
