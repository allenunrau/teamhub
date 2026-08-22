import LoginForm from "./login-form";

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "/";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground">
            TH
          </div>
          <h1 className="text-xl font-semibold">Sign in to Team Hub</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your team&apos;s calendar, discussions, and announcements.
          </p>
        </div>
        <LoginForm next={next} />
      </div>
    </div>
  );
}
