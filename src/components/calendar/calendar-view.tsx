"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  format,
  addMonths,
  startOfDay,
  endOfDay,
} from "date-fns";
import { Button } from "@/components/ui";
import { icons } from "@/components/icons";
import EventModal from "@/components/calendar/event-modal";
import DayModal from "@/components/calendar/day-modal";
import type { CalendarEventData, Member } from "@/components/calendar/types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type ModalState =
  | { kind: "day"; date: Date }
  | { kind: "event"; event: CalendarEventData }
  | { kind: "create"; date: Date }
  | null;

export default function CalendarView({
  monthAnchor,
  events,
  members,
  currentUser,
}: {
  monthAnchor: string;
  events: CalendarEventData[];
  members: Member[];
  currentUser: Member;
}) {
  const router = useRouter();
  const [modal, setModal] = useState<ModalState>(null);
  const anchor = useMemo(() => new Date(monthAnchor), [monthAnchor]);

  const monthStart = startOfMonth(anchor);
  const monthEnd = endOfMonth(anchor);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);
  const days = useMemo(
    () => eachDayOfInterval({ start: gridStart, end: gridEnd }),
    [gridStart, gridEnd]
  );

  function eventsForDay(day: Date) {
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);
    return events.filter((e) => e.startsAt <= dayEnd && e.endsAt >= dayStart);
  }

  function goToMonth(target: Date) {
    router.push(`/calendar?month=${format(target, "yyyy-MM")}`);
  }

  function refresh() {
    router.refresh();
  }

  const activeEvent =
    modal?.kind === "event"
      ? events.find((e) => e.id === modal.event.id) ?? modal.event
      : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Calendar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Shared team schedule — everyone can add and edit events.
          </p>
        </div>
        <Button onClick={() => setModal({ kind: "create", date: new Date() })}>
          <icons.plus className="h-4 w-4" />
          Add event
        </Button>
      </div>

      <div className="flex items-center justify-between rounded-[var(--radius-card)] border border-border bg-surface px-3 py-2.5">
        <div className="flex items-center gap-1">
          <button
            aria-label="Previous month"
            onClick={() => goToMonth(addMonths(monthStart, -1))}
            className="rounded-lg p-1.5 hover:bg-surface-muted"
          >
            <icons.chevronLeft className="h-4.5 w-4.5" />
          </button>
          <button
            aria-label="Next month"
            onClick={() => goToMonth(addMonths(monthStart, 1))}
            className="rounded-lg p-1.5 hover:bg-surface-muted"
          >
            <icons.chevronRight className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={() => goToMonth(new Date())}
            className="ml-1 rounded-lg px-2.5 py-1 text-sm hover:bg-surface-muted"
          >
            Today
          </button>
        </div>
        <p className="font-medium">{format(monthStart, "MMMM yyyy")}</p>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface">
        <div className="grid grid-cols-7 border-b border-border text-center text-xs font-medium text-muted-foreground">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-2">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const dayEvents = eventsForDay(day);
            const inMonth = isSameMonth(day, monthStart);
            const visible = dayEvents.slice(0, 3);
            const overflow = dayEvents.length - visible.length;
            return (
              <button
                key={day.toISOString()}
                onClick={() => setModal({ kind: "day", date: day })}
                className={`flex min-h-[86px] flex-col items-stretch gap-1 border-b border-r border-border p-1.5 text-left last:border-r-0 sm:min-h-[112px] sm:p-2 ${
                  inMonth ? "" : "bg-surface-muted/50"
                }`}
              >
                <span
                  className={`self-start text-xs font-medium sm:text-sm ${
                    !inMonth
                      ? "text-muted-foreground/60"
                      : isToday(day)
                      ? "flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
                      : ""
                  }`}
                >
                  {format(day, "d")}
                </span>
                <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                  {visible.map((event) => (
                    <span
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setModal({ kind: "event", event });
                      }}
                      className="truncate rounded bg-primary/10 px-1 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/20 sm:text-xs"
                    >
                      {event.allDay ? "" : format(event.startsAt, "HH:mm ")}
                      {event.title}
                    </span>
                  ))}
                  {overflow > 0 && (
                    <span className="px-1 text-[10px] text-muted-foreground sm:text-xs">
                      +{overflow} more
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {modal?.kind === "day" && (
        <DayModal
          date={modal.date}
          events={eventsForDay(modal.date)}
          onClose={() => setModal(null)}
          onAddEvent={() => setModal({ kind: "create", date: modal.date })}
          onOpenEvent={(event) => setModal({ kind: "event", event })}
        />
      )}

      {modal?.kind === "create" && (
        <EventModal
          mode="create"
          date={modal.date}
          members={members}
          currentUser={currentUser}
          onClose={() => setModal(null)}
          onChanged={refresh}
        />
      )}

      {modal?.kind === "event" && activeEvent && (
        <EventModal
          mode="edit"
          event={activeEvent}
          members={members}
          currentUser={currentUser}
          onClose={() => setModal(null)}
          onChanged={refresh}
        />
      )}
    </div>
  );
}
