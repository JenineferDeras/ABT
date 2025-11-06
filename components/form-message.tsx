"use client";

export interface FormMessageProps {
  readonly message?: string;
  readonly type?: "error" | "success";
}

export function FormMessage({ message, type = "error" }: FormMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <div
      className={`p-3 rounded-md text-sm ${
        type === "error"
          ? "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200"
          : "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200"
      }`}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
