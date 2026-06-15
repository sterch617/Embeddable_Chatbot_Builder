import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthForm } from "@/components/auth-form";
import { loginAction } from "@/lib/auth/actions";
import { getCurrentUser } from "@/lib/auth/session";
import { APP_NAME } from "@/lib/constants";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to your {APP_NAME} workspace.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <AuthForm mode="login" action={loginAction} />
        <p className="text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link
            href="/signup"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
