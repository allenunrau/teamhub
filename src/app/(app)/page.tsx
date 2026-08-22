import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import { Avatar, Card, EmptyState } from "@/components/ui";
import { icons } from "@/components/icons";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const now = new Date();

  const [pinnedAnnouncements, upcomingEvents, recentPosts, memberCount] =
    await Promise.all([
      prisma.announcement.findMany({
        where: { pinned: true },
        orderBy: { createdAt: "desc" },
        take: 3,
        include: { author: { select: { name: true } } },
      }),
      prisma.calendarEvent.findMany({
        where: { endsAt: { gte: now } },
        orderBy: { startsAt: "asc" },
        take: 5,
        include: { items: true },
      }),
      prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { author: { select: { name: true } }, topic: { select: { id: true, title: true } } },
      }),
      prisma.user.count(),
    ]);

  const myOpenItems = await prisma.eventItem.count({
    where: { assignedToId: user.id, done: false },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome back, {user.name.split(" ")[0]}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening with the team.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Team members" value={memberCount} icon="users" />
        <StatCard label="Upcoming events" value={upcomingEvents.length} icon="calendar" />
        <StatCard label="Your open tasks" value={myOpenItems} icon="check" />
      </div>

      {pinnedAnnouncements.length > 0 && (
        <section className="space-y-2.5">
          <SectionHeader title="Pinned announcements" href="/announcements" />
          {pinnedAnnouncements.map((a) => (
            <Card key={a.id} className="border-primary/40 p-4">
              <div className="flex items-center gap-2">
                <icons.pin className="h-4 w-4 text-primary" />
                <h3 className="font-medium">{a.title}</h3>
              </div>
              <p className="mt-1.5 whitespace-pre-wrap text-sm text-muted-foreground">{a.body}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {a.author?.name ?? "Former member"} · {a.createdAt.toLocaleDateString()}
              </p>
            </Card>
          ))}
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-2.5">
          <SectionHeader title="Upcoming events" href="/calendar" />
          {upcomingEvents.length === 0 ? (
            <EmptyState title="Nothing scheduled" description="Add an event from the calendar." />
          ) : (
            <Card className="divide-y divide-border">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-3 p-3.5">
                  <div className="flex w-14 shrink-0 flex-col items-center rounded-lg bg-surface-muted py-1.5 text-center">
                    <span className="text-[10px] uppercase text-muted-foreground">
                      {event.startsAt.toLocaleDateString(undefined, { month: "short" })}
                    </span>
                    <span className="text-lg font-semibold leading-none">
                      {event.startsAt.getDate()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.allDay
                        ? "All day"
                        : event.startsAt.toLocaleTimeString(undefined, {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                      {event.items.length > 0 &&
                        ` · ${event.items.filter((i) => i.done).length}/${event.items.length} items done`}
                    </p>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </section>

        <section className="space-y-2.5">
          <SectionHeader title="Recent discussion" href="/board" />
          {recentPosts.length === 0 ? (
            <EmptyState title="No messages yet" description="Start a topic on the board." />
          ) : (
            <Card className="divide-y divide-border">
              {recentPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/board/${post.topic.id}`}
                  className="flex items-start gap-3 p-3.5 hover:bg-surface-muted"
                >
                  <Avatar name={post.author?.name ?? "?"} size={28} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">
                      <span className="font-medium">{post.author?.name ?? "Former member"}</span>{" "}
                      <span className="text-muted-foreground">in {post.topic.title}</span>
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{post.body}</p>
                  </div>
                </Link>
              ))}
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-medium">{title}</h2>
      <Link href={href} className="text-sm text-primary hover:underline">
        View all
      </Link>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: keyof typeof icons;
}) {
  const Icon = icons[icon];
  return (
    <Card className="flex items-center gap-3 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xl font-semibold leading-none">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </div>
    </Card>
  );
}
