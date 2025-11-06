"use client";

import { Button } from "@/components/ui/button";
import { type ComponentProps, type ReactNode } from "react";
import { useFormStatus } from "react-dom";

type ButtonProps = ComponentProps<typeof Button>;

interface SubmitButtonProps extends Omit<ButtonProps, "type" | "disabled"> {
  children: ReactNode;
  pendingText?: string;
}

export function SubmitButton({
  children,
  pendingText = "Submitting...",
  ...props
}: SubmitButtonProps): JSX.Element {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      aria-disabled={pending}
      aria-busy={pending}
      disabled={pending}
      {...props}
    >
      {pending ? pendingText : children}
    </Button>
  );
}
