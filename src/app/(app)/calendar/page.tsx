import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import CalendarView from "@/components/calendar/calendar-view";

export default async function CalendarPage({
  searchParams,
}: PageProps<"/calendar">) {
  const params = await searchParams;
  const monthParam = typeof params.month === "string" ? params.month : undefined;

  const anchor =
    monthParam && /^\d{4}-\d{2}$/.test(monthParam)
      ? new Date(`${monthParam}-01T00:00:00`)
      : new Date();

  const monthStart = startOfMonth(anchor);
  const monthEnd = endOfMonth(anchor);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);

  const currentUser = await getCurrentUser();

  const [events, members] = await Promise.all([
    prisma.calendarEvent.findMany({
      where: { startsAt: { lte: gridEnd }, endsAt: { gte: gridStart } },
      orderBy: { startsAt: "asc" },
      include: {
        createdBy: { select: { id: true, name: true } },
        items: {
          include: { assignedTo: { select: { id: true, name: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    prisma.user.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <CalendarView
      monthAnchor={monthStart.toISOString()}
      events={events}
      members={members}
      currentUser={currentUser}
    />
  );
}
