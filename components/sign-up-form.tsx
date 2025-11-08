"use client";

import { signUpAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useActionState, useCallback, useState } from "react";

/**
 * Password strength levels with visual feedback
 */
interface PasswordStrength {
  level: "weak" | "medium" | "strong";
  feedback: string;
}

/**
 * Calculate password strength based on criteria
 * @param password - Password to evaluate
 * @returns Strength assessment with feedback
 */
function getPasswordStrength(password: string): PasswordStrength {
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const specialCharPattern = /[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/;
  const hasSpecial = specialCharPattern.test(password);
  const isLongEnough = password.length >= 8;

  if (!isLongEnough) {
    return {
      level: "weak",
      feedback: "Password must be at least 8 characters",
    };
  }

  if (hasUppercase && hasLowercase && hasNumbers && hasSpecial) {
    return { level: "strong", feedback: "Strong password" };
  }

  if ((hasUppercase || hasLowercase) && hasNumbers) {
    return {
      level: "medium",
      feedback: "Medium password - add special characters",
    };
  }

  return {
    level: "weak",
    feedback: "Add uppercase, numbers, and special characters",
  };
}

export function SignUpForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [state, formAction] = useActionState(signUpAction, {
    error: "",
    success: false,
  });

  const strength = getPasswordStrength(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
    },
    [],
  );

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="analyst@abaco.finance"
          required
          aria-required="true"
          aria-describedby={state.error ? "email-error" : undefined}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={handlePasswordChange}
          required
          aria-required="true"
        />
        <div className="space-y-1 mt-2 p-2 bg-muted rounded">
          <div className="flex-1 h-1 bg-gray-300 rounded overflow-hidden">
            <div
              className={`h-full transition-all ${
                strength.level === "weak"
                  ? "w-1/3 bg-red-500"
                  : strength.level === "medium"
                    ? "w-2/3 bg-yellow-500"
                    : "w-full bg-green-500"
              }`}
            />
          </div>
          <p className="text-xs font-medium capitalize">{strength.level}</p>
          <p className="text-xs text-muted-foreground whitespace-pre-line">
            {strength.feedback}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          aria-required="true"
          aria-describedby={!passwordsMatch ? "password-mismatch" : undefined}
        />
        {!passwordsMatch && password.length > 0 && (
          <p
            id="password-mismatch"
            role="status"
            aria-live="polite"
            className="text-xs text-destructive"
          >
            Passwords do not match
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={!passwordsMatch}>
        Sign Up
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-primary hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
