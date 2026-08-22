# Team Hub

A small, self-hosted app for coordinating a small team: a shared calendar,
a threaded discussion board, team announcements, and simple user management
with email invites.

Built with Next.js 16 (App Router, Server Actions), Prisma + SQLite, and
Tailwind CSS. No external services are required to run it locally — invite
emails fall back to being logged to the console when SMTP isn't configured.

## Features

- **Users & roles** — invite teammates by email, two roles (member / admin),
  admins can promote/demote and remove people. Invite links expire after 7
  days and can be resent or revoked.
- **Shared calendar** — month view; anyone can create, edit, and delete
  events. Events can be broken into items, which can be assigned to a
  teammate or self-assigned ("Assign to me").
- **Discussion board** — multiple topics, Slack-style threads (a root
  message plus a reply thread), anyone can start a topic.
- **Announcements** — a dedicated space for team-wide updates; admins can
  pin the important ones to the top of the dashboard.
- **Responsive** — a sidebar on desktop, a slide-over menu + bottom tab bar
  on phones/tablets.

## Getting started

```bash
npm install
cp .env.example .env        # then edit SESSION_SECRET at minimum
npx prisma migrate dev      # creates prisma/dev.db and applies the schema
npm run db:seed             # creates a demo admin + sample data
npm run dev
```

Open http://localhost:3000 and sign in with the seeded admin account:

```
admin@example.com / admin1234
```

Change that password (or delete the seed data) before using this for real.

## Environment variables

See `.env.example`. At minimum, set a real `SESSION_SECRET`
(`openssl rand -base64 32`). SMTP settings are optional — without them,
invite emails are printed to the server console (with the invite link)
instead of being sent, which is enough to develop and test the invite flow
locally.

## Project structure

```
prisma/schema.prisma       Data model (User, Invite, CalendarEvent,
                            EventItem, Topic, Post, Announcement)
prisma/seed.ts              Demo data (admin user, sample event/topic/announcement)
src/lib/session.ts           Signed session cookie (jose)
src/lib/dal.ts                Data access layer: verifySession / getCurrentUser / requireAdmin
src/lib/actions/*.ts          Server Actions (mutations) per feature area
src/app/(app)/                Authenticated app shell + pages (dashboard, calendar, board, announcements, users)
src/app/login, src/app/invite Public auth pages
proxy.ts                      Optimistic route protection (redirects signed-out users to /login)
```

## Notes on scope

This is intentionally a small-team tool, not a multi-tenant SaaS product:
data isn't scoped by "workspace/organization" — every signed-in user sees
the same shared calendar, board, and announcements. Calendar and board
actions are open to any signed-in member (not just admins); only user
management (inviting, roles, removal) and pinning announcements are
admin-only.
# teamhub
