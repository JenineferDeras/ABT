"use server";

import { createClient } from "@/lib/supabase/server";
import { encodedRedirect, validatePasswordStrength } from "@/lib/utils";

/**
 * Sanitizes error messages to prevent information disclosure
 * @param error - The error object from Supabase
 * @returns A safe, user-friendly error message
 */
function sanitizeErrorMessage(error: any): string {
  // Map of known error codes to safe messages
  const errorMap: Record<string, string> = {
    "auth/user-not-found": "Invalid credentials. Please try again.",
    "auth/wrong-password": "Invalid credentials. Please try again.",
    "auth/email-already-in-use": "This email is already registered.",
    "auth/weak-password": "Password does not meet security requirements.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/operation-not-allowed": "This operation is not allowed.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
  };

  // Check for known error codes
  if (error?.code && errorMap[error.code]) {
    return errorMap[error.code];
  }

  // Check for specific error messages (without exposing internal details)
  const message = error?.message?.toLowerCase() || "";

  if (message.includes("password")) {
    return "Password does not meet security requirements.";
  }
  if (message.includes("email")) {
    return "Please check your email address and try again.";
  }
  if (message.includes("user") || message.includes("account")) {
    return "Unable to complete the request. Please try again.";
  }
  if (message.includes("network") || message.includes("timeout")) {
    return "Network error. Please check your connection and try again.";
  }

  // Generic fallback (never expose internal error details)
  return "An error occurred. Please try again or contact support.";
}

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
    // Use sanitized error message instead of raw error
    return encodedRedirect(
      "error",
      "/auth/reset-password",
      sanitizeErrorMessage(error)
    );
  }

  return encodedRedirect(
    "success",
    "/protected",
    "Password updated successfully"
  );
}

/**
 * Server action to handle user sign up
 * @param _prevState - The previous state, containing error and success flags
 * @param formData - FormData containing email and password fields
 * @returns An object containing error message and success flag
 */
export async function signUpAction(
  _prevState: { error: string; success: boolean },
  formData: FormData
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required", success: false };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/auth/callback`,
      },
    });

    if (error) {
      return { error: error.message, success: false };
    }

    return { error: "", success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "An error occurred";
    return { error: message, success: false };
  }
}
