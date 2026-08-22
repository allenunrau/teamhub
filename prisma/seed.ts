import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@example.com";
  const adminPassword = "admin1234";

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Admin",
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: "ADMIN",
    },
  });

  const member = await prisma.user.upsert({
    where: { email: "alex@example.com" },
    update: {},
    create: {
      name: "Alex Chen",
      email: "alex@example.com",
      passwordHash: await bcrypt.hash("password123", 10),
      role: "USER",
    },
  });

  await prisma.announcement.upsert({
    where: { id: "seed-announcement-1" },
    update: {},
    create: {
      id: "seed-announcement-1",
      title: "Welcome to the team hub",
      body: "This is your space for the shared calendar, discussions, and team announcements. Pin important updates here so nobody misses them.",
      pinned: true,
      authorId: admin.id,
    },
  });

  const topic = await prisma.topic.upsert({
    where: { id: "seed-topic-1" },
    update: {},
    create: {
      id: "seed-topic-1",
      title: "General",
      description: "General team discussion",
      createdById: admin.id,
    },
  });

  const rootPost = await prisma.post.upsert({
    where: { id: "seed-post-1" },
    update: {},
    create: {
      id: "seed-post-1",
      topicId: topic.id,
      authorId: admin.id,
      body: "Welcome! Use this board to start discussions with the team. Reply in a thread to keep conversations organized.",
    },
  });

  await prisma.post.upsert({
    where: { id: "seed-post-2" },
    update: {},
    create: {
      id: "seed-post-2",
      topicId: topic.id,
      authorId: member.id,
      parentId: rootPost.id,
      body: "Looking forward to it!",
    },
  });

  const now = new Date();
  const eventStart = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  eventStart.setHours(10, 0, 0, 0);
  const eventEnd = new Date(eventStart.getTime() + 60 * 60 * 1000);

  const event = await prisma.calendarEvent.upsert({
    where: { id: "seed-event-1" },
    update: {},
    create: {
      id: "seed-event-1",
      title: "Weekly sync",
      description: "Team standup and planning",
      location: "Main office / video call",
      startsAt: eventStart,
      endsAt: eventEnd,
      createdById: admin.id,
    },
  });

  await prisma.eventItem.upsert({
    where: { id: "seed-item-1" },
    update: {},
    create: {
      id: "seed-item-1",
      eventId: event.id,
      title: "Prepare agenda",
      assignedToId: admin.id,
    },
  });

  await prisma.eventItem.upsert({
    where: { id: "seed-item-2" },
    update: {},
    create: {
      id: "seed-item-2",
      eventId: event.id,
      title: "Book meeting room",
    },
  });

  console.log("Seed complete.");
  console.log(`Admin login: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
