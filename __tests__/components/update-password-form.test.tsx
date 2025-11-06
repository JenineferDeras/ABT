import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { UpdatePasswordForm } from "@/components/update-password-form";
import type { Message } from "@/components/form-message";

jest.mock("@/components/submit-button", () => ({
  SubmitButton: ({ children }: { children: React.ReactNode }) => (
    <button type="button">{children}</button>
  ),
}));

describe("UpdatePasswordForm", () => {
  const renderForm = (message?: Message) =>
    render(<UpdatePasswordForm searchParams={Promise.resolve(message as Message)} />);

  it("renders password and confirmation fields", async () => {
    renderForm();

    expect(screen.getByLabelText("New password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset password" })).toBeInTheDocument();
  });

  it("shows password strength feedback as the user types", async () => {
    renderForm();

    const passwordInput = screen.getByLabelText("New password");

    await userEvent.type(passwordInput, "weak");
    expect(
      screen.getByText("Password must be at least 8 characters long", { exact: false }),
    ).toBeInTheDocument();

    await userEvent.clear(passwordInput);
    await userEvent.type(passwordInput, "Str0ngP@ssword!");

    await waitFor(() => {
      expect(screen.getByText(/Password strength/i)).toHaveTextContent("medium");
    });
  });

  it("flags confirmation mismatch and clears once corrected", async () => {
    renderForm();

    const passwordInput = screen.getByLabelText("New password");
    const confirmInput = screen.getByLabelText("Confirm password");

    await userEvent.type(passwordInput, "Str0ngP@ssword!");
    await userEvent.type(confirmInput, "Different123!");

    expect(screen.getByText("Passwords do not match")).toBeInTheDocument();

    await userEvent.clear(confirmInput);
    await userEvent.type(confirmInput, "Str0ngP@ssword!");

    await waitFor(() => {
      expect(screen.queryByText("Passwords do not match")).not.toBeInTheDocument();
    });
  });

  it("renders message from search params when provided", async () => {
    renderForm({ success: "Password updated" });

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("Password updated");
    });
  });
});
