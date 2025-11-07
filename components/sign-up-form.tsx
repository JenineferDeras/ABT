"use client";

import { signUpAction } from "@/app/actions";
import { FormMessage } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useActionState, useCallback, useState } from "react";

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
  if (!password)
    return { level: "weak", score: 0, feedback: "Enter a password" };

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

  if (/\d/.test(password)) {
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

/**ction getPasswordStrengthLabel(password: string): string {
 * Sign-up form componentA-Z]/.test(password);
 * Note: This is a client component and cannot directly accept Promise props
 * Any async operations should be handled via useActionState or useEffect
 */onst hasSpecial = /[!@#$%^&*]/.test(password);
export function SignUpForm() {d.length >= 8;
  const [state, formAction] = useActionState(signUpAction, {
    error: "",nough) return "Too short";
    success: false,&& hasLowercase && hasNumbers && hasSpecial) return "Strong";
  });((hasUppercase || hasLowercase) && hasNumbers) return "Medium";
  return "Weak";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const strength = getPasswordStrength(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;
  const feedbackMap: Record<string, { message: string; className: string }> = {
  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {cters",
      setPassword(e.target.value);
    },
    []ak: {
  );  message: "Add uppercase, numbers, and special characters",
      className: "text-yellow-500",
  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">pecial characters",
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email" password",
          type="email"-green-500",
          placeholder="analyst@abaco.finance"
          required
          aria-required="true"
          aria-describedby={state.error ? "email-error" : undefined}
        />span className={feedback.className}>{feedback.message}</span>;
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>n {
        <Input
          id="password"8 &&
          name="password") &&
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={handlePasswordChange}
          required
          minLength={8}nt
          aria-required="true"onent and cannot directly accept Promise props
          aria-describedby="password-strength"useActionState or useEffect
        />
        <divion SignUpForm() {
          id="password-strength"eActionState(signUpAction, {
          className="text-xs space-y-1 mt-2 p-2 bg-muted rounded"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 bg-gray-300 rounded overflow-hidden">
              <div getPasswordStrength(password);
                className={`h-full transition-all ${d && password.length > 0;
                  strength.level === "weak"
                    ? "w-1/4 bg-destructive"
                    : strength.level === "fair" {
                    ? "w-1/2 bg-yellow-500"
                    : strength.level === "good"
                    ? "w-3/4 bg-blue-500"
                    : "w-full bg-success"
                }`}
              />
            </div>formAction} className="space-y-4">
            <span className="text-xs font-medium capitalize">
              {strength.level}>Email</Label>
            </span>
          </div>ail"
          <p className="text-xs text-muted-foreground whitespace-pre-line">
            {strength.feedback}
          </p>eholder="analyst@abaco.finance"
        </div>ired
      </div>ia-required="true"
          aria-describedby={state.error ? "email-error" : undefined}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"2">
          name="confirmPassword"">Password</Label>
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          requiredder="••••••••"
          aria-required="true"
          aria-describedby={!passwordsMatch ? "password-mismatch" : undefined}
        />required
        {confirmPassword && !passwordsMatch && (
          <pia-required="true"
            id="password-mismatch"rd-strength"
            className="text-xs text-destructive"
            role="alert"
          >d="password-strength"
            Passwords do not match-y-1 mt-2 p-2 bg-muted rounded"
          </p>="status"
        )}aria-live="polite"
        {passwordsMatch && (
          <p className="text-xs text-success">✓ Passwords match</p>
        )}  <div className="flex-1 h-1 bg-gray-300 rounded overflow-hidden">
      </div>  <div
                className={`h-full transition-all ${
      <FormMessage message={state.error} type="error" />
                    ? "w-1/4 bg-destructive"
      <Button type="submit" className="w-full">
        Sign Up     ? "w-1/2 bg-yellow-500"
      </Button>     : strength.level === "good"
                    ? "w-3/4 bg-blue-500"
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-primary hover:underline">
          Log inv>
        </Link>an className="text-xs font-medium capitalize">
      </p>    {strength.level}
    </form> </span>
  );      </div>
}         <p className="text-xs text-muted-foreground whitespace-pre-line">
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

      <FormMessage message={state.error} type="error" />

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
