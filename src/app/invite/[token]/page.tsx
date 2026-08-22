import { prisma } from "@/lib/prisma";
import AcceptInviteForm from "./accept-invite-form";

export default async function InvitePage({
  params,
}: PageProps<"/invite/[token]">) {
  const { token } = await params;

  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { invitedBy: { select: { name: true } } },
  });

  const invalid = !invite || !!invite.acceptedAt || invite.expiresAt < new Date();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {invalid || !invite ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-danger/10 text-lg font-bold text-danger">
              !
            </div>
            <h1 className="text-xl font-semibold">Invite not available</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This invite link is invalid, already used, or has expired. Ask an
              admin to send you a new one.
            </p>
            <a
              href="/login"
              className="mt-6 inline-block text-sm font-medium text-primary hover:underline"
            >
              Back to sign in
            </a>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground">
                TH
              </div>
              <h1 className="text-xl font-semibold">Join the team</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {invite.invitedBy.name} invited you ({invite.email}) to join as{" "}
                {invite.role.toLowerCase()}.
              </p>
            </div>
            <AcceptInviteForm token={token} />
          </>
        )}
      </div>
    </div>
  );
}
