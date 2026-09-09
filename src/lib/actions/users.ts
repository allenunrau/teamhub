"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { sendInviteEmail } from "@/lib/mailer";
import type { FormState } from "@/lib/actions/auth";

const InviteSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  role: z.enum(["USER", "ADMIN"]),
});

const CreateUserSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters."),
    email: z.string().trim().toLowerCase().email("Enter a valid email address."),
    password: z.string().min(3, "Password must be at least 3 characters."),
    confirmPassword: z.string(),
    role: z.enum(["USER", "ADMIN"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export async function createUserDirect(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const parsed = CreateUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { name, email, password, role } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "A user with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { name, email, passwordHash, role } });

  revalidatePath("/users");
  return { error: undefined };
}

const UpdateUserSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters."),
    email: z.string().trim().toLowerCase().email("Enter a valid email address."),
    role: z.enum(["USER", "ADMIN"]),
    password: z.union([
      z.literal(""),
      z.string().min(3, "New password must be at least 3 characters."),
    ]),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export async function updateUser(
  userId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const admin = await requireAdmin();

  const parsed = UpdateUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    password: formData.get("password") ?? "",
    confirmPassword: formData.get("confirmPassword") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { name, email, role, password } = parsed.data;

  if (admin.id === userId && role !== "ADMIN") {
    return { error: "You cannot remove your own admin access." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.id !== userId) {
    return { error: "A user with this email already exists." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      email,
      role,
      ...(password ? { passwordHash: await bcrypt.hash(password, 10) } : {}),
    },
  });

  revalidatePath("/users");
  return { error: undefined };
}

const INVITE_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export async function inviteUser(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const admin = await requireAdmin();

  const parsed = InviteSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { email, role } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "A user with this email already exists." };
  }

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + INVITE_DURATION_MS);

  // Replace any outstanding invite for this email so only one link is valid.
  await prisma.invite.deleteMany({ where: { email, acceptedAt: null } });
  await prisma.invite.create({
    data: { email, role, token, expiresAt, invitedById: admin.id },
  });

  const appUrl = process.env.APP_URL || "http://localhost:3000";
  await sendInviteEmail({
    to: email,
    inviteUrl: `${appUrl}/invite/${token}`,
    invitedByName: admin.name,
    role,
  });

  revalidatePath("/users");
  return { error: undefined };
}

export async function deleteUser(userId: string) {
  const admin = await requireAdmin();
  if (admin.id === userId) {
    throw new Error("You cannot delete your own account.");
  }
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/users");
}

export async function setUserRole(userId: string, role: "USER" | "ADMIN") {
  const admin = await requireAdmin();
  if (admin.id === userId && role !== "ADMIN") {
    throw new Error("You cannot remove your own admin access.");
  }
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/users");
}

export async function revokeInvite(inviteId: string) {
  await requireAdmin();
  await prisma.invite.delete({ where: { id: inviteId } });
  revalidatePath("/users");
}

export async function resendInvite(inviteId: string) {
  const admin = await requireAdmin();
  const invite = await prisma.invite.findUnique({ where: { id: inviteId } });
  if (!invite) return;

  const expiresAt = new Date(Date.now() + INVITE_DURATION_MS);
  const updated = await prisma.invite.update({
    where: { id: inviteId },
    data: { expiresAt },
  });

  const appUrl = process.env.APP_URL || "http://localhost:3000";
  await sendInviteEmail({
    to: updated.email,
    inviteUrl: `${appUrl}/invite/${updated.token}`,
    invitedByName: admin.name,
    role: updated.role,
  });
  revalidatePath("/users");
}
