"use client";

import { useState, useTransition } from "react";
import { deleteAnnouncement, togglePin } from "@/lib/actions/announcements";
import { Avatar, Badge, Button, Card, EmptyState } from "@/components/ui";
import { icons } from "@/components/icons";

type Announcement = {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  createdAt: Date;
  author: { id: string; name: string } | null;
};

export default function AnnouncementList({
  announcements,
  currentUser,
}: {
  announcements: Announcement[];
  currentUser: { id: string; role: "USER" | "ADMIN" };
}) {
  const [items, setItems] = useState(announcements);
  const [pending, startTransition] = useTransition();

  function handlePin(id: string, pinned: boolean) {
    setItems((prev) =>
      [...prev.map((a) => (a.id === id ? { ...a, pinned } : a))].sort(
        (a, b) => Number(b.pinned) - Number(a.pinned)
      )
    );
    startTransition(() => togglePin(id, pinned));
  }

  function handleDelete(id: string) {
    setItems((prev) => prev.filter((a) => a.id !== id));
    startTransition(() => deleteAnnouncement(id));
  }

  if (items.length === 0) {
    return <EmptyState title="No announcements yet" description="Post one above to keep everyone in the loop." />;
  }

  return (
    <div className="space-y-3">
      {items.map((a) => {
        const canManage = currentUser.role === "ADMIN" || currentUser.id === a.author?.id;
        return (
          <Card key={a.id} className={`p-4 ${a.pinned ? "border-primary/40" : ""}`}>
            <div className="flex items-start gap-3">
              <Avatar name={a.author?.name ?? "?"} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium">{a.title}</h3>
                  {a.pinned && (
                    <Badge tone="primary">
                      <icons.pin className="mr-1 h-3 w-3" /> Pinned
                    </Badge>
                  )}
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm">{a.body}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {a.author?.name ?? "Former member"} ·{" "}
                  {a.createdAt.toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {currentUser.role === "ADMIN" && (
                  <Button
                    variant="ghost"
                    disabled={pending}
                    onClick={() => handlePin(a.id, !a.pinned)}
                    title={a.pinned ? "Unpin" : "Pin"}
                  >
                    <icons.pin className="h-4 w-4" />
                  </Button>
                )}
                {canManage && (
                  <Button
                    variant="ghost"
                    disabled={pending}
                    onClick={() => handleDelete(a.id)}
                    title="Delete"
                  >
                    <icons.trash className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
