"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";

const EventSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required.").max(200),
    description: z.string().trim().max(4000).optional().default(""),
    location: z.string().trim().max(200).optional().default(""),
    date: z.string().min(1, "Date is required."),
    startTime: z.string().optional().default(""),
    endTime: z.string().optional().default(""),
    allDay: z.coerce.boolean().optional().default(false),
  })
  .transform((data) => {
    const allDay = data.allDay || !data.startTime;
    const startsAt = allDay
      ? new Date(`${data.date}T00:00:00`)
      : new Date(`${data.date}T${data.startTime}:00`);
    const endsAt = allDay
      ? new Date(`${data.date}T23:59:59`)
      : new Date(`${data.date}T${data.endTime || data.startTime}:00`);
    return { ...data, allDay, startsAt, endsAt };
  })
  .refine((data) => data.endsAt >= data.startsAt, {
    error: "End time must be after start time.",
    path: ["endTime"],
  });

export type EventFormState = { error?: string } | undefined;

export async function createEvent(
  _prevState: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  const user = await getCurrentUser();
  const parsed = EventSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { title, description, location, allDay, startsAt, endsAt } = parsed.data;

  await prisma.calendarEvent.create({
    data: {
      title,
      description,
      location,
      allDay,
      startsAt,
      endsAt,
      createdById: user.id,
    },
  });

  revalidatePath("/calendar");
  revalidatePath("/");
  return undefined;
}

export async function updateEvent(
  eventId: string,
  _prevState: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  await getCurrentUser();
  const parsed = EventSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { title, description, location, allDay, startsAt, endsAt } = parsed.data;

  await prisma.calendarEvent.update({
    where: { id: eventId },
    data: { title, description, location, allDay, startsAt, endsAt },
  });

  revalidatePath("/calendar");
  revalidatePath("/");
  return undefined;
}

export async function deleteEvent(eventId: string) {
  await getCurrentUser();
  await prisma.calendarEvent.delete({ where: { id: eventId } });
  revalidatePath("/calendar");
  revalidatePath("/");
}

export async function addItem(eventId: string, title: string) {
  await getCurrentUser();
  const trimmed = title.trim();
  if (!trimmed) throw new Error("Item title is required.");
  const item = await prisma.eventItem.create({
    data: { eventId, title: trimmed },
  });
  revalidatePath("/calendar");
  return item;
}

export async function deleteItem(itemId: string) {
  await getCurrentUser();
  await prisma.eventItem.delete({ where: { id: itemId } });
  revalidatePath("/calendar");
}

export async function toggleItemDone(itemId: string, done: boolean) {
  await getCurrentUser();
  await prisma.eventItem.update({ where: { id: itemId }, data: { done } });
  revalidatePath("/calendar");
}

export async function assignItem(itemId: string, userId: string | null) {
  await getCurrentUser();
  await prisma.eventItem.update({
    where: { id: itemId },
    data: { assignedToId: userId },
  });
  revalidatePath("/calendar");
}

export async function claimItem(itemId: string) {
  const user = await getCurrentUser();
  await prisma.eventItem.update({
    where: { id: itemId },
    data: { assignedToId: user.id },
  });
  revalidatePath("/calendar");
}
