"use client";

import { updatePasswordAction } from "@/app/actions";
import { FormMessage } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validatePasswordStrength } from "@/lib/utils";
import { useActionState, useState } from "react";

const MIN_TIME_BETWEEN_ATTEMPTS_MS = 1000;

export interface UpdatePasswordFormProps {
  readonly onSuccess?: () => void;
}

export function UpdatePasswordForm({ onSuccess }: UpdatePasswordFormProps) {
  const [state, formAction] = useActionState(updatePasswordAction, {
    error: "",
    success: false,
  });
  const [isThrottled, setIsThrottled] = useState(false);
  const [lastAttempt, setLastAttempt] = useState(0);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);
  const [strengthIndicator, setStrengthIndicator] = useState<{
    strength: "weak" | "medium" | "strong";
    color: string;
  } | null>(null);

  const handlePasswordChange = (value: string) => {
    setNewPassword(value);

    if (value.length > 0) {
      const validation = validatePasswordStrength(value);

      if (!validation.isValid) {
        setPasswordError(validation.errors[0]);
      } else {
        setPasswordError(null);
      }

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

    // Re-validate confirmation if it has a value
    if (confirmPassword.length > 0) {
      if (confirmPassword !== value) {
        setConfirmPasswordError("Passwords do not match");
      } else {
        setConfirmPasswordError(null);
      }
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);

    if (value.length > 0 && newPassword.length > 0) {
      if (value !== newPassword) {
        setConfirmPasswordError("Passwords do not match");
      } else {
        setConfirmPasswordError(null);
      }
    } else {
      setConfirmPasswordError(null);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        formAction(new FormData(e.currentTarget));
      }}
      className="flex flex-col w-full max-w-md p-4 gap-2 [&>input]:mb-4"
      noValidate
    >
      <h1 className="text-2xl font-medium">Reset password</h1>
      <p className="text-sm text-foreground/60">
        Please enter your new password below.
      </p>
      <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
        <Label htmlFor="new-password">New password</Label>
        <Input
          id="new-password"
          name="newPassword"
          type="password"
          placeholder="New password"
          required
          value={newPassword}
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

        <Label htmlFor="confirm-password">Confirm password</Label>
        <Input
          id="confirm-password"
          name="confirmPassword"
          type="password"
          placeholder="Confirm password"
          required
          value={confirmPassword}
          onChange={(e) => handleConfirmPasswordChange(e.target.value)}
          aria-invalid={!!confirmPasswordError}
          aria-describedby={
            confirmPasswordError ? "confirm-password-error" : undefined
          }
        />
        {confirmPasswordError && (
          <p
            id="confirm-password-error"
            className="text-sm text-red-600"
            role="alert"
          >
            {confirmPasswordError}
          </p>
        )}

        <FormMessage
          message={
            state.error ||
            (state.success ? "Password updated successfully" : "")
          }
          type={state.success ? "success" : "error"}
        />

        <Button
          type="submit"
          disabled={
            isThrottled ||
            !newPassword ||
            !confirmPassword ||
            newPassword !== confirmPassword
          }
          className="w-full"
        >
          Reset password
        </Button>

        {isThrottled && (
          <p className="text-xs text-muted-foreground" role="status">
            Please wait before trying again
          </p>
        )}
      </div>
    </form>
  );
}
