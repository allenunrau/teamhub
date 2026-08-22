"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import type { FormState } from "@/lib/actions/auth";

const TopicSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(120),
  description: z.string().trim().max(500).optional().default(""),
});

export async function createTopic(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await getCurrentUser();
  const parsed = TopicSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const topic = await prisma.topic.create({
    data: { ...parsed.data, createdById: user.id },
  });

  revalidatePath("/board");
  redirect(`/board/${topic.id}`);
}

export async function createPost(
  topicId: string,
  parentId: string | null,
  body: string
) {
  const user = await getCurrentUser();
  const trimmed = body.trim();
  if (!trimmed) throw new Error("Message can't be empty.");

  const post = await prisma.post.create({
    data: { topicId, authorId: user.id, parentId, body: trimmed },
    include: { author: { select: { id: true, name: true } } },
  });

  revalidatePath(`/board/${topicId}`);
  return post;
}

export async function deletePost(postId: string, topicId: string) {
  const user = await getCurrentUser();
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return;
  if (post.authorId !== user.id && user.role !== "ADMIN") {
    throw new Error("You can only delete your own messages.");
  }
  await prisma.post.delete({ where: { id: postId } });
  revalidatePath(`/board/${topicId}`);
}

export async function deleteTopic(topicId: string) {
  const user = await getCurrentUser();
  const topic = await prisma.topic.findUnique({ where: { id: topicId } });
  if (!topic) return;
  if (topic.createdById !== user.id && user.role !== "ADMIN") {
    throw new Error("You can only delete topics you created.");
  }
  await prisma.topic.delete({ where: { id: topicId } });
  revalidatePath("/board");
  redirect("/board");
}
