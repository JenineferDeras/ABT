import { clsx, type ClassValue } from "clsx";
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
export interface PasswordValidationResult {/**
  isValid: boolean;Password strength validation result
  errors: string[];
  strength: "weak" | "medium" | "strong";ort interface PasswordValidationResult {
  score: number;
}
| "medium" | "strong";
/**
 * Validates password strength and returns detailed feedback.
 *
 * Requirements:/**
 * - Minimum 8 charactersValidates password strength and returns detailed feedback.
 * - At least one uppercase letter
 * - At least one lowercase letter Requirements:
 * - At least one numberharacters
 * - At least one special characterse letter
 *
 * @param password - The password to validate
 * @returns PasswordValidationResult with validation detailsl character
 */
export function validatePasswordStrength( @param password - The password to validate
  password: stringidation details
): PasswordValidationResult {
  const errors: string[] = [];ort function validatePasswordStrength(
  let score = 0;
ionResult {
  // Check minimum length;
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  } else {  // Check minimum length
    score += 1;) {
    if (password.length >= 12) score += 1;st be at least 8 characters long");
    if (password.length >= 16) score += 1;
  }+= 1;
d.length >= 12) score += 1;
  // Check for uppercase letters
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  } else {  // Check for uppercase letters
    score += 1;
  }ontain at least one uppercase letter");

  // Check for lowercase letters+= 1;
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  } else {  // Check for lowercase letters
    score += 1;
  }ontain at least one lowercase letter");

  // Check for numbers+= 1;
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  } else {  // Check for numbers
    score += 1;ord)) {
  }t contain at least one number");

  // Check for special characters+= 1;
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  } else {  // Check for special characters
    score += 1;"\\|,.<>\/?]/.test(password)) {
  }acter");

  // Determine strength+= 1;
  let strength: "weak" | "medium" | "strong" = "weak";
  if (score >= 6) {
    strength = "strong";  // Determine strength
  } else if (score >= 4) {| "medium" | "strong" = "weak";
    strength = "medium";
  }ong";
 {
  return {
    isValid: errors.length === 0,
    errors,
    strength,  return {
    score,d: errors.length === 0,
  };
}h,

/**
 * Redirects to a given path with an encoded message and type as query parameters.
 * Handles paths that already contain query parameters.
 */**
 * @param type - The type of the message (e.g., "error" or "success")Redirects to a given path with an encoded message and type as query parameters.
 * @param path - The path to redirect to (may include existing query parameters)
 * @param message - The message to encode and include in the query parameters
 * @returns A redirect to the specified path with the encoded message @param type - The type of the message (e.g., "error" or "success")
 */parameters)
export function encodedRedirect(
  type: "error" | "success",
  path: string,
  message: stringort function encodedRedirect(
): never {
  const separator = path.includes("?") ? "&" : "?";
  return redirect(`${path}${separator}${type}=${encodeURIComponent(message)}`);ng
}
