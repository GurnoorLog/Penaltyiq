import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "../../components/Hero";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("Hero", () => {
  it("renders the landing page header (appears in header + footer)", () => {
    render(<Hero />);
    expect(screen.getAllByText("Perfect Your Penalty")).toHaveLength(2);
  });

  it("renders navigation links", () => {
    render(<Hero />);
    expect(screen.getByText("Features")).toBeInTheDocument();
    expect(screen.getByText("Science")).toBeInTheDocument();
    expect(screen.getByText("Pro Coaching")).toBeInTheDocument();
  });

  it("renders the tagline", () => {
    render(<Hero />);
    expect(screen.getByText("Master the Spot.")).toBeInTheDocument();
    expect(screen.getByText("Dominate the Keeper.")).toBeInTheDocument();
  });

  it("renders call-to-action buttons", () => {
    render(<Hero />);
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText("Sign Up")).toBeInTheDocument();
    expect(screen.getByText("Get Started Free")).toBeInTheDocument();
  });

  it("renders the Sign in with Google button", () => {
    render(<Hero />);
    expect(screen.getByText("Sign in with Google")).toBeInTheDocument();
  });

  it("Login button navigates to /demo", () => {
    render(<Hero />);
    screen.getByText("Login").click();
    expect(mockPush).toHaveBeenCalledWith("/demo");
  });

  it("Sign Up button navigates to /dashboard", () => {
    render(<Hero />);
    screen.getByText("Sign Up").click();
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });

  it("renders section headings", () => {
    render(<Hero />);
    expect(screen.getByText("IQ Coaching")).toBeInTheDocument();
    expect(screen.getByText("Global Leaderboard")).toBeInTheDocument();
    expect(screen.getByText("Scientific Method")).toBeInTheDocument();
  });

  it("renders stats", () => {
    render(<Hero />);
    expect(screen.getByText("88% Accuracy")).toBeInTheDocument();
  });
});
