"use client";

import { useState, useTransition } from "react";
import { deleteUser, setUserRole } from "@/lib/actions/users";
import { Avatar, Badge, Button } from "@/components/ui";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: Date;
};

export default function UserList({
  users,
  currentUserId,
}: {
  users: UserRow[];
  currentUserId: string;
}) {
  return (
    <div className="divide-y divide-border">
      {users.map((user) => (
        <UserRowItem key={user.id} user={user} isSelf={user.id === currentUserId} />
      ))}
    </div>
  );
}

function UserRowItem({ user, isSelf }: { user: UserRow; isSelf: boolean }) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleRole() {
    setError(null);
    const nextRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    startTransition(async () => {
      try {
        await setUserRole(user.id, nextRole);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      try {
        await deleteUser(user.id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
        setConfirming(false);
      }
    });
  }

  return (
    <div className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Avatar name={user.name} />
        <div>
          <p className="text-sm font-medium">
            {user.name} {isSelf && <span className="text-muted-foreground">(you)</span>}
          </p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
          {error && <p className="text-xs text-danger">{error}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge tone={user.role === "ADMIN" ? "primary" : "default"}>
          {user.role === "ADMIN" ? "Admin" : "Member"}
        </Badge>
        <Button
          variant="secondary"
          disabled={pending || (isSelf && user.role === "ADMIN")}
          onClick={toggleRole}
          title={isSelf && user.role === "ADMIN" ? "You can't remove your own admin access" : undefined}
        >
          Make {user.role === "ADMIN" ? "member" : "admin"}
        </Button>
        {confirming ? (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Remove {user.name}?</span>
            <Button variant="danger" disabled={pending} onClick={handleDelete}>
              Confirm
            </Button>
            <Button variant="ghost" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            disabled={isSelf}
            title={isSelf ? "You can't remove yourself" : undefined}
            onClick={() => setConfirming(true)}
          >
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}
