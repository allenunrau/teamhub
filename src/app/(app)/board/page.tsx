import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, Avatar, EmptyState } from "@/components/ui";
import { icons } from "@/components/icons";
import NewTopicForm from "./new-topic-form";

export default async function BoardPage() {
  const topics = await prisma.topic.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: { name: true } },
      posts: { select: { id: true, createdAt: true }, orderBy: { createdAt: "desc" } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Discussion</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Threaded conversations, organized by topic.
        </p>
      </div>

      <Card className="p-5">
        <h2 className="mb-3 font-medium">Start a new topic</h2>
        <NewTopicForm />
      </Card>

      {topics.length === 0 ? (
        <EmptyState title="No topics yet" description="Start the first discussion above." />
      ) : (
        <div className="space-y-2.5">
          {topics.map((topic) => {
            const lastPost = topic.posts[0];
            return (
              <Link
                key={topic.id}
                href={`/board/${topic.id}`}
                className="flex items-center gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-4 hover:border-primary/40 hover:bg-surface-muted"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <icons.board className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{topic.title}</p>
                  {topic.description && (
                    <p className="truncate text-sm text-muted-foreground">{topic.description}</p>
                  )}
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Started by {topic.createdBy?.name ?? "a former member"} · {topic.posts.length}{" "}
                    message{topic.posts.length === 1 ? "" : "s"}
                    {lastPost && ` · last activity ${lastPost.createdAt.toLocaleDateString()}`}
                  </p>
                </div>
                <Avatar name={topic.createdBy?.name ?? "?"} />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
