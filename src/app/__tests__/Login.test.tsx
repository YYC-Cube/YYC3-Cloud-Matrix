/**
 * @file: Login.test.tsx
 * @description: Login.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { Login } from "../modules/shared/Login";
import { supabase } from "../lib/supabaseClient";

vi.mock("../lib/supabaseClient", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
    },
  },
}));

vi.mock("../modules/shared/YYC3Logo", () => ({
  YYC3Logo: () => <div data-testid="yyc3-logo">YYC3 Logo</div>,
}));

describe("Login Component", () => {
  const mockOnLoginSuccess = vi.fn();
  const mockOnGhostLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should render login form", () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    expect(screen.getByTestId("yyc3-logo")).toBeInTheDocument();
    expect(screen.getByTestId("login-email-input")).toBeInTheDocument();
    expect(screen.getByTestId("login-password-input")).toBeInTheDocument();
    expect(screen.getByTestId("login-submit-button")).toBeInTheDocument();
  });

  it("should show ghost mode button when onGhostLogin is provided", () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} onGhostLogin={mockOnGhostLogin} />);

    const ghostButtons = screen.getAllByText(/GHOST MODE/i);
    expect(ghostButtons.length).toBeGreaterThan(0);
  });

  it("should not show ghost mode button when onGhostLogin is not provided", () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    expect(screen.queryByText(/GHOST MODE/i)).not.toBeInTheDocument();
  });

  it("should update email and password inputs", () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    const emailInput = screen.getByTestId("login-email-input");
    const passwordInput = screen.getByTestId("login-password-input");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  it("should toggle password visibility", () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    const passwordInput = screen.getByTestId("login-password-input");
    const toggleButton = screen.getByTestId("login-toggle-password");

    expect(passwordInput).toHaveAttribute("type", "password");

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "text");
  });

  it("should call onLoginSuccess on successful login", async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: {
        user: { id: "1", email: "test@example.com", role: "admin" as const, name: "Test User" },
        session: {
          user: { id: "1", email: "test@example.com", role: "admin" as const, name: "Test User" },
          token: "mock_token",
          expiresAt: Date.now() + 8 * 60 * 60 * 1000,
        },
      },
      error: null,
    });

    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    const emailInput = screen.getByTestId("login-email-input");
    const passwordInput = screen.getByTestId("login-password-input");
    const loginButton = screen.getByTestId("login-submit-button");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockOnLoginSuccess).toHaveBeenCalled();
    });
  });

  it("should show error message on login failure", async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: null,
      error: { message: "Invalid credentials" },
    });

    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    const emailInput = screen.getByTestId("login-email-input");
    const passwordInput = screen.getByTestId("login-password-input");
    const loginButton = screen.getByTestId("login-submit-button");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });
  });

  it("should disable login button during loading", async () => {
    let resolveLogin: any;
    vi.mocked(supabase.auth.signInWithPassword).mockImplementation(
      () => new Promise((resolve) => {
        resolveLogin = resolve;
      })
    );

    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    const emailInput = screen.getByTestId("login-email-input");
    const passwordInput = screen.getByTestId("login-password-input");
    const loginButton = screen.getByTestId("login-submit-button");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(loginButton);

    expect(loginButton).toBeDisabled();

    // Resolve the promise
    resolveLogin({ data: { user: { id: "1", email: "test@example.com", role: "admin" as const, name: "Test User" } }, error: null });
  });

  it("should call onGhostLogin when ghost mode is activated", async () => {
    render(
      <Login
        onLoginSuccess={mockOnLoginSuccess}
        onGhostLogin={mockOnGhostLogin}
      />
    );

    const ghostButtons = screen.getAllByText(/GHOST MODE/i);
    fireEvent.click(ghostButtons[0].closest("button")!);

    await waitFor(() => {
      expect(mockOnGhostLogin).toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  it("should prevent multiple ghost login activations", async () => {
    render(
      <Login
        onLoginSuccess={mockOnLoginSuccess}
        onGhostLogin={mockOnGhostLogin}
      />
    );

    const ghostButtons = screen.getAllByText(/GHOST MODE/i);
    const ghostButton = ghostButtons[0].closest("button")!;
    fireEvent.click(ghostButton);
    fireEvent.click(ghostButton);

    await waitFor(() => {
      expect(mockOnGhostLogin).toHaveBeenCalledTimes(1);
    }, { timeout: 1000 });
  });

  it("should clear error when ghost mode is activated", async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: null,
      error: { message: "Invalid credentials" },
    });

    render(
      <Login
        onLoginSuccess={mockOnLoginSuccess}
        onGhostLogin={mockOnGhostLogin}
      />
    );

    const emailInput = screen.getByTestId("login-email-input");
    const passwordInput = screen.getByTestId("login-password-input");
    const loginButton = screen.getByTestId("login-submit-button");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });

    const ghostButtons = screen.getAllByText(/GHOST MODE/i);
    fireEvent.click(ghostButtons[0].closest("button")!);

    await waitFor(() => {
      expect(screen.queryByText(/Invalid credentials/i)).not.toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it("should show network error on exception", async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockRejectedValue(new Error("Network error"));

    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    const emailInput = screen.getByTestId("login-email-input");
    const passwordInput = screen.getByTestId("login-password-input");
    const loginButton = screen.getByTestId("login-submit-button");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/登录失败，请检查网络连接/i)).toBeInTheDocument();
    });
  });

  it("should not submit form with empty fields", async () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    const loginButton = screen.getByTestId("login-submit-button");
    fireEvent.click(loginButton);

    expect(mockOnLoginSuccess).not.toHaveBeenCalled();
  });
});
