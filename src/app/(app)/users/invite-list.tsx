"use client";

import { useTransition } from "react";
import { revokeInvite, resendInvite } from "@/lib/actions/users";
import { Badge, Button } from "@/components/ui";

type InviteRow = {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
  expiresAt: Date;
  invitedBy: { name: string };
};

export default function InviteList({ invites }: { invites: InviteRow[] }) {
  return (
    <div className="divide-y divide-border">
      {invites.map((invite) => (
        <InviteRowItem key={invite.id} invite={invite} />
      ))}
    </div>
  );
}

function InviteRowItem({ invite }: { invite: InviteRow }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium">{invite.email}</p>
        <p className="text-xs text-muted-foreground">
          Invited by {invite.invitedBy.name} · expires{" "}
          {invite.expiresAt.toLocaleDateString()}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge tone={invite.role === "ADMIN" ? "primary" : "default"}>
          {invite.role === "ADMIN" ? "Admin" : "Member"}
        </Badge>
        <Button
          variant="secondary"
          disabled={pending}
          onClick={() => startTransition(() => resendInvite(invite.id))}
        >
          Resend
        </Button>
        <Button
          variant="ghost"
          disabled={pending}
          onClick={() => startTransition(() => revokeInvite(invite.id))}
        >
          Revoke
        </Button>
      </div>
    </div>
  );
}
