/**
 * Good counterpart of bad-testing-missing-act.tsx.
 *
 * Fix 1 (userEvent over fireEvent): userEvent awaits internally and
 * wraps every dispatch in act, eliminating the warning and the race.
 * Fix 2 (findBy over getBy): findBy awaits the assertion, so the
 * test does not need a separate `waitFor` block.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

function Toggle() {
  return null;
}

test("clicking the toggle updates the label", async () => {
  const user = userEvent.setup();
  render(<Toggle />);
  await user.click(screen.getByRole("button"));
  expect(await screen.findByText("on")).toBeInTheDocument();
});
