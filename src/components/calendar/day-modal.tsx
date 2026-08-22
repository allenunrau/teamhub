"use client";

import { format } from "date-fns";
import { Button, EmptyState } from "@/components/ui";
import { Modal } from "@/components/modal";
import type { CalendarEventData } from "@/components/calendar/types";

export default function DayModal({
  date,
  events,
  onClose,
  onAddEvent,
  onOpenEvent,
}: {
  date: Date;
  events: CalendarEventData[];
  onClose: () => void;
  onAddEvent: () => void;
  onOpenEvent: (event: CalendarEventData) => void;
}) {
  return (
    <Modal title={format(date, "EEEE, MMMM d")} onClose={onClose}>
      <div className="space-y-2">
        {events.length === 0 ? (
          <EmptyState title="No events yet" description="Nothing scheduled on this day." />
        ) : (
          events.map((event) => (
            <button
              key={event.id}
              onClick={() => onOpenEvent(event)}
              className="flex w-full items-start gap-3 rounded-[var(--radius-control)] border border-border p-3 text-left hover:bg-surface-muted"
            >
              <div className="w-14 shrink-0 text-xs text-muted-foreground">
                {event.allDay ? "All day" : format(event.startsAt, "HH:mm")}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{event.title}</p>
                {event.location && (
                  <p className="truncate text-xs text-muted-foreground">{event.location}</p>
                )}
                {event.items.length > 0 && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {event.items.filter((i) => i.done).length}/{event.items.length} items done
                  </p>
                )}
              </div>
            </button>
          ))
        )}
      </div>
      <Button onClick={onAddEvent} className="mt-4 w-full" variant="secondary">
        Add event on this day
      </Button>
    </Modal>
  );
}
