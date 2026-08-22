import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import { Card } from "@/components/ui";
import NewAnnouncementForm from "./new-announcement-form";
import AnnouncementList from "./announcement-list";

export default async function AnnouncementsPage() {
  const currentUser = await getCurrentUser();
  const announcements = await prisma.announcement.findMany({
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    include: { author: { select: { id: true, name: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Announcements</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Important updates for the whole team.
        </p>
      </div>

      <Card className="p-5">
        <h2 className="mb-3 font-medium">Post an announcement</h2>
        <NewAnnouncementForm />
      </Card>

      <AnnouncementList announcements={announcements} currentUser={currentUser} />
    </div>
  );
}
