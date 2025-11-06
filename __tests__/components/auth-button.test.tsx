import { AuthButton } from "@/components/auth-button";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the Supabase server client
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

// Mock Next.js Link component
vi.mock("next/link", () => {
  return {
    default: function MockLink({
      children,
      href,
      ...props
    }: {
      children: React.ReactNode;
      href: string;
    }) {
      return (
        <a href={href} {...props}>
          {children}
        </a>
      );
    },
  };
});

// Mock LogoutButton component
vi.mock("@/components/logout-button", () => ({
  LogoutButton: () => <button>Sign out</button>,
}));

// Mock UI Button component
vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    asChild,
    variant,
    ...props
  }: {
    children: React.ReactNode;
    asChild?: boolean;
    variant?: string;
  }) => {
    if (asChild) {
      return (
        <div data-variant={variant} {...props}>
          {children}
        </div>
      );
    }
    return (
      <button data-variant={variant} {...props}>
        {children}
      </button>
    );
  },
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

describe("AuthButton Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("displays user email and logout button when user is authenticated", async () => {
    // Mock authenticated user
    const mockClient = {
      auth: {
        getClaims: vi.fn().mockResolvedValue({
          data: {
            claims: {
              email: "analyst@abaco.finance",
              sub: "123",
            },
          },
        }),
      },
    };
    const mockCreateClient = vi.mocked(
      (await import("@/lib/supabase/server")).createClient
    );
    mockCreateClient.mockResolvedValue(mockClient);

    render(await AuthButton());

    expect(screen.getByText("Hey, analyst@abaco.finance!")).toBeInTheDocument();
    expect(screen.getByText("Sign out")).toBeInTheDocument();

    // Should not show sign in/up buttons
    expect(screen.queryByText("Sign in")).not.toBeInTheDocument();
    expect(screen.queryByText("Sign up")).not.toBeInTheDocument();
  });

  it("displays sign in and sign up buttons when user is not authenticated", async () => {
    // Mock unauthenticated user
    const mockClient = {
      auth: {
        getClaims: vi.fn().mockResolvedValue({
          data: {
            claims: null,
          },
        }),
      },
    };
    const mockCreateClient = vi.mocked(
      (await import("@/lib/supabase/server")).createClient
    );
    mockCreateClient.mockResolvedValue(mockClient);

    render(await AuthButton());

    expect(screen.getByText("Sign in")).toBeInTheDocument();
    expect(screen.getByText("Sign up")).toBeInTheDocument();

    // Should not show user email or logout button
    expect(screen.queryByText(/Hey,/)).not.toBeInTheDocument();
    expect(screen.queryByText("Sign out")).not.toBeInTheDocument();
  });

  it("displays sign in and sign up buttons when claims data is undefined", async () => {
    // Mock undefined claims data
    const mockClient = {
      auth: {
        getClaims: vi.fn().mockResolvedValue({
          data: undefined,
        }),
      },
    };
    const mockCreateClient = vi.mocked(
      (await import("@/lib/supabase/server")).createClient
    );
    mockCreateClient.mockResolvedValue(mockClient);

    render(await AuthButton());

    expect(screen.getByText("Sign in")).toBeInTheDocument();
    expect(screen.getByText("Sign up")).toBeInTheDocument();
  });

  it("displays sign in and sign up buttons when getClaims returns no data", async () => {
    // Mock no data returned
    const mockClient = {
      auth: {
        getClaims: vi.fn().mockResolvedValue({}),
      },
    };
    const mockCreateClient = vi.mocked(
      (await import("@/lib/supabase/server")).createClient
    );
    mockCreateClient.mockResolvedValue(mockClient);

    render(await AuthButton());

    expect(screen.getByText("Sign in")).toBeInTheDocument();
    expect(screen.getByText("Sign up")).toBeInTheDocument();
  });

  it("sign in and sign up buttons have correct links", async () => {
    // Mock unauthenticated user
    const mockClient = {
      auth: {
        getClaims: vi.fn().mockResolvedValue({
          data: {
            claims: null,
          },
        }),
      },
    };
    const mockCreateClient = vi.mocked(
      (await import("@/lib/supabase/server")).createClient
    );
    mockCreateClient.mockResolvedValue(mockClient);

    render(await AuthButton());

    const signInLink = screen.getByText("Sign in").closest("a");
    const signUpLink = screen.getByText("Sign up").closest("a");

    expect(signInLink).toHaveAttribute("href", "/auth/login");
    expect(signUpLink).toHaveAttribute("href", "/auth/sign-up");
  });

  it("applies correct styling classes to authenticated user view", async () => {
    // Mock authenticated user
    const mockClient = {
      auth: {
        getClaims: vi.fn().mockResolvedValue({
          data: {
            claims: {
              email: "analyst@abaco.finance",
              sub: "123",
            },
          },
        }),
      },
    };
    const mockCreateClient = vi.mocked(
      (await import("@/lib/supabase/server")).createClient
    );
    mockCreateClient.mockResolvedValue(mockClient);

    const { container } = render(await AuthButton());

    const userContainer = container.querySelector(".flex.items-center.gap-4");
    expect(userContainer).toBeInTheDocument();
  });

  it("applies correct styling classes to unauthenticated user view", async () => {
    // Mock unauthenticated user
    const mockClient = {
      auth: {
        getClaims: vi.fn().mockResolvedValue({
          data: {
            claims: null,
          },
        }),
      },
    };
    const mockCreateClient = vi.mocked(
      (await import("@/lib/supabase/server")).createClient
    );
    mockCreateClient.mockResolvedValue(mockClient);

    const { container } = render(await AuthButton());

    const buttonContainer = container.querySelector(".flex.gap-2");
    expect(buttonContainer).toBeInTheDocument();
  });

  it("handles Supabase client creation errors gracefully", async () => {
    // Mock Supabase client creation error
    const mockCreateClient = vi.mocked(
      (await import("@/lib/supabase/server")).createClient
    );
    mockCreateClient.mockRejectedValue(new Error("Failed to create client"));

    await expect(AuthButton()).rejects.toThrow("Failed to create client");
  });

  it("handles getClaims errors gracefully", async () => {
    // Mock getClaims error
    const mockClient = {
      auth: {
        getClaims: vi.fn().mockRejectedValue(new Error("Failed to get claims")),
      },
    };
    const mockCreateClient = vi.mocked(
      (await import("@/lib/supabase/server")).createClient
    );
    mockCreateClient.mockResolvedValue(mockClient);

    await expect(AuthButton()).rejects.toThrow("Failed to get claims");
  });
});
