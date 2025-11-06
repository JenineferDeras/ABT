"use client";

import type { ActionState } from "@/app/actions";
import { updatePasswordAction } from "@/app/actions";
import { FormMessage } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionState, useState } from "react";

export interface UpdatePasswordFormProps {
  readonly onSuccess?: () => void;
}

export function UpdatePasswordForm({
  onSuccess: _onSuccess,
}: UpdatePasswordFormProps) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    async (_prevState, formData) => {
      return updatePasswordAction(_prevState, formData);
    },
    { error: "", success: false }
  );

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="new-password">New password</Label>
        <Input
          id="new-password"
          name="password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="confirm-password">Confirm password</Label>
        <Input
          id="confirm-password"
          name="confirm_password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      {newPassword && confirmPassword && newPassword !== confirmPassword && (
        <div className="text-sm text-red-600">Passwords do not match</div>
      )}

      <Button type="submit" disabled={!newPassword || !confirmPassword}>
        Reset password
      </Button>

      {state.error && <FormMessage message={state.error} type="error" />}
      {state.success && (
        <FormMessage message="Password updated successfully" type="success" />
      )}
    </form>
  );
}
