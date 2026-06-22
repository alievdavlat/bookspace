import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { motion } from "framer-motion";

describe("framer-motion", () => {
  it("renders a motion.div", () => {
    const { container } = render(<motion.div data-testid="m" />);
    expect(container.querySelector('[data-testid="m"]')).toBeTruthy();
  });
});
