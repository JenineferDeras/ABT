import { AuthButton } from "@/components/auth-button";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

// Mock modules
jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

jest.mock("@/components/logout-button", () => ({
  LogoutButton: () => <button>Sign out</button>,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    asChild,
    variant,
    ...props
  }: {
    children: React.ReactNode;
    asChild?: boolean;
    variant?: string;
    [key: string]: unknown;
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

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

describe("AuthButton Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("displays user email and logout button when user is authenticated", async () => {
    const mockClaims = {
      email: "analyst@abaco.finance",
      sub: "123",
    };

    const mockClient = {
      auth: {
        getClaims: jest.fn().mockResolvedValue({
          data: { claims: mockClaims },
          error: null,
        }),
      },
    } as unknown as ReturnType<
      typeof import("@/lib/supabase/server").createClient
    >;

    const { createClient } = require("@/lib/supabase/server");
    createClient.mockResolvedValue(mockClient);

    render(await AuthButton());

    expect(screen.getByText("Hey, analyst@abaco.finance!")).toBeInTheDocument();
    expect(screen.getByText("Sign out")).toBeInTheDocument();
    expect(screen.queryByText("Sign in")).not.toBeInTheDocument();
    expect(screen.queryByText("Sign up")).not.toBeInTheDocument();
  });

  it("displays sign in and sign up buttons when user is not authenticated", async () => {
    const mockClient = {
      auth: {
        getClaims: jest.fn().mockResolvedValue({
          data: { claims: null },
          error: null,
        }),
      },
    } as unknown as ReturnType<
      typeof import("@/lib/supabase/server").createClient
    >;

    const { createClient } = require("@/lib/supabase/server");
    createClient.mockResolvedValue(mockClient);

    render(await AuthButton());

    expect(screen.getByText("Sign in")).toBeInTheDocument();
    expect(screen.getByText("Sign up")).toBeInTheDocument();
    expect(screen.queryByText(/Hey,/)).not.toBeInTheDocument();
    expect(screen.queryByText("Sign out")).not.toBeInTheDocument();
  });

  it("displays sign in and sign up buttons when claims data is undefined", async () => {
    const mockClient = {
      auth: {
        getClaims: jest.fn().mockResolvedValue({
          data: undefined,
        }),
      },
    } as unknown as ReturnType<
      typeof import("@/lib/supabase/server").createClient
    >;

    const { createClient } = require("@/lib/supabase/server");
    createClient.mockResolvedValue(mockClient);

    render(await AuthButton());

    expect(screen.getByText("Sign in")).toBeInTheDocument();
    expect(screen.getByText("Sign up")).toBeInTheDocument();
  });

  it("displays sign in and sign up buttons when getClaims returns no data", async () => {
    const mockClient = {
      auth: {
        getClaims: jest.fn().mockResolvedValue({}),
      },
    } as unknown as ReturnType<
      typeof import("@/lib/supabase/server").createClient
    >;

    const { createClient } = require("@/lib/supabase/server");
    createClient.mockResolvedValue(mockClient);

    render(await AuthButton());

    expect(screen.getByText("Sign in")).toBeInTheDocument();
    expect(screen.getByText("Sign up")).toBeInTheDocument();
  });

  it("sign in and sign up buttons have correct links", async () => {
    const mockClient = {
      auth: {
        getClaims: jest.fn().mockResolvedValue({
          data: { claims: null },
        }),
      },
    } as unknown as ReturnType<
      typeof import("@/lib/supabase/server").createClient
    >;

    const { createClient } = require("@/lib/supabase/server");
    createClient.mockResolvedValue(mockClient);

    render(await AuthButton());

    const signInLink = screen.getByText("Sign in").closest("a");
    const signUpLink = screen.getByText("Sign up").closest("a");

    expect(signInLink).toHaveAttribute("href", "/auth/login");
    expect(signUpLink).toHaveAttribute("href", "/auth/sign-up");
  });

  it("applies correct styling classes to authenticated user view", async () => {
    const mockClaims = {
      email: "analyst@abaco.finance",
      sub: "123",
    };

    const mockClient = {
      auth: {
        getClaims: jest.fn().mockResolvedValue({
          data: { claims: mockClaims },
        }),
      },
    } as unknown as ReturnType<
      typeof import("@/lib/supabase/server").createClient
    >;

    const { createClient } = require("@/lib/supabase/server");
    createClient.mockResolvedValue(mockClient);

    const { container } = render(await AuthButton());
    const userContainer = container.querySelector(".flex.items-center.gap-4");

    expect(userContainer).toBeInTheDocument();
  });

  it("applies correct styling classes to unauthenticated user view", async () => {
    const mockClient = {
      auth: {
        getClaims: jest.fn().mockResolvedValue({
          data: { claims: null },
        }),
      },
    } as unknown as ReturnType<
      typeof import("@/lib/supabase/server").createClient
    >;

    const { createClient } = require("@/lib/supabase/server");
    createClient.mockResolvedValue(mockClient);

    const { container } = render(await AuthButton());
    const buttonContainer = container.querySelector(".flex.gap-2");

    expect(buttonContainer).toBeInTheDocument();
  });

  it("handles Supabase client creation errors gracefully", async () => {
    const { createClient } = require("@/lib/supabase/server");
    createClient.mockRejectedValue(new Error("Failed to create client"));

    await expect(AuthButton()).rejects.toThrow("Failed to create client");
  });

  it("handles getClaims errors gracefully", async () => {
    const mockClient = {
      auth: {
        getClaims: jest
          .fn()
          .mockRejectedValue(new Error("Failed to get claims")),
      },
    } as unknown as ReturnType<
      typeof import("@/lib/supabase/server").createClient
    >;

    const { createClient } = require("@/lib/supabase/server");
    createClient.mockResolvedValue(mockClient);

    await expect(AuthButton()).rejects.toThrow("Failed to get claims");
  });
});
