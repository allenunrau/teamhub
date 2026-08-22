import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui";
import InviteForm from "./invite-form";
import UserList from "./user-list";
import InviteList from "./invite-list";

export default async function UsersPage() {
  const currentUser = await requireAdmin();

  const [users, invites] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
    prisma.invite.findMany({
      where: { acceptedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
      include: { invitedBy: { select: { name: true } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">People</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage who has access and their permissions.
        </p>
      </div>

      <Card className="p-5">
        <h2 className="mb-3 font-medium">Invite someone</h2>
        <InviteForm />
      </Card>

      {invites.length > 0 && (
        <Card className="p-5">
          <h2 className="mb-3 font-medium">Pending invites</h2>
          <InviteList invites={invites} />
        </Card>
      )}

      <Card className="p-5">
        <h2 className="mb-3 font-medium">Team members ({users.length})</h2>
        <UserList users={users} currentUserId={currentUser.id} />
      </Card>
    </div>
  );
}
