"use client";

import Link from "next/link";
import { useActionState, useState, useCallback } from "react";
import { signUpAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/form-message";

/**
 * Password strength levels with visual feedback
 */
interface PasswordStrength {
  level: "weak" | "fair" | "good" | "strong";
  score: number;
  feedback: string;
}

/**
 * Calculate password strength based on criteria
 * @param password - Password to evaluate
 * @returns Strength assessment with feedback
 */
function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return { level: "weak", score: 0, feedback: "Enter a password" };

  let score = 0;
  const feedback: string[] = [];

  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;

  // Character variety
  if (/[A-Z]/.test(password)) {
    score += 1;
    feedback.push("✓ Uppercase letter");
  } else {
    feedback.push("• Add uppercase letter");
  }

  if (/[0-9]/.test(password)) {
    score += 1;
    feedback.push("✓ Number");
  } else {
    feedback.push("• Add number");
  }

  if (/[!@#$%^&*]/.test(password)) {
    score += 1;
    feedback.push("✓ Special character");
  } else {
    feedback.push("• Add special character (!@#$%^&*)");
  }

  const levelMap: Record<number, PasswordStrength["level"]> = {
    0: "weak",
    1: "weak",
    2: "fair",
    3: "good",
    4: "strong",
  };

  return {
    level: levelMap[score] || "strong",
    score,
    feedback: feedback.join("\n"),
  };
}

/**
 * Sign-up form component
 * Note: This is a client component and cannot directly accept Promise props
 * Any async operations should be handled via useActionState or useEffect
 */
export function SignUpForm() {
  const [state, formAction] = useActionState(signUpAction, {
    error: "",
    success: false,
  });

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const strength = getPasswordStrength(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
    },
    []
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
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
          minLength={8}
          aria-required="true"
          aria-describedby="password-strength"
        />
        <div
          id="password-strength"
          className="text-xs space-y-1 mt-2 p-2 bg-muted rounded"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 bg-gray-300 rounded overflow-hidden">
              <div
                className={`h-full transition-all ${
                  strength.level === "weak"
                    ? "w-1/4 bg-destructive"
                    : strength.level === "fair"
                      ? "w-1/2 bg-yellow-500"
                      : strength.level === "good"
                        ? "w-3/4 bg-blue-500"
                        : "w-full bg-success"
                }`}
              />
            </div>
            <span className="text-xs font-medium capitalize">{strength.level}</span>
          </div>
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
        {confirmPassword && !passwordsMatch && (
          <p
            id="password-mismatch"
            className="text-xs text-destructive"
            role="alert"
          >
            Passwords do not match
          </p>
        )}
        {passwordsMatch && (
          <p className="text-xs text-success">✓ Passwords match</p>
        )}
      </div>

      <FormMessage
        message={state.error}
        type="error"
      />

      <Button type="submit" className="w-full">
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
