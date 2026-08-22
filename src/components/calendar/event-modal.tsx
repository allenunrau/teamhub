"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { format } from "date-fns";
import {
  createEvent,
  updateEvent,
  deleteEvent,
  addItem,
  deleteItem,
  toggleItemDone,
  assignItem,
  claimItem,
} from "@/lib/actions/events";
import { Button, FieldError, inputClass, labelClass } from "@/components/ui";
import { Modal } from "@/components/modal";
import { icons } from "@/components/icons";
import type { CalendarEventData, EventItemData, Member } from "@/components/calendar/types";

type Props = {
  members: Member[];
  currentUser: Member;
  onClose: () => void;
  onChanged: () => void;
} & (
  | { mode: "create"; date: Date; event?: undefined }
  | { mode: "edit"; event: CalendarEventData; date?: undefined }
);

export default function EventModal({
  mode,
  date,
  event,
  members,
  currentUser,
  onClose,
  onChanged,
}: Props) {
  const boundAction =
    mode === "edit" ? updateEvent.bind(null, event.id) : createEvent;
  const [state, formAction, pending] = useActionState(boundAction, undefined);
  const [items, setItems] = useState<EventItemData[]>(event?.items ?? []);
  const [deleting, startDeleteTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const submitted = useRef(false);

  const base = mode === "edit" ? event.startsAt : date;

  // useActionState's `state` goes back to `undefined` on a successful save
  // (same as its initial value), so track submission separately to tell
  // "not submitted yet" apart from "submitted and succeeded".
  useEffect(() => {
    if (!submitted.current || pending) return;
    submitted.current = false;
    if (!state?.error) {
      onChanged();
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, pending]);

  function onDeleteEvent() {
    if (!event) return;
    startDeleteTransition(async () => {
      await deleteEvent(event.id);
      onChanged();
      onClose();
    });
  }

  return (
    <Modal title={mode === "create" ? "New event" : "Edit event"} onClose={onClose} wide>
      <form
        action={(formData) => {
          submitted.current = true;
          formAction(formData);
        }}
        className="space-y-4"
      >
        <div>
          <label htmlFor="title" className={labelClass}>
            Title
          </label>
          <input
            id="title"
            name="title"
            required
            defaultValue={event?.title}
            placeholder="Sprint planning"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="date" className={labelClass}>
              Date
            </label>
            <input
              id="date"
              name="date"
              type="date"
              required
              defaultValue={format(base, "yyyy-MM-dd")}
              className={inputClass}
            />
          </div>
          <div className="flex items-end pb-2.5">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="allDay"
                value="true"
                defaultChecked={event?.allDay ?? false}
                className="h-4 w-4 rounded border-border"
              />
              All day
            </label>
          </div>
          <div>
            <label htmlFor="startTime" className={labelClass}>
              Start time
            </label>
            <input
              id="startTime"
              name="startTime"
              type="time"
              defaultValue={event && !event.allDay ? format(event.startsAt, "HH:mm") : "09:00"}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="endTime" className={labelClass}>
              End time
            </label>
            <input
              id="endTime"
              name="endTime"
              type="time"
              defaultValue={event && !event.allDay ? format(event.endsAt, "HH:mm") : "10:00"}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="location" className={labelClass}>
            Location
          </label>
          <input
            id="location"
            name="location"
            defaultValue={event?.location}
            placeholder="Office, video call…"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="description" className={labelClass}>
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={event?.description}
            placeholder="Details for the team…"
            className={inputClass}
          />
        </div>

        <FieldError>{state?.error}</FieldError>

        <div className="flex items-center justify-between gap-2 pt-1">
          {mode === "edit" ? (
            confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Delete this event?</span>
                <Button
                  type="button"
                  variant="danger"
                  disabled={deleting}
                  onClick={onDeleteEvent}
                >
                  Confirm
                </Button>
                <Button type="button" variant="ghost" onClick={() => setConfirmDelete(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button type="button" variant="ghost" onClick={() => setConfirmDelete(true)}>
                <icons.trash className="h-4 w-4" />
                Delete
              </Button>
            )
          ) : (
            <span />
          )}
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : mode === "create" ? "Create event" : "Save changes"}
          </Button>
        </div>
      </form>

      {mode === "edit" && event && (
        <div className="mt-6 border-t border-border pt-4">
          <h3 className="mb-2 text-sm font-semibold">Items</h3>
          <ItemsList
            eventId={event.id}
            items={items}
            setItems={setItems}
            members={members}
            currentUser={currentUser}
          />
        </div>
      )}
    </Modal>
  );
}

function ItemsList({
  eventId,
  items,
  setItems,
  members,
  currentUser,
}: {
  eventId: string;
  items: EventItemData[];
  setItems: React.Dispatch<React.SetStateAction<EventItemData[]>>;
  members: Member[];
  currentUser: Member;
}) {
  const [newTitle, setNewTitle] = useState("");
  const [pending, startTransition] = useTransition();

  function handleAdd() {
    const title = newTitle.trim();
    if (!title) return;
    setNewTitle("");
    startTransition(async () => {
      const item = await addItem(eventId, title);
      setItems((prev) => [
        ...prev,
        { id: item.id, title: item.title, description: "", done: false, assignedTo: null },
      ]);
    });
  }

  function handleToggle(item: EventItemData) {
    const nextDone = !item.done;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, done: nextDone } : i)));
    startTransition(() => toggleItemDone(item.id, nextDone));
  }

  function handleAssign(item: EventItemData, userId: string) {
    const member = members.find((m) => m.id === userId) ?? null;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, assignedTo: member } : i)));
    startTransition(() => assignItem(item.id, userId || null));
  }

  function handleClaim(item: EventItemData) {
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, assignedTo: currentUser } : i))
    );
    startTransition(() => claimItem(item.id));
  }

  function handleDelete(item: EventItemData) {
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    startTransition(() => deleteItem(item.id));
  }

  return (
    <div className="space-y-2">
      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">No items yet. Break this event into tasks below.</p>
      )}
      {items.map((item) => (
        <div
          key={item.id}
          className="flex flex-wrap items-center gap-2 rounded-[var(--radius-control)] border border-border px-3 py-2"
        >
          <button
            type="button"
            onClick={() => handleToggle(item)}
            aria-label={item.done ? "Mark not done" : "Mark done"}
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
              item.done ? "border-accent bg-accent text-white" : "border-border"
            }`}
          >
            {item.done && <icons.check className="h-3.5 w-3.5" />}
          </button>
          <span className={`min-w-0 flex-1 text-sm ${item.done ? "text-muted-foreground line-through" : ""}`}>
            {item.title}
          </span>
          <select
            value={item.assignedTo?.id ?? ""}
            onChange={(e) => handleAssign(item, e.target.value)}
            className="rounded-lg border border-border bg-surface px-2 py-1 text-xs"
          >
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.id === currentUser.id ? "You" : m.name}
              </option>
            ))}
          </select>
          {!item.assignedTo && (
            <button
              type="button"
              onClick={() => handleClaim(item)}
              className="text-xs font-medium text-primary hover:underline"
            >
              Assign to me
            </button>
          )}
          <button
            type="button"
            aria-label="Delete item"
            onClick={() => handleDelete(item)}
            className="rounded-lg p-1 text-muted-foreground hover:bg-surface-muted hover:text-danger"
          >
            <icons.trash className="h-4 w-4" />
          </button>
        </div>
      ))}

      <div className="flex gap-2 pt-1">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder="Add an item…"
          className={inputClass}
        />
        <Button type="button" variant="secondary" disabled={pending} onClick={handleAdd}>
          Add
        </Button>
      </div>
    </div>
  );
}
