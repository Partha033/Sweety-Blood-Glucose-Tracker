import React from "react";
import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import GlucoseReadingForm from "../components/GlucoseReadingForm";

describe("GlucoseReadingForm Component Tests", () => {
  test("Displays error when glucose value is empty upon submission", () => {
    const handleSubmit = vi.fn();
    render(<GlucoseReadingForm onSubmit={handleSubmit} />);

    // Clear glucose input
    const input = screen.getByLabelText(/Glucose Value/i);
    fireEvent.change(input, { target: { value: "" } });

    // Click submit
    fireEvent.click(screen.getByRole("button", { name: /Save Reading/i }));

    expect(screen.getByText("Please enter a glucose value.")).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  test("Displays error when glucose value is below 40", () => {
    const handleSubmit = vi.fn();
    render(<GlucoseReadingForm onSubmit={handleSubmit} />);

    const input = screen.getByLabelText(/Glucose Value/i);
    fireEvent.change(input, { target: { value: "35" } });

    fireEvent.click(screen.getByRole("button", { name: /Save Reading/i }));

    expect(
      screen.getByText("Value must be between 40 and 600 mg/dl.")
    ).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  test("Displays error when glucose value is above 600", () => {
    const handleSubmit = vi.fn();
    render(<GlucoseReadingForm onSubmit={handleSubmit} />);

    const input = screen.getByLabelText(/Glucose Value/i);
    fireEvent.change(input, { target: { value: "650" } });

    fireEvent.click(screen.getByRole("button", { name: /Save Reading/i }));

    expect(
      screen.getByText("Value must be between 40 and 600 mg/dl.")
    ).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  test("Displays error when glucose value is a decimal number", () => {
    const handleSubmit = vi.fn();
    render(<GlucoseReadingForm onSubmit={handleSubmit} />);

    const input = screen.getByLabelText(/Glucose Value/i);
    fireEvent.change(input, { target: { value: "110.5" } });

    fireEvent.click(screen.getByRole("button", { name: /Save Reading/i }));

    expect(
      screen.getByText("Value must be between 40 and 600 mg/dl.")
    ).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  test("Displays error when date is in the future", () => {
    const handleSubmit = vi.fn();
    render(<GlucoseReadingForm onSubmit={handleSubmit} />);

    const dateInput = screen.getByLabelText(/Reading Date/i);
    fireEvent.change(dateInput, { target: { value: "2099-12-31" } });

    const valueInput = screen.getByLabelText(/Glucose Value/i);
    fireEvent.change(valueInput, { target: { value: "120" } });

    fireEvent.click(screen.getByRole("button", { name: /Save Reading/i }));

    expect(screen.getByText("Date cannot be in the future.")).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  test("Disables submit button and shows loading state while saving", () => {
    render(<GlucoseReadingForm onSubmit={vi.fn()} isSubmitting={true} />);

    const submitBtn = screen.getByRole("button", { name: /Saving.../i });
    expect(submitBtn).toBeDisabled();
  });

  test("Displays server validation error when passed", () => {
    render(
      <GlucoseReadingForm
        onSubmit={vi.fn()}
        serverError="You already have an After lunch reading for this date."
      />
    );

    expect(
      screen.getByText("You already have an After lunch reading for this date.")
    ).toBeInTheDocument();
  });

  test("Calls onSubmit with valid inputs", () => {
    const handleSubmit = vi.fn();
    render(<GlucoseReadingForm onSubmit={handleSubmit} />);

    const valueInput = screen.getByLabelText(/Glucose Value/i);
    fireEvent.change(valueInput, { target: { value: "115" } });

    const slotSelect = screen.getByLabelText(/Time Slot/i);
    fireEvent.change(slotSelect, { target: { value: "after_lunch" } });

    fireEvent.click(screen.getByRole("button", { name: /Save Reading/i }));

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        glucoseValue: 115,
        timeSlot: "after_lunch",
      })
    );
  });
});
