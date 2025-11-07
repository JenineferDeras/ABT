import { type ClassValue, clsx } from "clsx";
import { redirect } from "next/navigation";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class value inputs into a single string and resolves Tailwind class conflicts.
 *
 * @param inputs - Any number of class values (strings, arrays, objects, etc.)
 * @returns A single class name string with conflicting Tailwind classes merged
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper functions to reduce complexity
function isValidEmailFormat(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPasswordLength(password: string): boolean {
  return password.length >= 8;
}

function hasUppercaseChar(str: string): boolean {
  return /[A-Z]/.test(str);
}

function hasLowercaseChar(str: string): boolean {
  return /[a-z]/.test(str);
}

function hasNumberChar(str: string): boolean {
  return /\d/.test(str);
}

function hasSpecialChar(str: string): boolean {
  return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(str);
}

// Simplified validation function
export function validateEmail(email: string): boolean {
  return isValidEmailFormat(email);
}

export function validatePassword(password: string): boolean {
  if (!isValidPasswordLength(password)) return false;
  if (!hasUppercaseChar(password)) return false;
  if (!hasLowercaseChar(password)) return false;
  if (!hasNumberChar(password)) return false;
  return hasSpecialChar(password);
}

export function validateUsername(username: string): boolean {
  return username.length >= 3 && username.length <= 20;
}

/**
 * Format a number using the en-US locale, defaulting to at most one fractional digit.
 *
 * @param value - The number to format
 * @param options - Intl.NumberFormatOptions to override defaults; by default `maximumFractionDigits` is 1
 * @returns The formatted number string according to the en-US locale and provided options
 */
export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions
) {
  const formatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
    ...options,
  });
  return formatter.format(value);
}

/**
 * Format a value as currency using the en-US locale.
 *
 * @param value - The number to format as currency
 * @param currency - The currency code (default: "USD")
 * @param options - Additional Intl.NumberFormatOptions to override defaults
 * @returns The formatted currency string
 */
export function formatCurrency(
  value: number,
  currency: string = "USD",
  options?: Intl.NumberFormatOptions
) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    ...options,
  });
  return formatter.format(value);
}

/**
 * Format a value as a percentage using the en-US locale.
 *
 * @param value - The number to format as a percentage (e.g., 0.5 for 50%)
 * @param options - Optional Intl.NumberFormatOptions to override defaults (default: `style: "percent"`, `maximumFractionDigits: 1`, `signDisplay: "auto"`).
 * @returns The formatted percentage string.
 */
export function formatPercent(
  value: number,
  options?: Intl.NumberFormatOptions
) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 1,
    signDisplay: "auto",
    ...options,
  });
  return formatter.format(value);
}

/**
 * Check if Supabase environment variables are present
 * Used to determine if Supabase features should be enabled
 */
export const hasEnvVars = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
);

/**
 * Password strength validation result
 */
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: "weak" | "medium" | "strong";
  score: number;
}

/**
 * Validates password strength and returns detailed feedback.
 *
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 *
 * @param password - The password to validate
 * @returns PasswordValidationResult with validation details
 */
export function validatePasswordStrength(
  password: string
): PasswordValidationResult {
  const errors: string[] = [];
  let score = 0;

  // Check minimum length
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  } else {
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
  }

  // Check for uppercase letters
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  } else {
    score += 1;
  }

  // Check for lowercase letters
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  } else {
    score += 1;
  }

  // Check for numbers
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  } else {
    score += 1;
  }

  // Check for special characters
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  } else {
    score += 1;
  }

  // Determine strength
  let strength: "weak" | "medium" | "strong" = "weak";
  if (score >= 6) {
    strength = "strong";
  } else if (score >= 4) {
    strength = "medium";
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    score,
  };
}

/**
 * Redirects to a given path with an encoded message
 */
export function encodedRedirect(
  type: "error" | "success",
  path: string,
  message: string
): never {
  const separator = path.includes("?") ? "&" : "?";
  return redirect(`${path}${separator}${type}=${encodeURIComponent(message)}`);
}

/**
 * Global utility styles for screen-reader-only content
 * Uses modern clip-path instead of deprecated clip property
 * Add to your globals.css:
 *
 * @layer components {
 *   .sr-only {
 *     @apply absolute w-1 h-1 p-0 -m-1;
 *     clip-path: inset(50%);
 *     white-space: nowrap;
 *     overflow: hidden;
 *   }
 * }
 */
