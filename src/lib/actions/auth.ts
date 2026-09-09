"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";

export type FormState = { error?: string } | undefined;

const LoginSchema = z.object({
  identifier: z.string().trim().min(1, "Enter your email or name."),
  password: z.string().min(1, "Password is required."),
});

async function findUserByIdentifier(identifier: string) {
  const byEmail = await prisma.user.findUnique({ where: { email: identifier.toLowerCase() } });
  if (byEmail) return byEmail;

  const users = await prisma.user.findMany();
  return users.find((u) => u.name.toLowerCase() === identifier.toLowerCase()) ?? null;
}

export async function login(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = LoginSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { identifier, password } = parsed.data;

  const user = await findUserByIdentifier(identifier);
  if (!user) {
    console.warn(`[auth] failed login: unknown identifier "${identifier}"`);
    return { error: "Invalid email or password." };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    console.warn(`[auth] failed login: wrong password for "${identifier}"`);
    return { error: "Invalid email or password." };
  }

  await createSession(user.id, user.role);
  const next = formData.get("next");
  redirect(typeof next === "string" && next.startsWith("/") ? next : "/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}

const AcceptInviteSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters."),
    password: z.string().min(3, "Password must be at least 3 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export async function acceptInvite(
  token: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = AcceptInviteSchema.safeParse({
    name: formData.get("name"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const invite = await prisma.invite.findUnique({ where: { token } });
  if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
    return { error: "This invite link is invalid or has expired." };
  }

  const existing = await prisma.user.findUnique({ where: { email: invite.email } });
  if (existing) {
    return { error: "An account with this email already exists. Try logging in instead." };
  }

  const { name, password } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        name,
        email: invite.email,
        passwordHash,
        role: invite.role,
      },
    });
    await tx.invite.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    });
    return created;
  });

  await createSession(user.id, user.role);
  redirect("/");
}
