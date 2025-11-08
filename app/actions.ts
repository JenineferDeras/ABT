"use server";

import { createClient } from "@/lib/supabase/server";

export interface ActionState {
  error: string;
  success: boolean;
}

export async function updatePasswordAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm_password") as string;

    if (!password || !confirmPassword) {
      return { error: "Password fields are required", success: false };
    }

    if (password !== confirmPassword) {
      return { error: "Passwords do not match", success: false };
    }

    if (password.length < 8) {
      return {
        error: "Password must be at least 8 characters",
        success: false,
      };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      password,
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

export async function signUpAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return { error: "Email and password are required", success: false };
    }

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
