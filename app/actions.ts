"use server";

import { createClient } from "@/lib/supabase/server";
import { encodedRedirect, validatePasswordStrength } from "@/lib/utils";

/**
 * Server action to update user password with strength validation
 * @param formData - FormData containing password and confirmPassword fields
 * @returns Never returns - redirects based on success/failure
 */
export async function updatePasswordAction(formData: FormData): Promise<never> {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    return encodedRedirect(
      "error",
      "/auth/reset-password",
      "Password and confirm password are required"
    );
  }

  if (password !== confirmPassword) {
    return encodedRedirect(
      "error",
      "/auth/reset-password",
      "Passwords do not match"
    );
  }

  // Validate password strength
  const validation = validatePasswordStrength(password);
  if (!validation.isValid) {
    return encodedRedirect(
      "error",
      "/auth/reset-password",
      validation.errors.join(". ")
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    return encodedRedirect("error", "/auth/reset-password", error.message);
  }

  return encodedRedirect(
    "success",
    "/protected",
    "Password updated successfully"
  );
}
