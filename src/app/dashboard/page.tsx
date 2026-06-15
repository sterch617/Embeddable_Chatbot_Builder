import { requireUser } from "@/lib/auth/session";
import { logoutAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand";

export const metadata = { title: "Dashboard" };

// Placeholder dashboard — replaced by the full bots dashboard in a later step.
export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <div className="min-h-screen">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Logo />
          <form action={logoutAction}>
            <Button variant="ghost" size="sm" type="submit">
              Sign out
            </Button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome, {user.email}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Your workspace is ready. The dashboard is coming together next.
        </p>
      </main>
    </div>
  );
}
