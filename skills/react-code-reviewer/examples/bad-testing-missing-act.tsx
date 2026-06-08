/**
 * Bad counterpart: test fires a click that triggers a state update
 * without `await`-ing `userEvent` or wrapping in `act`. The test
 * passes locally but the missing `act()` lets a real race slip
 * through, and the warning pollutes CI logs.
 */
import { render, fireEvent, screen } from "@testing-library/react";

function Toggle() {
  return null;
}

test("clicking the toggle updates the label", () => {
  render(<Toggle />);
  fireEvent.click(screen.getByRole("button"));
  expect(screen.getByText("on")).toBeInTheDocument();
});
