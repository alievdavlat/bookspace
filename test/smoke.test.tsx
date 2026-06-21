import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

function Hello() {
  return <h1>Bookspace</h1>;
}

describe("smoke", () => {
  it("renders the brand name", () => {
    render(<Hello />);
    expect(screen.getByText("Bookspace")).toBeInTheDocument();
  });
});
