"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";

export interface FormMessageProps {
  readonly message?: string;
  readonly type: "error" | "success";
}

export function FormMessage({ message, type }: FormMessageProps) {
  if (!message) {
    return null;
  }

  const isError = type === "error";
  const Icon = isError ? AlertCircle : CheckCircle2;

  return (
    <output
      role="status"
      aria-live={isError ? "assertive" : "polite"}
      className={`text-sm font-medium flex items-center gap-2 ${
        isError ? "text-destructive" : "text-success"
      }`}
    >
      <Icon className="h-4 w-4" />
      {message}
    </output>
  );
}
