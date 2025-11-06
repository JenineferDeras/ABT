"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export interface SubmitButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly children: ReactNode;
  readonly isLoading?: boolean;
}

export function SubmitButton({
  children,
  isLoading = false,
  disabled,
  type = "submit",
  ...props
}: SubmitButtonProps) {
  return (
    <Button
      {...props}
      type={type}
      disabled={isLoading || disabled}
    >
      {isLoading ? "Loading..." : children}
    </Button>
  );
}
