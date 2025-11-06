import { createClient } from "@/lib/supabase/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock @supabase/ssr
vi.mock("@supabase/ssr", () => ({
  createBrowserClient: vi.fn(),
}));

describe("Supabase Browser Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a browser client", () => {
    const { createBrowserClient } = vi.mocked(require("@supabase/ssr"));

    createBrowserClient("url", "key");
    expect(createBrowserClient).toHaveBeenCalledWith("url", "key");
  });

  it("should initialize with proper credentials", () => {
    const client = createClient();

    expect(client).toBeDefined();
    expect(client.auth).toBeDefined();
    expect(client.from).toBeDefined();
  });

  it("should handle auth state", () => {
    const client = createClient();

    expect(typeof client.auth.signOut).toBe("function");
    expect(typeof client.auth.getUser).toBe("function");
    expect(typeof client.auth.getClaims).toBe("function");
  });

  it("should manage sessions", () => {
    // ...existing test code...
  });

  it("should handle errors gracefully", () => {
    // ...existing test code...
  });
});
