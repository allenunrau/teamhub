import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import ThreadView from "./thread-view";

export default async function TopicPage({
  params,
}: PageProps<"/board/[topicId]">) {
  const { topicId } = await params;
  const currentUser = await getCurrentUser();

  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: {
      createdBy: { select: { id: true, name: true } },
      posts: {
        where: { parentId: null },
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { id: true, name: true } },
          replies: {
            orderBy: { createdAt: "asc" },
            include: { author: { select: { id: true, name: true } } },
          },
        },
      },
    },
  });

  if (!topic) notFound();

  return <ThreadView topic={topic} currentUser={currentUser} />;
}
