import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RulerCarousel, type CarouselItem } from "../../components/ui/ruler-carousel";

const items: CarouselItem[] = [
  { id: 1, title: "Messi" },
  { id: 2, title: "Haaland" },
  { id: 3, title: "Ronaldo" },
];

describe("RulerCarousel", () => {
  it("renders all items (triplicated for infinite scroll)", () => {
    render(<RulerCarousel originalItems={items} />);
    expect(screen.getAllByText("Messi")).toHaveLength(3);
    expect(screen.getAllByText("Haaland")).toHaveLength(3);
    expect(screen.getAllByText("Ronaldo")).toHaveLength(3);
  });

  it("renders page indicator (starts at page 2 with 3 items)", () => {
    render(<RulerCarousel originalItems={items} />);
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders Confirm Selection button", () => {
    render(<RulerCarousel originalItems={items} />);
    expect(screen.getByText("Confirm Selection")).toBeInTheDocument();
  });

  it("calls onSelect with the initially active item (Haaland = index 1)", () => {
    const onSelect = vi.fn();
    render(<RulerCarousel originalItems={items} onSelect={onSelect} />);

    screen.getByText("Confirm Selection").click();
    expect(onSelect).toHaveBeenCalledWith(items[1]);
  });

  it("has navigation buttons", () => {
    render(<RulerCarousel originalItems={items} />);
    expect(screen.getByLabelText("Previous item")).toBeInTheDocument();
    expect(screen.getByLabelText("Next item")).toBeInTheDocument();
  });
});
