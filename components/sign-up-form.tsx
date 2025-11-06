"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [passwordMatchError, setPasswordMatchError] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Client-side password matching validation
  const handleRepeatPasswordChange = (value: string) => {
    setRepeatPassword(value);
    if (value && password && value !== password) {
      setPasswordMatchError("Passwords do not match");
    } else {
      setPasswordMatchError(null);
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (repeatPassword && value && repeatPassword !== value) {
      setPasswordMatchError("Passwords do not match");
    } else {
      setPasswordMatchError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/protected`,
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      router.push("/auth/sign-up-success");
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign up</CardTitle>
          <CardDescription>Create a new account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="analyst@abaco.finance"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="repeat-password">Repeat Password</Label>
                </div>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => handleRepeatPasswordChange(e.target.value)}
                  aria-invalid={!!passwordMatchError}
                  aria-describedby={
                    passwordMatchError ? "password-match-error" : undefined
                  }
                />
                {passwordMatchError && (
                  <p
                    id="password-match-error"
                    className="text-sm text-yellow-600"
                    role="alert"
                  >
                    {passwordMatchError}
                  </p>
                )}
              </div>
              {/* Screen reader announcements for errors */}
              <div aria-live="assertive" aria-atomic="true" className="sr-only">
                {error && `Error: ${error}`}
              </div>
              {error && (
                <p
                  className="text-sm text-red-500"
                  data-testid="error-message"
                  role="alert"
                >
                  {error}
                </p>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !!passwordMatchError}
              >
                {isLoading ? "Creating an account..." : "Sign up"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/auth/login" className="underline underline-offset-4">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
