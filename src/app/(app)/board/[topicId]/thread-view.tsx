"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createPost, deletePost, deleteTopic } from "@/lib/actions/board";
import { Avatar, Button, EmptyState } from "@/components/ui";
import { icons } from "@/components/icons";

type Author = { id: string; name: string } | null;
type PostData = {
  id: string;
  body: string;
  createdAt: Date;
  author: Author;
  replies: { id: string; body: string; createdAt: Date; author: Author }[];
};

type TopicData = {
  id: string;
  title: string;
  description: string;
  createdBy: { id: string; name: string } | null;
  posts: PostData[];
};

type CurrentUser = { id: string; name: string; role: "USER" | "ADMIN" };

export default function ThreadView({
  topic,
  currentUser,
}: {
  topic: TopicData;
  currentUser: CurrentUser;
}) {
  const [posts, setPosts] = useState<PostData[]>(topic.posts);
  const [openThreads, setOpenThreads] = useState<Set<string>>(new Set());
  const [composer, setComposer] = useState("");
  const [pending, startTransition] = useTransition();

  const canDeleteTopic =
    currentUser.role === "ADMIN" || currentUser.id === topic.createdBy?.id;

  function toggleThread(postId: string) {
    setOpenThreads((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  }

  function postMessage() {
    const body = composer.trim();
    if (!body) return;
    setComposer("");
    startTransition(async () => {
      const post = await createPost(topic.id, null, body);
      setPosts((prev) => [
        ...prev,
        { id: post.id, body: post.body, createdAt: post.createdAt, author: post.author, replies: [] },
      ]);
    });
  }

  function postReply(postId: string, body: string) {
    startTransition(async () => {
      const reply = await createPost(topic.id, postId, body);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                replies: [
                  ...p.replies,
                  { id: reply.id, body: reply.body, createdAt: reply.createdAt, author: reply.author },
                ],
              }
            : p
        )
      );
      setOpenThreads((prev) => new Set(prev).add(postId));
    });
  }

  function removePost(postId: string) {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    startTransition(() => deletePost(postId, topic.id));
  }

  function removeReply(postId: string, replyId: string) {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, replies: p.replies.filter((r) => r.id !== replyId) } : p
      )
    );
    startTransition(() => deletePost(replyId, topic.id));
  }

  return (
    <div className="space-y-5">
      <div>
        <Link href="/board" className="text-sm text-muted-foreground hover:text-foreground">
          ← All topics
        </Link>
        <div className="mt-2 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{topic.title}</h1>
            {topic.description && (
              <p className="mt-1 text-sm text-muted-foreground">{topic.description}</p>
            )}
          </div>
          {canDeleteTopic && (
            <Button
              variant="ghost"
              onClick={() => {
                if (confirm("Delete this topic and all its messages?")) {
                  startTransition(() => deleteTopic(topic.id));
                }
              }}
            >
              <icons.trash className="h-4 w-4" />
              Delete topic
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {posts.length === 0 ? (
          <EmptyState title="No messages yet" description="Be the first to say something." />
        ) : (
          posts.map((post) => (
            <MessageThread
              key={post.id}
              post={post}
              currentUser={currentUser}
              open={openThreads.has(post.id)}
              onToggle={() => toggleThread(post.id)}
              onReply={(body) => postReply(post.id, body)}
              onDeletePost={() => removePost(post.id)}
              onDeleteReply={(replyId) => removeReply(post.id, replyId)}
            />
          ))
        )}
      </div>

      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-3">
        <textarea
          value={composer}
          onChange={(e) => setComposer(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              postMessage();
            }
          }}
          rows={3}
          placeholder="Post a new message to this topic… (⌘/Ctrl + Enter to send)"
          className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <div className="flex justify-end">
          <Button onClick={postMessage} disabled={pending || !composer.trim()}>
            Post message
          </Button>
        </div>
      </div>
    </div>
  );
}

function MessageThread({
  post,
  currentUser,
  open,
  onToggle,
  onReply,
  onDeletePost,
  onDeleteReply,
}: {
  post: PostData;
  currentUser: CurrentUser;
  open: boolean;
  onToggle: () => void;
  onReply: (body: string) => void;
  onDeletePost: () => void;
  onDeleteReply: (replyId: string) => void;
}) {
  const [replyText, setReplyText] = useState("");
  const canDelete = (author: Author) =>
    currentUser.role === "ADMIN" || currentUser.id === author?.id;

  function submitReply() {
    const body = replyText.trim();
    if (!body) return;
    setReplyText("");
    onReply(body);
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-surface p-4">
      <MessageRow author={post.author} createdAt={post.createdAt} body={post.body}>
        {canDelete(post.author) && (
          <button
            onClick={onDeletePost}
            aria-label="Delete message"
            className="rounded-lg p-1 text-muted-foreground hover:bg-surface-muted hover:text-danger"
          >
            <icons.trash className="h-3.5 w-3.5" />
          </button>
        )}
      </MessageRow>

      <button
        onClick={onToggle}
        className="mt-2 flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
      >
        <icons.reply className="h-3.5 w-3.5" />
        {post.replies.length > 0
          ? `${post.replies.length} ${post.replies.length === 1 ? "reply" : "replies"}`
          : "Reply"}
      </button>

      {open && (
        <div className="mt-3 space-y-3 border-t border-border pt-3 pl-3">
          {post.replies.map((reply) => (
            <MessageRow
              key={reply.id}
              author={reply.author}
              createdAt={reply.createdAt}
              body={reply.body}
              compact
            >
              {canDelete(reply.author) && (
                <button
                  onClick={() => onDeleteReply(reply.id)}
                  aria-label="Delete reply"
                  className="rounded-lg p-1 text-muted-foreground hover:bg-surface-muted hover:text-danger"
                >
                  <icons.trash className="h-3.5 w-3.5" />
                </button>
              )}
            </MessageRow>
          ))}
          <div className="flex gap-2">
            <input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submitReply();
                }
              }}
              placeholder="Reply in thread…"
              className="flex-1 rounded-[var(--radius-control)] border border-border bg-surface px-3 py-1.5 text-sm outline-none focus:border-primary"
            />
            <Button variant="secondary" onClick={submitReply} disabled={!replyText.trim()}>
              Send reply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function MessageRow({
  author,
  createdAt,
  body,
  compact,
  children,
}: {
  author: Author;
  createdAt: Date;
  body: string;
  compact?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Avatar name={author?.name ?? "?"} size={compact ? 26 : 32} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{author?.name ?? "Former member"}</span>
          <span className="text-xs text-muted-foreground">
            {createdAt.toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        </div>
        <p className="whitespace-pre-wrap text-sm">{body}</p>
      </div>
      {children}
    </div>
  );
}
