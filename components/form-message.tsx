export type Message =
  | { success: string }
  | { error: string }
  | { message: string };

interface FormMessageProps {
  message: Message | null | undefined;
}

export function FormMessage({ message }: FormMessageProps): JSX.Element | null {
  if (!message) return null;

  if ("success" in message) {
    return (
      <div
        className="text-sm text-green-600 dark:text-green-400"
        role="status"
        aria-live="polite"
      >
        {message.success}
      </div>
    );
  }

  if ("error" in message) {
    return (
      <div
        className="text-sm text-red-600 dark:text-red-400"
        role="alert"
        aria-live="assertive"
      >
        {message.error}
      </div>
    );
  }

  if ("message" in message) {
    return (
      <div className="text-sm text-foreground" role="status" aria-live="polite">
        {message.message}
      </div>
    );
  }

  return null;
}
