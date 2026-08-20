/**
 * @file: GlassCard.test.tsx
 * @description: GlassCard.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-03-31
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GlassCard } from "../modules/shared/GlassCard";

describe("GlassCard", () => {
  it("should render children correctly", () => {
    render(
      <GlassCard>
        <div>Test Content</div>
      </GlassCard>
    );

    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <GlassCard className="custom-class">
        <div>Content</div>
      </GlassCard>
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("should apply base glass styles", () => {
    const { container } = render(
      <GlassCard>
        <div>Content</div>
      </GlassCard>
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass("rounded-xl");
    expect(card).toHaveClass("backdrop-blur-xl");
  });

  it("should handle click events", () => {
    let clicked = false;
    const handleClick = () => {
      clicked = true;
    };

    render(
      <GlassCard onClick={handleClick}>
        <div>Clickable Content</div>
      </GlassCard>
    );

    fireEvent.click(screen.getByText("Clickable Content"));
    expect(clicked).toBe(true);
  });

  it("should apply cursor-pointer when onClick is provided", () => {
    const { container } = render(
      <GlassCard onClick={() => {}}>
        <div>Content</div>
      </GlassCard>
    );

    expect(container.firstChild).toHaveClass("cursor-pointer");
  });

  it("should apply custom glow color", () => {
    const { container } = render(
      <GlassCard glowColor="rgba(255,0,0,0.5)">
        <div>Content</div>
      </GlassCard>
    );

    const card = container.firstChild as HTMLElement;
    expect(card.style.boxShadow).toContain("rgba(255,0,0,0.5)");
  });

  it("should forward ref correctly", () => {
    const ref = { current: null as HTMLDivElement | null };

    render(
      <GlassCard ref={ref}>
        <div>Content</div>
      </GlassCard>
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("should pass through additional props", () => {
    const { container } = render(
      <GlassCard data-testid="glass-card" aria-label="Glass card component">
        <div>Content</div>
      </GlassCard>
    );

    const card = container.firstChild as HTMLElement;
    expect(card.getAttribute("data-testid")).toBe("glass-card");
    expect(card.getAttribute("aria-label")).toBe("Glass card component");
  });

  it("should merge custom style with glow color", () => {
    const { container } = render(
      <GlassCard glowColor="rgba(0,255,0,0.3)" style={{ padding: "20px" }}>
        <div>Content</div>
      </GlassCard>
    );

    const card = container.firstChild as HTMLElement;
    expect(card.style.padding).toBe("20px");
    expect(card.style.boxShadow).toContain("rgba(0,255,0,0.3)");
  });
});
