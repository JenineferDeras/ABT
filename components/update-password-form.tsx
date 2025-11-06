"use client";

import { updatePasswordAction } from "@/app/actions";
import { FormMessage, type Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validatePasswordStrength } from "@/lib/utils";
import { useEffect, useState } from "react";

export function UpdatePasswordForm({
  searchParams,
}: {
  searchParams: Promise<Message>;
}) {
  const [params, setParams] = useState<Message | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [strengthIndicator, setStrengthIndicator] = useState<{
    strength: "weak" | "medium" | "strong";
    color: string;
  } | null>(null);

  useEffect(() => {
    searchParams.then(setParams);
  }, [searchParams]);

  const handlePasswordChange = (value: string) => {
    setPassword(value);

    if (value.length > 0) {
      const validation = validatePasswordStrength(value);

      if (!validation.isValid) {
        setPasswordError(validation.errors[0]);
      } else {
        setPasswordError(null);
      }

      // Set strength indicator color
      const colorMap = {
        weak: "text-red-600",
        medium: "text-yellow-600",
        strong: "text-green-600",
      };

      setStrengthIndicator({
        strength: validation.strength,
        color: colorMap[validation.strength],
      });
    } else {
      setPasswordError(null);
      setStrengthIndicator(null);
    }
  };

  return (
    <form
      action={updatePasswordAction}
      className="flex flex-col min-w-64 max-w-64 mx-auto"
    >
      <h1 className="text-2xl font-medium">Reset password</h1>
      <p className="text-sm text-foreground/60">
        Please enter your new password below.
      </p>
      <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          type="password"
          name="password"
          placeholder="New password"
          required
          value={password}
          onChange={(e) => handlePasswordChange(e.target.value)}
          aria-invalid={!!passwordError}
          aria-describedby={passwordError ? "password-error" : undefined}
        />
        {passwordError && (
          <p id="password-error" className="text-sm text-red-600" role="alert">
            {passwordError}
          </p>
        )}
        {strengthIndicator && !passwordError && (
          <p className={`text-sm ${strengthIndicator.color}`} role="status">
            Password strength: <strong>{strengthIndicator.strength}</strong>
          </p>
        )}

        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          type="password"
          name="confirmPassword"
          placeholder="Confirm password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <SubmitButton>Reset password</SubmitButton>
        {params && <FormMessage message={params} />}
      </div>
    </form>
  );
}
