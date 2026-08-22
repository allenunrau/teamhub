"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import type { FormState } from "@/lib/actions/auth";

const AnnouncementSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(150),
  body: z.string().trim().min(1, "Message is required.").max(4000),
});

export async function createAnnouncement(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await getCurrentUser();
  const parsed = AnnouncementSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await prisma.announcement.create({
    data: { ...parsed.data, authorId: user.id, pinned: user.role === "ADMIN" },
  });

  revalidatePath("/announcements");
  revalidatePath("/");
  return { error: undefined };
}

export async function deleteAnnouncement(id: string) {
  const user = await getCurrentUser();
  const announcement = await prisma.announcement.findUnique({ where: { id } });
  if (!announcement) return;
  if (announcement.authorId !== user.id && user.role !== "ADMIN") {
    throw new Error("You can only delete your own announcements.");
  }
  await prisma.announcement.delete({ where: { id } });
  revalidatePath("/announcements");
  revalidatePath("/");
}

export async function togglePin(id: string, pinned: boolean) {
  const user = await getCurrentUser();
  if (user.role !== "ADMIN") {
    throw new Error("Only admins can pin announcements.");
  }
  await prisma.announcement.update({ where: { id }, data: { pinned } });
  revalidatePath("/announcements");
  revalidatePath("/");
}
